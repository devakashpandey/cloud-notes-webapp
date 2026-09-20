import { User } from "../models/user.model.js";

export const generateAccessAndRefreshTokens = async (userId) => {
    try {

        // find user by id
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // generate tokens from user model methods
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // save refresh token in database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new Error(error.message || "Error while generating tokens");
    }
};
