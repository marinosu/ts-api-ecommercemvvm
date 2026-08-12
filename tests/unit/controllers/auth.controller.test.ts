import type { Request, Response, NextFunction } from "express";
import { register, login } from "../../../src/controllers/auth.controller";
import * as authService from "../../../src/services/auth.service";

jest.mock("../../../src/services/auth.service", () => ({
    register: jest.fn(),
    loginUser: jest.fn(),
}));

const mockedRegister = authService.register as jest.Mock;
const mockedLoginUser = authService.loginUser as jest.Mock;

const createMockResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    } as unknown as Response;

    (res.status as jest.Mock).mockReturnValue(res);

    return res;
};

describe("Auth Controller", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("register", () => {

        it("should return 200 with registration result when service succeeds", async () => {

            const mockResult = {
                token: "Bearer mock-token",
                user: {
                    id: 1,
                    name: "Marino",
                    email: "marino@test.com",
                },
            };

            mockedRegister.mockResolvedValue(mockResult);

            const req = {
                body: {
                    name: "Marino",
                    lastname: "Santos",
                    email: "marino@test.com",
                    phone: "60000000",
                    password: "Password123",
                },
            } as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await register(req, res, next);

            expect(mockedRegister).toHaveBeenCalledWith(req.body);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(mockResult);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next when registration service throws an error", async () => {

            const error = new Error("Registration failed");

            mockedRegister.mockRejectedValue(error);

            const req = {
                body: {
                    name: "Marino",
                    lastname: "Santos",
                    email: "marino@test.com",
                    phone: "60000000",
                    password: "Password123",
                },
            } as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();

            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {

        it("should return 200 with login result when service succeeds", async () => {

            const mockResult = {
                token: "Bearer mock-token",
                user: {
                    id: 1,
                    email: "marino@test.com",
                },
            };

            mockedLoginUser.mockResolvedValue(mockResult);

            const req = {
                body: {
                    email: "marino@test.com",
                    password: "Password123",
                },
            } as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await login(req, res, next);

            expect(mockedLoginUser).toHaveBeenCalledWith(req.body);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(mockResult);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next when login service throws an error", async () => {

            const error = new Error("Invalid credentials");

            mockedLoginUser.mockRejectedValue(error);

            const req = {
                body: {
                    email: "marino@test.com",
                    password: "WrongPassword",
                },
            } as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();

            expect(res.json).not.toHaveBeenCalled();
        });
    });
});