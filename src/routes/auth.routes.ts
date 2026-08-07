import express from "express";
import { validateBody } from "../middlewares/validateBody";
import { loginSchema } from "../validators/auth.validator";
import { login, register } from "../controllers/auth.controller";
import { createUserSchema } from "../validators/user.validator";

const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(createUserSchema), register);

export default router;