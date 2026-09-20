import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, folder = "notes") => {
    try {
        if (!localFilePath) {
            return null;
        }

        // Upload the file to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder,
        });

        console.log("Upload result:", uploadResult);

        // Optimize the uploaded file
        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
            fetch_format: "auto",
            quality: "auto",
        });

        console.log("Optimized URL:", optimizeUrl);

        return uploadResult;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    } finally {
        // Remove the locally stored file
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("deleted");
        }
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        // Delete file from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return null;
    }
};
