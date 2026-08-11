import { test, expect } from "@playwright/test";
import { AuthApi } from "../pages/AuthApi";
import { UsersApi } from "../pages/UsersApi";

test.describe("Users API", () => {

    test("should get user by id successfully", async ({ request }) => {

        const authApi = new AuthApi(request);
        const usersApi = new UsersApi(request);

        const email = `e2e_user_${Date.now()}@example.com`;

        // 1. Registrar usuario
        const registerResponse = await authApi.register({
            name: "Marino",
            lastname: "Santos",
            email,
            phone: "66389090",
            password: "123456",
        });

        expect(registerResponse.status()).toBe(200);

        const registeredUser = await registerResponse.json();

        // 2. Login
        const loginResponse = await authApi.login(
            email,
            "123456"
        );

        expect(loginResponse.status()).toBe(200);

        const loginBody = await loginResponse.json();

        expect(loginBody).toHaveProperty("token");
        expect(loginBody).toHaveProperty("user");

        const token = loginBody.token.replace("Bearer ", "");

        const userId = loginBody.user.id;

        // 3. Obtener usuario
        const response = await usersApi.getUser(
            userId,
            token
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body).toHaveProperty("id");
        expect(body.email).toBe(email);

        // El password nunca debe regresar
        expect(body).not.toHaveProperty("password");
    });

    /**
     * Test sin autenticacion
     * prueba router.get("/:id", authMiddleware, findById);
     */
    test("should reject request without authentication", async ({ request }) => {

        const usersApi = new UsersApi(request);

        const response = await usersApi.getUserWithoutToken(1);

        expect(response.status()).toBe(401);
    });

    /**
     * Usuario inexistente
     * Aquí también necesitamos un JWT válido
     * corresponde al servicio
     * if (!user) {
     *   throw new AppError("Usuario no encontrado", 404);
     * }
     */
    test("should return 404 when user does not exist", async ({ request }) => {

        const authApi = new AuthApi(request);
        const usersApi = new UsersApi(request);

        const email = `e2e_notfound_${Date.now()}@example.com`;

        const registerResponse = await authApi.register({
            name: "Marino",
            lastname: "Santos",
            email,
            phone: "66389090",
            password: "123456",
        });

        expect(registerResponse.status()).toBe(200);

        const loginResponse = await authApi.login(
            email,
            "123456"
        );

        expect(loginResponse.status()).toBe(200);

        const loginBody = await loginResponse.json();

        const token = loginBody.token.replace("Bearer ", "");

        // ID que probablemente no existe
        const response = await usersApi.getUser(
            999999999,
            token
        );

        expect(response.status()).toBe(404);

        const body = await response.json();

        expect(body.message).toBe("Usuario no encontrado");
    });

    /**
     * Actualizar usuario sin archivo
     */
    test("should update user successfully", async ({ request }) => {

        const authApi = new AuthApi(request);
        const usersApi = new UsersApi(request);

        const email = `e2e_update_${Date.now()}@example.com`;

        // Registrar
        const registerResponse = await authApi.register({
            name: "Marino",
            lastname: "Santos",
            email,
            phone: "66389090",
            password: "123456",
        });

        expect(registerResponse.status()).toBe(200);

        // Login
        const loginResponse = await authApi.login(
            email,
            "123456"
        );

        expect(loginResponse.status()).toBe(200);

        const loginBody = await loginResponse.json();

        const token = loginBody.token.replace("Bearer ", "");
        const userId = loginBody.user.id;

        // Actualizar
        const response = await usersApi.updateUser(
            userId,
            token,
            {
                name: "Marino Actualizado",
                lastname: "Santos",
                phone: "69999999",
            }
        );

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.name).toBe("Marino Actualizado");
        expect(body.lastname).toBe("Santos");
        expect(body.phone).toBe("69999999");

        expect(body).not.toHaveProperty("password");
    });

    /**
     * Actualizar sin autenticación
     */
    test("should reject update without authentication", async ({ request }) => {

        const usersApi = new UsersApi(request);

        const response = await usersApi.updateUser(
            1,
            "",
            {
                name: "Sin Autorización",
            }
        );

        expect(response.status()).toBe(401);
    });
});