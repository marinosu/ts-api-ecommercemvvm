import type { Request, Response, NextFunction } from "express";
import { update, findById } from "../../../src/controllers/users.controller";
import * as userService from "../../../src/services/users.service";

jest.mock("../../../src/services/users.service", () => ({
    update: jest.fn(),
    findById: jest.fn(),
}));

const mockedUpdate = userService.update as jest.Mock;
const mockedFindById = userService.findById as jest.Mock;

const createMockResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    } as unknown as Response;

    (res.status as jest.Mock).mockReturnValue(res);

    return res;
};

describe("Users Controller", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findById", () => {

        it("should return 200 with user when service succeeds", async () => {

            const mockUser = {
                id: 1,
                name: "Marino",
                lastname: "Santos",
                email: "marino@test.com",
            };

            mockedFindById.mockResolvedValue(mockUser);

            const req = {
                params: {
                    id: "1",
                },
            } as unknown as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await findById(req, res, next);

            expect(mockedFindById).toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(mockUser);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next when findById service throws an error", async () => {

            const error = new Error("Usuario no encontrado");

            mockedFindById.mockRejectedValue(error);

            const req = {
                params: {
                    id: "999",
                },
            } as unknown as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await findById(req, res, next);

            expect(mockedFindById).toHaveBeenCalledWith(999);

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();

            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {

        it("should return 200 with updated user when service succeeds", async () => {

            const mockUser = {
                id: 1,
                name: "Marino",
                lastname: "Santos",
                phone: "60000000",
            };

            const mockFile = {
                filename: "profile.jpg",
                originalname: "profile.jpg",
                mimetype: "image/jpeg",
            } as Express.Multer.File;

            const requestBody = {
                name: "Marino",
                lastname: "Santos",
                phone: "60000000",
            };

            mockedUpdate.mockResolvedValue(mockUser);

            const req = {
                params: {
                    id: "1",
                },
                body: requestBody,
                file: mockFile,
            } as unknown as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await update(req, res, next);

            expect(mockedUpdate).toHaveBeenCalledWith(
                1,
                requestBody,
                mockFile
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(mockUser);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next when update service throws an error", async () => {

            const error = new Error("Usuario no encontrado");

            mockedUpdate.mockRejectedValue(error);

            const requestBody = {
                name: "Marino",
            };

            const req = {
                params: {
                    id: "999",
                },
                body: requestBody,
                file: undefined,
            } as unknown as Request;

            const res = createMockResponse();

            const next = jest.fn() as NextFunction;

            await update(req, res, next);

            expect(mockedUpdate).toHaveBeenCalledWith(
                999,
                requestBody,
                undefined
            );

            expect(next).toHaveBeenCalledWith(error);

            expect(res.status).not.toHaveBeenCalled();

            expect(res.json).not.toHaveBeenCalled();
        });
    });
});