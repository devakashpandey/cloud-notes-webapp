import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// this function for the disk storage
// export const uploadOnCloudinary = async (localFilePath, folder = "notes") => {
//     try {
//         if (!localFilePath) {
//             return null;
//         }

//         // Upload the file to Cloudinary
//         const uploadResult = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto",
//             folder,
//         });

//         console.log("Upload result:", uploadResult);

//         // Optimize the uploaded file
//         const optimizeUrl = cloudinary.url(uploadResult.public_id, {
//             fetch_format: "auto",
//             quality: "auto",
//         });

//         console.log("Optimized URL:", optimizeUrl);

//         return uploadResult;
//     } catch (error) {
//         console.error("Cloudinary upload error:", error);
//         return null;
//     } finally {
//         // Remove the locally stored file
//         if (localFilePath && fs.existsSync(localFilePath)) {
//             fs.unlinkSync(localFilePath);
//             console.log("deleted");
//         }
//     }
// };


export const uploadOnCloudinary = async (fileBuffer, folder = "notes") => {
    try {
        if (!fileBuffer) return null;
        // Buffer ko direct Cloudinary par stream karein (No disk I/O)
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    folder: folder,
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary stream upload error:", error);
                        return reject(error);
                    }
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
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
