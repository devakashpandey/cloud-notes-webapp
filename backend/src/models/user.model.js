import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {

        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            min: 6
        },

        avatar: {
            type: String,

        },
        avatarPublicId: {
            type: String,

        },
        refreshToken: {
            type: String,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationExpiry: {
            type: Date,
        },
        forgotPasswordToken: {
            type: String,
        },
        forgotPasswordExpiry: {
            type: Date,
        },


    },
    {
        timestamps: true
    }
)

// hash password before save

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);

})

// check password validity
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// generate access token 
// jwt.sign(
//     payload,
//     secret,
//     options
// )
userSchema.methods.generateAccessToken = function () {

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        throw new Error("ACCESS_TOKEN_SECRET not set in environment");
    }

    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// generate refresh token 
userSchema.methods.generateRefreshToken = function () {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error("REFRESH_TOKEN_SECRET not set in environment");
    }
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};


// Temporary Email Verification Token generate karne ke liye
userSchema.methods.generateEmailVerificationToken = function () {
    const unHashedToken = crypto.randomBytes(32).toString("hex");

    // DB me hash save karenge
    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    // 24 hours expiry
    this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;

    // Actual unhashed token return karenge jo email link me jayega
    return unHashedToken;
};

// Password Reset Token generate karne ke liye
userSchema.methods.generatePasswordResetToken = function () {
    const unHashedToken = crypto.randomBytes(32).toString("hex");

    // DB me hash save karenge
    this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    // 15 minutes validity
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    // Plain token return karenge jo email me jayega
    return unHashedToken;
};




export const User = mongoose.model("User", userSchema)    