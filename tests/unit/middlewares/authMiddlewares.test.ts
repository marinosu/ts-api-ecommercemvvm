import type { Response, NextFunction } from "express";
import {
    authMiddleware,
    type AuthRequest,
} from "../../../src/middlewares/authMiddleware";
import { verifyToken } from "../../../src/config/jwt";
import { AppError } from "../../../src/utils/AppError";

jest.mock("../../../src/config/jwt", () => ({
    verifyToken: jest.fn(),
}));

const mockedVerifyToken = verifyToken as jest.Mock;

describe("authMiddleware", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should throw 401 when authorization header is missing", () => {

        const req = {
            headers: {},
        } as AuthRequest;

        const res = {} as Response;

        const next = jest.fn() as NextFunction;

        expect(() => {
            authMiddleware(req, res, next);
        }).toThrow(
            "Token no proporcionado o no es válido"
        );

        expect(next).not.toHaveBeenCalled();

        expect(mockedVerifyToken).not.toHaveBeenCalled();
    });

    it("should throw 401 when authorization header does not use Bearer scheme", () => {

        const req = {
            headers: {
                authorization: "Basic abc123",
            },
        } as AuthRequest;

        const res = {} as Response;

        const next = jest.fn() as NextFunction;

        expect(() => {
            authMiddleware(req, res, next);
        }).toThrow(
            "Token no proporcionado o no es válido"
        );

        expect(next).not.toHaveBeenCalled();

        expect(mockedVerifyToken).not.toHaveBeenCalled();
    });

    it("should set authenticated user and call next when token is valid", () => {

        const decodedUser = {
            id: 1,
            email: "marino@test.com",
        };

        mockedVerifyToken.mockReturnValue(decodedUser);

        const req = {
            headers: {
                authorization: "Bearer valid-token",
            },
        } as AuthRequest;

        const res = {} as Response;

        const next = jest.fn() as NextFunction;

        authMiddleware(req, res, next);

        expect(mockedVerifyToken).toHaveBeenCalledWith(
            "valid-token"
        );

        expect(req.user).toEqual(decodedUser);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("should throw 401 when token verification fails", () => {

        mockedVerifyToken.mockImplementation(() => {
            throw new Error("Token expired");
        });

        const req = {
            headers: {
                authorization: "Bearer expired-token",
            },
        } as AuthRequest;

        const res = {} as Response;

        const next = jest.fn() as NextFunction;

        expect(() => {
            authMiddleware(req, res, next);
        }).toThrow(
            "Token no válido o expirado"
        );

        expect(mockedVerifyToken).toHaveBeenCalledWith(
            "expired-token"
        );

        expect(next).not.toHaveBeenCalled();
    });
});