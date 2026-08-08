import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../../src/middlewares/errorHandler";
import { AppError } from "../../../src/utils/AppError";

const createMockResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    } as unknown as Response;

    (res.status as jest.Mock).mockReturnValue(res);

    return res;
};

describe("errorHandler", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return AppError status code and message", () => {

        const error = new AppError(
            "Usuario no encontrado",
            404
        );

        const req = {} as Request;
        const res = createMockResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "Usuario no encontrado",
            statusCode: 404,
        });
    });

    it("should return 500 for an unexpected error", () => {

        const error = new Error("Database connection failed");

        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const req = {} as Request;
        const res = createMockResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(error, req, res, next);

        expect(consoleErrorSpy).toHaveBeenCalledWith(error);

        expect(res.status).toHaveBeenCalledWith(
            undefined
        );

        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error",
            statusCode: 500,
        });

        consoleErrorSpy.mockRestore();
    });
});