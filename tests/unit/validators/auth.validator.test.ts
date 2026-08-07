import { loginSchema } from "../../../src/validators/auth.validator";

describe("Login Validator", () => {

    it("should validate correct login data", () => {

        // Arrange

        const data = {

            email: "admin@test.com",

            password: "123456"

        };

        // Act

        const result = loginSchema.safeParse(data);

        // Assert

        expect(result.success).toBe(true);

    });

    /** Correo malo */
    it("should reject invalid email", () => {

        const data = {

            email: "admin",

            password: "123456"

        };

        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Formato de correo no válido");
        }

    });

    /** Password corto */
    it("should reject passwords shorter than six characters", () => {

        const data = {

            email: "admin@test.com",

            password: "123"

        };

        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Minimo 6 caracteres");
        }

    });

    /** Correo y Password malos */
    it("should reject invalid email and short password", () => {

        const data = {

            email: "abc",

            password: "1"

        };

        const result = loginSchema.safeParse(data);

        expect(result.success).toBe(false);

    });

});