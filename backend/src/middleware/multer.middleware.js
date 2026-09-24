import multer from "multer";
import path from "path";

// File ko server ki disk/filesystem par save karo.
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/temp");
//     },
//     filename: function (req, file, cb) {
//         // yahan hum random file name generate kar rahe hain 
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);

//         // Hum iska use yahan file ki extension nikalne ke liye kar rahe hain:
//         const extension = path.extname(file.originalname);

//         cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
//     },
// });


// File ko disk ke bajaye direct server memory (RAM Buffer) me rakho
const storage = multer.memoryStorage();

/// Jo storage configuration maine banaya hai, usko use karo.
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Max 10MB file limit
    },
});