import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "../services/email.service.js";
import crypto from "crypto";


// 1. REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // we dont use validation here - we are usning zod for it 
    // if (!email || !username || !password) {
    //     throw new ApiError(400, "All fields are required");
    // }

    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    //     throw new ApiError(400, "Invalid email format");
    // }

    // if (password.length < 6) {
    //     throw new ApiError(400, "Password must be at least 6 characters long");
    // }

    const existingUser = await User.findOne({
        $or: [{ email }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
        if (existingUser.email === email && existingUser.username === username.toLowerCase()) {
            throw new ApiError(400, "User with this email and username already exists");
        } else if (existingUser.email === email) {
            throw new ApiError(400, "Email is already registered. Please login instead");
        } else {
            throw new ApiError(400, "Username is already taken. Please choose another username");
        }
    }

    let avatarUrl = "";
    let avatarPublicId = "";

    if (req.file) {
        const avatar = await uploadOnCloudinary(req.file.buffer, "avatars");
        if (avatar) {
            avatarUrl = avatar.secure_url;
            avatarPublicId = avatar.public_id;
        }
    }

    const newUser = new User({
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl,
        avatarPublicId: avatarPublicId,
    });

    const verificationToken = newUser.generateEmailVerificationToken();
    await newUser.save();

    // email bhejo
    // try {
    //     await sendVerificationEmail(newUser.email, newUser.username, verificationToken);
    // } catch (err) {
    //     console.log(err)
    // }

    sendVerificationEmail(newUser.email, newUser.username, verificationToken)
        .then(() => console.log(`Verification email sent to: ${newUser.email}`))
        .catch((err) => console.error("Failed to send verification email:", err));

    const createdUser = await User.findById(newUser._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -refreshToken"
    );


    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully. Please check your email to verify your account.")
    );
});

// 2. LOGIN USER
export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // if (!(email || username)) {
    //     throw new ApiError(400, "Email or Username is required");
    // }

    // if (!password) {
    //     throw new ApiError(400, "Password is required");
    // }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });


    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password! Please try again");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email address before logging in");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                },
                "User logged in successfully"
            )
        );
});

// 3. LOGOUT USER
export const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("accessToken", accessTokenCookieOptions)
        .clearCookie("refreshToken", refreshTokenCookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// 4. CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword, confirmPassword } = req.body;

    // if (!currentPassword || !newPassword || !confirmPassword) {
    //     throw new ApiError(400, "All fields are required");
    // }

    // if (newPassword !== confirmPassword) {
    //     throw new ApiError(400, "New Password and Confirm Password do not match");
    // }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is wrong");
    }

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .clearCookie("accessToken", accessTokenCookieOptions)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// 5. REFRESH ACCESS TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid or expired refresh token");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
        .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

// 6. VERIFY EMAIL 
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    // Token ka SHA-256 hash banayein match karne ke liye
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Database me user dhoondein jiska token match ho aur expiry bachi ho
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    // User verify ho gaya!
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    // add welcome email logic here
    sendWelcomeEmail(user.email, user.username)
        .then(() => console.log(`Welcome email sent to: ${user.email}`))
        .catch((err) => console.error("Failed to send welcome email:", err));

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully! You can now log in.")
    );
});


// 7. FORGOT PASSWORD
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    // Generate reset token and save in DB
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
        await sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (err) {
        console.error("Failed to send reset email:", err);
        throw new ApiError(500, "Failed to send password reset email");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset link sent to your email successfully")
    );
});


// 8. RESET PASSWORD
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is required");
    }

    // Token ka SHA-256 hash match karein
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    }

    // Naya password set karein (pre('save') hook isko bcrypt hash karega)
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    user.refreshToken = undefined; // Invalidate all active refresh sessions for security

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password has been reset successfully! You can now log in with your new password.")
    );
});
