import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.register(req.body);
        return res.status(200).json(result);
    } catch(err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.loginUser(req.body);
        return res.status(200).json(result);
    } catch(err) {
        next(err);
    }
}