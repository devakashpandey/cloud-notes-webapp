import { Router } from "express";
import { registerUser, loginUser, logoutUser, changePassword, refreshAccessToken, verifyEmail, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validators.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";


const router = Router();

router.post("/register", authLimiter, upload.single("avatar"), validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser)
router.post("/change-password", VerifyJWT, validate(changePasswordSchema), changePassword)
router.post("/refresh-access-token", refreshAccessToken)
router.get("/verify-email/:token", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", authLimiter, validate(resetPasswordSchema), resetPassword);




export default router



