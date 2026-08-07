import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import usersRouter from "./routes/users.routes";
import authRouter from "./routes/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenido a la API con Node.JS"
    });
});

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(errorHandler);

export default app;