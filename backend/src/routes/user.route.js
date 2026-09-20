import { Router } from "express";
import { getProfile, updateUserAvatar, updateUserDetails } from "../controllers/user.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { updateUserDetailsSchema } from "../validators/user.validators.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();
router.get("/get-user-profile", VerifyJWT, getProfile);
router.patch("/update-user-details", VerifyJWT, validate(updateUserDetailsSchema), updateUserDetails);
router.patch("/update-user-avatar", VerifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;