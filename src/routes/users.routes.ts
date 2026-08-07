import express from "express";
import { findById, update } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload.middleware";
import { validateBody } from "../middlewares/validateBody";
import { updateUserSchema } from "../validators/user.validator";

const router = express.Router();

router.get("/:id", authMiddleware, findById);
router.put("/upload/:id", authMiddleware, upload.single("file"), validateBody(updateUserSchema), update);

export default router;