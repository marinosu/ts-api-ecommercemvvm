import {
    findById,
    update,
} from "../../../src/services/users.service";

import { prisma } from "../../../src/database/prismaClient";
import { AppError } from "../../../src/utils/AppError";

/**
 * Mockeamos la base de datos Prisma
 */
jest.mock("../../../src/database/prismaClient", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedUpdate = prisma.user.update as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

/**
 * Este cubre findById()
 * cuando Prisma devuelve null.
 * -> findById(999)
 * -> Prisma MOCK
 * -> null
 * -> AppError 404
 */
it("should throw 404 when user does not exist", async () => {

    mockedFindUnique.mockResolvedValue(null);

    await expect(
        findById(999)
    ).rejects.toMatchObject({
        message: "Usuario no encontrado",
        statusCode: 404,
    });

    expect(mockedFindUnique).toHaveBeenCalledWith({
        where: {
            id: 999,
        },
    });

});

/**
 * Encontrar usuario correctamente
 * Simulamos que la base de datos devuelve un usaurio
 * -> password
 * -> NO debe regresar
 */
it("should return user data without password when user exists", async () => {

    const mockUser = {
        id: 1,
        name: "Marino",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "60000000",
        password: "hashed-password",
        image: null,
        notification_token: null,
    };

    mockedFindUnique.mockResolvedValue(mockUser);

    const result = await findById(1);

    expect(result).toEqual({
        id: 1,
        name: "Marino",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "60000000",
        image: null,
        notification_token: null,
    });

    expect(result).not.toHaveProperty("password");

    expect(mockedFindUnique).toHaveBeenCalledWith({
        where: {
            id: 1,
        },
    });

});

/**
 * Actualización de usuario inexistente
 * Cuando el usuario no existe
 * Comprobamos
 * -> findUnique()
 * -> null
 * -> 404
 * -> update() NO debe ejecutarse
 */
it("should throw 404 when updating a user that does not exist", async () => {

    mockedFindUnique.mockResolvedValue(null);

    await expect(
        update(
            999,
            {
                name: "Nuevo Nombre",
            }
        )
    ).rejects.toMatchObject({
        message: "Usuario no encontrado",
        statusCode: 404,
    });

    expect(mockedFindUnique).toHaveBeenCalledWith({
        where: {
            id: 999,
        },
    });

    expect(mockedUpdate).not.toHaveBeenCalled();

});

/**
 * Actualización exitosa
 */
it("should update user successfully", async () => {

    const existingUser = {
        id: 1,
        name: "Marino",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "60000000",
        password: "hashed-password",
        image: null,
        notification_token: null,
    };

    const updatedUser = {
        id: 1,
        name: "Marino Updated",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "61111111",
        password: "hashed-password",
        image: null,
        notification_token: null,
        roles: [
            {
                role: {
                    id: "CLIENT",
                    name: "Cliente",
                    route: "/client",
                    image: null,
                },
            },
        ],
    };

    mockedFindUnique.mockResolvedValue(existingUser);

    mockedUpdate.mockResolvedValue(updatedUser);

    const result = await update(
        1,
        {
            name: "Marino Updated",
            phone: "61111111",
        }
    );

    expect(result.name).toBe("Marino Updated");

    expect(result.phone).toBe("61111111");

    expect(result.roles).toEqual([
        {
            id: "CLIENT",
            name: "Cliente",
            route: "/client",
            image: null,
        },
    ]);

    expect(result).not.toHaveProperty("password");

    expect(mockedUpdate).toHaveBeenCalledTimes(1);

});