import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getProfile = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { username, email } = req.body;

    // if (!username && !email) {
    //     throw new ApiError(400, "Username or email is required to update");
    // }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User Details updated successfully"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const avatarLocalPath = req.file?.buffer;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const oldAvatarPublicId = user.avatarPublicId;
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath, "avatars");

    if (!uploadedAvatar?.secure_url) {
        throw new ApiError(500, "Error while uploading avatar to Cloudinary");
    }

    user.avatar = uploadedAvatar.secure_url;
    user.avatarPublicId = uploadedAvatar.public_id;

    await user.save({ validateBeforeSave: false });

    if (oldAvatarPublicId) {
        try {
            await deleteFromCloudinary(oldAvatarPublicId);
        } catch (error) {
            console.error("Failed to delete old avatar:", error);
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                avatarPublicId: user.avatarPublicId,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            "Avatar updated successfully"
        )
    );
});
