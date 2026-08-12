import { validateBody } from "../../../src/middlewares/validateBody";
import type { Response } from "express";
import { z } from "zod";

const createMockResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    };

    res.status.mockReturnValue(res);

    return res as unknown as Response;
};

describe("validateBody", () => {

    it("should call next when request body is valid", () => {

        const schema = z.object({
            name: z.string().min(2),
        });

        const middleware = validateBody(schema);

        const req = {
            body: {
                name: "Marino",
            },
        } as any;

        const res = createMockResponse();

        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            name: "Marino",
        });

    });

    it("should return 400 when request body is invalid", () => {

        const schema = z.object({
            name: z.string().min(2),
        });

        const middleware = validateBody(schema);

        const req = {
            body: {
                name: "A",
            },
        } as any;

        const res = createMockResponse();

        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(next).not.toHaveBeenCalled();

    });

    it("should return validation error message when body is invalid", () => {

        const schema = z.object({
            name: z.string().min(2, {
                message: "El nombre debe tener al menos 2 caracteres",
            }),
        });

        const middleware = validateBody(schema);

        const req = {
            body: {
                name: "A",
            },
        } as any;

        const res = createMockResponse();

        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "El nombre debe tener al menos 2 caracteres",
            statusCode: 400,
        });

    });

    /** Múltiples errores */
    it("should return an array when multiple validation errors exist", () => {

        const schema = z.object({
            name: z.string().min(2, {
                message: "Nombre inválido",
            }),
            email: z.string().email({
                message: "Email inválido",
            }),
        });

        const middleware = validateBody(schema);

        const req = {
            body: {
                name: "A",
                email: "correo-invalido",
            },
        } as any;

        const res = createMockResponse();

        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: [
                "Nombre inválido",
                "Email inválido",
            ],
            statusCode: 400,
        });

        expect(next).not.toHaveBeenCalled();

    });

    /** Verifica que zod actualiza */
    it("should replace request body with validated data", () => {

        const schema = z.object({
            name: z.string(),
        });

        const middleware = validateBody(schema);

        const req = {
            body: {
                name: "Marino",
            },
        } as any;

        const res = createMockResponse();

        const next = jest.fn();

        middleware(req, res, next);

        expect(req.body).toEqual({
            name: "Marino",
        });

        expect(next).toHaveBeenCalledTimes(1);

    });
});