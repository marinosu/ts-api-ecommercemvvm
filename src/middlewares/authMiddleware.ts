import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../config/jwt";

export interface AuthRequest extends Request {
    user?: any
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Token no proporcionado o no es válido", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        /**
         * token tiene valor, úsalo como string, if (!token)
         */
        const decoded = verifyToken(token!);
        req.user = decoded;
        next();
    } catch(err) {
        throw new AppError("Token no válido o expirado", 401);
    }
}