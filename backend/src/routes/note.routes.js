import { Router } from "express";
import {
    createNewNote,
    deleteNote,
    getNotes,
    togglePinNote,
    updateNote,
} from "../controllers/note.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { createNoteSchema, updateNoteSchema } from "../validators/note.validators.js";
import { validate } from "../middleware/validate.middleware.js";


const router = Router();

router.route("/create-note").post(VerifyJWT, upload.single("image"), validate(createNoteSchema), createNewNote);
router.route("/get-notes").get(VerifyJWT, getNotes)
router.route("/:id").delete(VerifyJWT, deleteNote)
router.route("/:id").patch(VerifyJWT, upload.single("image"), validate(updateNoteSchema), updateNote)
router.route("/:id/pin").patch(VerifyJWT, togglePinNote);


export default router;



// this is testing routers ----
// postman se post request send krne ke liye
// router.post("/", createNote);

// get request from postman from the body ---
// router.get("/", getNotes);

// delete method --
// router.delete("/:id", deleteNote);

// patch method --
// router.patch("/:id", updateNote);