import { AppError } from "../../../src/utils/AppError";

describe("AppError", () => {

    it("should create an AppError with message and status code", () => {

        // Arrange
        const message = "Usuario no encontrado";
        const statusCode = 404;

        // Act
        const error = new AppError(message, statusCode);

        // Assert
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);

    });

    it("should use status code 500 by default", () => {

        // Arrange & Act
        const error = new AppError("Internal Error");

        // Assert
        expect(error.statusCode).toBe(500);

    });

    it("should be instance of Error", () => {

        const error = new AppError("Error");

        expect(error).toBeInstanceOf(Error);

    });

    it("should be instance of AppError", () => {

        const error = new AppError("Error");

        expect(error).toBeInstanceOf(AppError);

    });

});