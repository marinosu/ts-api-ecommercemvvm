import { generateToken, verifyToken } from "../../../src/config/jwt";

describe("JWT", () => {

    it("should generate a valid JWT token", () => {

        // Arrange
        const payload = {
            id: 1,
            email: "admin@test.com"
        };

        // Act
        const token = generateToken(payload);

        // Assert
        expect(typeof token).toBe("string");
        expect(token.length).toBeGreaterThan(0);

    });

    it("should verify a generated token", () => {

        // Arrange
        const payload = {
            id: 1,
            email: "admin@test.com"
        };

        const token = generateToken(payload);

        // Act
        const decoded = verifyToken(token) as any;

        // Assert
        expect(decoded.id).toBe(payload.id);
        expect(decoded.email).toBe(payload.email);

    });

    /**
     * Casos Negativos
     */

    /** Token inválido */
    it("should throw an error when token is invalid", () => {

        // Arrange
        const invalidToken = "abc123";

        // Act & Assert
        expect(() => {
            verifyToken(invalidToken);
        }).toThrow();

    });

    /** Token vacío */
    it("should throw an error when token is empty", () => {

        expect(() => {
            verifyToken("");
        }).toThrow();

    });

    /** Token alterado */
    it("should throw an error when token has been modified", () => {

        const payload = {
            id: 10,
            email: "admin@test.com"
        };

        const token = generateToken(payload);

        const modifiedToken = token + "abc";

        expect(() => {
            verifyToken(modifiedToken);
        }).toThrow();

    });

    /** Payload vacío */
    it("should generate a token with an empty payload", () => {

        const token = generateToken({});

        expect(typeof token).toBe("string");

        expect(token.length).toBeGreaterThan(0);

    });
});