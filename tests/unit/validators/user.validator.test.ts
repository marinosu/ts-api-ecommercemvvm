import {
    createUserSchema,
    updateUserSchema
} from "../../../src/validators/user.validator";

describe("CreateUser Validator", () => {

    it("should validate a correct user", () => {

        const data = {
            name: "Juan",
            lastname: "Pérez",
            email: "juan@test.com",
            phone: "61234567",
            password: "123456"
        };

        const result = createUserSchema.safeParse(data);

        expect(result.success).toBe(true);

    });

    /** Ejemplo de prueba negativa */
    it("should reject short name", () => {

        const data = {
            name: "J",
            lastname: "Pérez",
            email: "juan@test.com",
            phone: "61234567",
            password: "123456"
        };

        const result = createUserSchema.safeParse(data);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues[0].message)
                .toBe("El nombre es obligatorio");
        }

    });

});

/** Para updateUserSchema, para saber el comportamiento .optional() */
describe("UpdateUser Validator", () => {

    it("should accept an empty object", () => {

        const result = updateUserSchema.safeParse({});

        expect(result.success).toBe(true);

    });

});