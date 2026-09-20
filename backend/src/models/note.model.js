import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String, // Cloudinary image URL
        default: ""
    },
    imagePublicId: {
        type: String, // Cloudinary public_id (used to delete image from Cloudinary)
        default: "",
    },
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        }
    ],
    isPinned: {
        type: Boolean,
        default: false,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // this "User" is the name of the model (not the collection name)
        required: true,
    }

},
    {
        timestamps: true
    });


// Compound Index for 100x faster sorted queries & pin retrieval
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 }); // 1 ascending, -1 descending

// Text Index for fast title & description keyword search
noteSchema.index({ title: "text", description: "text" });

export const Note = mongoose.model("Note", noteSchema)