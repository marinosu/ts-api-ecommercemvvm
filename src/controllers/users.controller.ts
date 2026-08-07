import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/users.service";

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const file = req.file;
        const user = await userService.update(id, data, file);
        return res.status(200).json(user);
    } catch(err) {
        next(err);
    }
}

export const findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await userService.findById(Number(id));
        return res.status(200).json(user);
    } catch(err) {
        next(err);
    }
}