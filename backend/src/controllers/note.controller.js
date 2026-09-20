import { Note } from "../models/note.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCache, setCache, invalidateUserNotesCache } from "../services/redisCache.service.js";
import { getIO } from "../socket/socket.js";



// Input
//  ↓
// Array hai? → clean array
//  ↓
// String hai?
//  ↓
// JSON array hai? → parse + clean
//  ↓
// Normal comma-separated string hai? → split + clean
//  ↓
// Output
// ["nodejs", "mongodb", "express"]

// parse tags helper function --------->
const parseTags = (tagsInput) => {
    if (!tagsInput) return [];

    // if tagsInput is array
    if (Array.isArray(tagsInput)) return tagsInput.map((t) => t.trim().toLowerCase()).filter(Boolean);

    // if tagsInput is string
    if (typeof tagsInput === "string") {
        try {
            // if tagsInput is json array string
            const parsed = JSON.parse(tagsInput);
            // if parsed is array then return cleaned array
            if (Array.isArray(parsed)) return parsed.map((t) => t.trim().toLowerCase()).filter(Boolean);
        } catch {
            // if tagsInput is comma separated string
            return tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
        }
    }
    return [];
};

// 1. create note api func --------->
export const createNewNote = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body;
    const userId = req?.user?._id;

    // if (!title) {
    //     throw new ApiError(400, "Title is required");
    // }
    const localFilePath = req.file?.path;
    let uploadedFile = null;
    if (localFilePath) {
        uploadedFile = await uploadOnCloudinary(localFilePath);
    }
    const note = await Note.create({
        title,
        description,
        imageUrl: uploadedFile?.secure_url || "",
        imagePublicId: uploadedFile?.public_id || "",
        tags: parseTags(tags),
        user: userId,
    });

    // invalidating (clear) user notes cache to fetch the updated data
    await invalidateUserNotesCache(userId);

    // socket.IO Isse us user ke open saare tabs/devices me naya note live add ho jayega
    try {
        getIO().to(`user:${userId}`).emit("note:created", note);
    } catch (socketErr) {
        console.error("[Socket.io Emit Error - Create Note]:", socketErr.message);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, note, "Note created successfully"));
});

// export const getNotes = asyncHandler(async (req, res) => {
//     const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
//     return res
//         .status(200)
//         .json(new ApiResponse(200, notes, "Notes fetched successfully"));
// });


// 2. get notes (Search, Filter, Sort, Pagination) ---->

export const getNotes = asyncHandler(async (req, res) => {
    const {
        search = "",
        tag = "",
        isPinned,
        startDate,
        endDate,
        sortBy = "createdAt",
        order = "desc",
        page = "1",
        limit = "9",
    } = req.query;

    const userId = req.user._id;

    // converting page and limit into number and validating them
    const pageNum = Math.max(1, Number(page) || 1);
    // min 1 and max 50
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 9));
    // total documents to skip
    const skip = (pageNum - 1) * limitNum;

    // 1. stable cache key
    const cacheKey = `notes:${userId}:${JSON.stringify({
        search,
        tag,
        isPinned,
        startDate,
        endDate,
        sortBy,
        order,
        page: pageNum,
        limit: limitNum,
    })}`;

    // 2. Check Redis Cache
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        console.log("⚡ [REDIS CACHE HIT]: Returning from cache");
        return res.status(200).json(
            new ApiResponse(
                200,
                cachedData,
                "Notes fetched successfully (from cache)"
            )
        );
    }

    console.log("🐢 [REDIS CACHE MISS]: Fetching from MongoDB...");

    // 3. MongoDB Filters
    const filterQuery = {
        user: userId,
    };

    // 4. search by title or description
    if (search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");

        filterQuery.$or = [
            { title: searchRegex },
            { description: searchRegex },
        ];
    }

    // 5. filter by tag 
    if (tag.trim() && tag.toLowerCase() !== "all") {
        filterQuery.tags = tag.trim().toLowerCase();
    }

    // 6. filter by pinned
    if (isPinned !== undefined && isPinned !== "") {
        filterQuery.isPinned = isPinned === "true";
    }

    // 7. filter by date range
    if (startDate || endDate) {
        filterQuery.createdAt = {};

        if (startDate) {
            filterQuery.createdAt.$gte = new Date(startDate);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filterQuery.createdAt.$lte = end;
        }
    }

    // 8. sort by createdAt, updatedAt, title
    const allowedSortFields = ["createdAt", "updatedAt", "title"];
    // if sort by is not in allowed fields then sort by createdAt
    const safeSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";

    const sortOptions = {
        isPinned: -1,
        [safeSortBy]: order === "asc" ? 1 : -1,
    };

    // 9. Fetch data
    const [notes, totalNotes, tags] = await Promise.all([
        Note.find(filterQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean(),

        Note.countDocuments(filterQuery),

        Note.distinct("tags", {
            user: userId,
        }),
    ]);

    // 10.total pages
    const totalPages = Math.max(
        1,
        Math.ceil(totalNotes / limitNum)
    );

    const responsePayload = {
        notes,
        // remove empty tags
        tags: tags.filter(Boolean),
        // pagination
        pagination: {
            totalNotes,
            totalPages,
            currentPage: pageNum,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
        },
    };

    // 11. Store response in Redis for 30 minutes
    await setCache(cacheKey, responsePayload, 1800);

    return res.status(200).json(
        new ApiResponse(
            200,
            responsePayload,
            "Notes fetched successfully"
        )
    );
});

// 3. delete note api func ------>
export const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userID = req.user._id;

    const note = await Note.findOneAndDelete({
        _id: id,
        user: userID,
    });

    if (!note) {
        throw new ApiError(404, "Note not found or unauthorized");
    }

    if (note.imagePublicId) {
        await deleteFromCloudinary(note.imagePublicId);
    }

    await invalidateUserNotesCache(userID);

    try {
        getIO().to(`user:${userID}`).emit("note:deleted", { id });
    } catch (socketErr) {
        console.error(" [Socket.io Emit Error - Delete Note]:", socketErr.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

// 4. update api func -------->
export const updateNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const note = await Note.findOne({ _id: id, user: req.user._id });
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    note.title = title ?? note.title;
    note.description = description ?? note.description;
    if (tags !== undefined) note.tags = parseTags(tags);

    if (req.file) {
        const image = await uploadOnCloudinary(req.file.path);
        if (image) {
            if (note.imagePublicId) {
                await deleteFromCloudinary(note.imagePublicId);
            }
            note.imageUrl = image.secure_url;
            note.imagePublicId = image.public_id;
        }
    }

    await note.save();

    await invalidateUserNotesCache(req.user._id);


    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note updated successfully"));
});


// 5. toggle pin note api func ------>
export const togglePinNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, user: req.user._id });
    if (!note) {
        throw new ApiError(404, "Note not found");
    }
    note.isPinned = !note.isPinned;
    await note.save();

    await invalidateUserNotesCache(req.user._id);

    try {
        getIO().to(`user:${req.user._id}`).emit("note:pinned", note);
    } catch (socketErr) {
        console.error("[Socket.io Emit Error - Pin Note]:", socketErr.message);
    }
    return res.status(200).json(
        new ApiResponse(200, note, `Note ${note.isPinned ? "pinned" : "unpinned"} successfully`)
    );
});





// this is testing apis 
// let notes = [];

// postman se post request send krne ke liye --->
// export const createNote = (req, res) => {
//     console.log(req.body);
//     notes.push(req.body); // notes array me add krne ke liye

//     // we send status code along with json response
//     res.status(201).json({
//         success: true,
//         message: "Note created successfully"
//     });
// };

// get request from postman from the body -->
// export const getNotes = (req, res) => {
//     return res.status(200).json({
//         success: true,
//         message: "Note fetched successfully",
//         data: notes
//     });
// };

// delete method --->
// export const deleteNote = (req, res) => {
//     const { id } = req.params;

//     // 1. Array se us id wale note ko hata do (filter karke)
//     // req.params.id string me hota hai, isliye Number(id) kiya hai taaki match ho sake
//     notes = notes.filter(note => note.id !== Number(id));

//     return res.status(200).json({
//         success: true,
//         message: "Note deleted successfully",
//     });
// };

// update method --->
// export const updateNote = (req, res) => {
//     const id = Number(req.params.id);

//     const { title, description } = req.body;

//     // pehle check karo ki note exists karta hai ya nhi
//     const note = notes.find(note => note.id === id);

//     // agar note nhi mila toh 404 status code bhej do
//     if (!note) {
//         return res.status(404).json({
//             success: false,
//             message: "Note not found"
//         });
//     }

//     // agar title ya description undefined nhi hai toh update karo
//     if (title !== undefined) note.title = title;
//     if (description !== undefined) note.description = description;

//     return res.status(200).json({
//         success: true,
//         message: "Note updated successfully",
//     });
// };


// get notes api func withoud custom api and response error -------->
// export const getNotes = async (req, res) => {
//     try {
//         // sort() method is used to sort the documents in ascending or descending order based on the specified field
//         const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });// find() method returns array of objects but findOne() method returns only object

//         // agr response me image id ya koi field bhejna ho ot yaha se add kr skte agr select : false kar rakha hai to 
//         // const note = await Note.findById(id).select("+imagePublicId");

//         return res.status(200).json({
//             success: true,
//             message: "Note fetched successfully",
//             data: notes
//         });

//     } catch (error) {
//         console.log(error);
//     }
// }
