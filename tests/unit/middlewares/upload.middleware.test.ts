import path from "path";

const diskStorageMock = jest.fn();
const mkdirSyncMock = jest.fn();

jest.mock("multer", () => {

    const multer: any = jest.fn((options: any) => ({
        options,
        single: jest.fn(),
    }));

    multer.diskStorage = diskStorageMock;

    return multer;
});

jest.mock("fs", () => ({
    mkdirSync: mkdirSyncMock,
}));

describe("upload middleware", () => {
    let uploadConfig: any;
    let storageConfig: any;

    beforeEach(() => {
        jest.clearAllMocks();

        diskStorageMock.mockImplementation((config) => {
            storageConfig = config;
            return config;
        });

        jest.resetModules();

        const multerModule = require(
            "../../../src/middlewares/upload.middleware"
        );

        uploadConfig = multerModule.upload
            ? multerModule.upload
            : undefined;
    });

    describe("fileFilter", () => {

        it("should accept JPEG images", () => {

            const file = {
                mimetype: "image/jpeg",
            } as Express.Multer.File;

            const cb = jest.fn();

            uploadConfig.options.fileFilter(
                {},
                file,
                cb
            );

            expect(cb).toHaveBeenCalledWith(
                null,
                true
            );
        });

        it("should accept PNG images", () => {

            const file = {
                mimetype: "image/png",
            } as Express.Multer.File;

            const cb = jest.fn();

            uploadConfig.options.fileFilter(
                {},
                file,
                cb
            );

            expect(cb).toHaveBeenCalledWith(
                null,
                true
            );
        });

        it("should accept JPG images", () => {

            const file = {
                mimetype: "image/jpg",
            } as Express.Multer.File;

            const cb = jest.fn();

            uploadConfig.options.fileFilter(
                {},
                file,
                cb
            );

            expect(cb).toHaveBeenCalledWith(
                null,
                true
            );
        });

        it("should reject unsupported file types", () => {

            const file = {
                mimetype: "application/pdf",
            } as Express.Multer.File;

            const cb = jest.fn();

            uploadConfig.options.fileFilter(
                {},
                file,
                cb
            );

            expect(cb).toHaveBeenCalledWith(
                expect.any(Error)
            );

            expect(cb.mock.calls[0][0].message).toBe(
                "Solo se permiten imagenes JPEG, PNG, JPG"
            );
        });

    });

    describe("filename", () => {

        it("should generate profile filename preserving JPG extension", () => {

            const file = {
                originalname: "foto.jpg",
            } as Express.Multer.File;

            const cb = jest.fn();

            storageConfig.filename(
                {},
                file,
                cb
            );

            expect(cb).toHaveBeenCalledWith(
                null,
                "profile.jpg"
            );
        });

        it("should generate profile filename preserving PNG extension", () => {

            const file = {
                originalname: "foto.png",
            } as Express.Multer.File;

            const cb = jest.fn();

            storageConfig.filename(
                {},
                file,
                cb
            );

            expect(cb).toHaveBeenCalledWith(
                null,
                "profile.png"
            );
        });

    });

    describe("destination", () => {

        it("should create the user upload directory", () => {

            const req = {
                params: {
                    id: "123",
                },
            } as any;

            const file = {} as Express.Multer.File;

            const cb = jest.fn();

            storageConfig.destination(
                req,
                file,
                cb
            );

            expect(mkdirSyncMock).toHaveBeenCalledWith(
                expect.stringContaining(
                    path.join(
                        "public",
                        "uploads",
                        "users",
                        "123"
                    )
                ),
                {
                    recursive: true,
                }
            );

            expect(cb).toHaveBeenCalledWith(
                null,
                expect.stringContaining(
                    path.join(
                        "public",
                        "uploads",
                        "users",
                        "123"
                    )
                )
            );
        });

    });
});