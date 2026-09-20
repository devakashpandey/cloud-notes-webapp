import { Router } from "express";
import noteRouter from "./note.routes.js";
import authRouter from "./auth.routes.js";
import userRouter from "./user.route.js";


const router = Router();
router.use("/notes", noteRouter);
router.use("/auth", authRouter);
router.use("/", userRouter);

export default router;
