import { 
    loginUser,
    register 
} from "../../../src/services/auth.service";
import { prisma } from "../../../src/database/prismaClient";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../src/config/jwt";
import { AppError } from "../../../src/utils/AppError";

jest.mock("../../../src/database/prismaClient", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },

        role: {
            findUnique: jest.fn(),
        },

        userHasRole: {
            create: jest.fn(),
        },

        $transaction: jest.fn(),
    },
}));

jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

jest.mock("../../../src/config/jwt", () => ({
    generateToken: jest.fn(),
}));

/**
 * Aquí tenemos tres dependencias externas mockeadas
 * Prisma
 * bcrypct
 * JWT
 */
const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedUserCreate = prisma.user.create as jest.Mock;
const mockedRoleFindUnique = prisma.role.findUnique as jest.Mock;
const mockedUserHasRoleCreate = prisma.userHasRole.create as jest.Mock;

const mockedTransaction = prisma.$transaction as jest.Mock;

const mockedCompare = bcrypt.compare as jest.Mock;
const mockedHash = bcrypt.hash as jest.Mock;

const mockedGenerateToken = generateToken as jest.Mock;

/**
 * Limpia los mocks
 */
beforeEach(() => {
    jest.clearAllMocks();
});

/**
 * Vamos a simular Prisma -> null
 * -> prisma.user.findUnique()
 * -> null
 * -> AppError 404
 */
it("should throw 404 when user does not exist", async () => {

    mockedFindUnique.mockResolvedValue(null);

    await expect(
        loginUser({
            email: "usuario@test.com",
            password: "Password123",
        })
    ).rejects.toMatchObject({
        message: "Usuario no encontrado",
        statusCode: 404,
    });

    expect(mockedFindUnique).toHaveBeenCalledTimes(1);

    expect(mockedCompare).not.toHaveBeenCalled();

});

/**
 * Simulamos que Prisma encuentra un usuario
 * Tenemos
 * -> Prisma MOCK
 * -> usuario encontrado
 * -> bcrypt MOCK
 * -> false
 * -> 401
 */
it("should throw 401 when password is incorrect", async () => {

    const mockUser = {
        id: 1,
        name: "Marino",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "60000000",
        password: "hashed-password",
        image: null,
        notification_token: null,
        roles: [],
    };

    mockedFindUnique.mockResolvedValue(mockUser);

    mockedCompare.mockResolvedValue(false);

    await expect(
        loginUser({
            email: "marino@test.com",
            password: "WrongPassword",
        })
    ).rejects.toMatchObject({
        message: "Contraseña incorrecta",
        statusCode: 401,
    });

    expect(mockedFindUnique).toHaveBeenCalledTimes(1);

    expect(mockedCompare).toHaveBeenCalledWith(
        "WrongPassword",
        "hashed-password"
    );

    expect(mockedGenerateToken).not.toHaveBeenCalled();

});

/**
 * Login exitoso
 * ° Prisma fue mockeado
 * ° bcrypt fue mockeado
 * ° JWT fue mockeado
 * ° El password no se devuelve
 * ° Los roles se transforma correctamente
 * ° Se genera el token esperado
 */
it("should return token and user data when login is successful", async () => {

    const mockUser = {
        id: 1,
        name: "Marino",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "60000000",
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

    mockedFindUnique.mockResolvedValue(mockUser);

    mockedCompare.mockResolvedValue(true);

    mockedGenerateToken.mockReturnValue("mock-jwt-token");

    const result = await loginUser({
        email: "marino@test.com",
        password: "Password123",
    });

    expect(result.token).toBe("Bearer mock-jwt-token");

    expect(result.user.id).toBe(1);

    expect(result.user.email).toBe("marino@test.com");

    expect(result.user.roles).toEqual([
        {
            id: "CLIENT",
            name: "Cliente",
            route: "/client",
            image: null,
        },
    ]);

    expect(result.user).not.toHaveProperty("password");

    expect(mockedGenerateToken).toHaveBeenCalledWith({
        id: 1,
        email: "marino@test.com",
    });

});

/**
 * Verificar qué recibió Prisma
 * ¿El servicio llamó correctamente a su dependencia?
 */
it("should search user by email during login", async () => {

    const mockUser = {
        id: 1,
        name: "Marino",
        lastname: "Santos",
        email: "marino@test.com",
        phone: "60000000",
        password: "hashed-password",
        image: null,
        notification_token: null,
        roles: [],
    };

    mockedFindUnique.mockResolvedValue(mockUser);

    mockedCompare.mockResolvedValue(true);

    mockedGenerateToken.mockReturnValue("mock-token");

    await loginUser({
        email: "marino@test.com",
        password: "Password123",
    });

    expect(mockedFindUnique).toHaveBeenCalledWith({
        where: {
            email: "marino@test.com",
        },
        include: {
            roles: {
                include: {
                    role: true,
                },
            },
        },
    });

});

/**
 * Registro exitoso
 */
describe("register", () => {

    it("should register a user successfully and return a token", async () => {

        mockedHash.mockResolvedValue("hashed-password");

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

        const mockRole = {
            id: "CLIENT",
            name: "Cliente",
            route: "/client",
            image: null,
        };

        mockedUserCreate.mockResolvedValue(mockUser);

        mockedRoleFindUnique.mockResolvedValue(mockRole);

        mockedUserHasRoleCreate.mockResolvedValue({
            id_user: 1,
            id_rol: "CLIENT",
        });

        mockedGenerateToken.mockReturnValue("mock-register-token");

        mockedTransaction.mockImplementation(async (callback: any) => {
            return callback({
                user: {
                    create: mockedUserCreate,
                },
                role: {
                    findUnique: mockedRoleFindUnique,
                },
                userHasRole: {
                    create: mockedUserHasRoleCreate,
                },
            });
        });

        const result = await register({
            name: "Marino",
            lastname: "Santos",
            email: "marino@test.com",
            phone: "60000000",
            password: "Password123",
        });

        expect(result.token).toBe("Bearer mock-register-token");

        expect(result.user).toEqual({
            id: 1,
            name: "Marino",
            lastname: "Santos",
            email: "marino@test.com",
            phone: "60000000",
            image: null,
            notification_token: null,
            roles: [
                {
                    id: "CLIENT",
                    name: "Cliente",
                    route: "/client",
                    image: null,
                },
            ],
        });

        expect(mockedHash).toHaveBeenCalledWith(
            "Password123",
            10
        );

        expect(mockedGenerateToken).toHaveBeenCalledWith({
            id: 1,
            email: "marino@test.com",
        });
    });

    /**
     * Usuario creado correctamente
     */
    it("should create the user with the hashed password", async () => {

        mockedHash.mockResolvedValue("hashed-password");

        const mockUser = {
            id: 2,
            name: "Juan",
            lastname: "Perez",
            email: "juan@test.com",
            phone: "61111111",
            password: "hashed-password",
            image: null,
            notification_token: null,
        };

        const mockRole = {
            id: "CLIENT",
            name: "Cliente",
            route: "/client",
            image: null,
        };

        mockedUserCreate.mockResolvedValue(mockUser);
        mockedRoleFindUnique.mockResolvedValue(mockRole);

        mockedUserHasRoleCreate.mockResolvedValue({});

        mockedGenerateToken.mockReturnValue("token");

        mockedTransaction.mockImplementation(async (callback: any) => {
            return callback({
                user: {
                    create: mockedUserCreate,
                },
                role: {
                    findUnique: mockedRoleFindUnique,
                },
                userHasRole: {
                    create: mockedUserHasRoleCreate,
                },
            });
        });

        await register({
            name: "Juan",
            lastname: "Perez",
            email: "juan@test.com",
            phone: "61111111",
            password: "Password123",
        });

        expect(mockedUserCreate).toHaveBeenCalledWith({
            data: {
                name: "Juan",
                lastname: "Perez",
                email: "juan@test.com",
                phone: "61111111",
                password: "hashed-password",
            },
        });
    });

    /**
     * Rol CLIENT inexistente
     */
    it("should throw 404 when CLIENT role does not exist", async () => {

        mockedHash.mockResolvedValue("hashed-password");

        mockedUserCreate.mockResolvedValue({
            id: 1,
            name: "Marino",
            lastname: "Santos",
            email: "marino@test.com",
            phone: "60000000",
            password: "hashed-password",
            image: null,
            notification_token: null,
        });

        mockedRoleFindUnique.mockResolvedValue(null);

        mockedTransaction.mockImplementation(async (callback: any) => {
            return callback({
                user: {
                    create: mockedUserCreate,
                },
                role: {
                    findUnique: mockedRoleFindUnique,
                },
                userHasRole: {
                    create: mockedUserHasRoleCreate,
                },
            });
        });

        await expect(
            register({
                name: "Marino",
                lastname: "Santos",
                email: "marino@test.com",
                phone: "60000000",
                password: "Password123",
            })
        ).rejects.toMatchObject({
            message: "El rol del cliente no existe",
            statusCode: 404,
        });

        expect(mockedUserHasRoleCreate).not.toHaveBeenCalled();
        expect(mockedGenerateToken).not.toHaveBeenCalled();
    });
});