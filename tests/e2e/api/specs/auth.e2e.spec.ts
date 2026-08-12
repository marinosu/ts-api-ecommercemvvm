/**
 * Test de Autenticación
 */
import { test, expect } from "@playwright/test";
import { AuthApi } from "../pages/AuthApi";

test.describe("Authentication API", () => {

    /**
     * Login Exitoso
     */
    test("should register a new user successfully", async ({ request }) => {

        const authApi = new AuthApi(request);

        /**
         * Con Date.now() cada ejecución utiliza un correo diferente
         */
        const uniqueEmail = `e2e_${Date.now()}@example.com`;

        const response = await authApi.register({
            name: "Marino",
            lastname: "Santos",
            email: uniqueEmail,
            phone: "66389090",
            password: "123456",
        });

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body).toBeDefined();
    });

    /**
     * Login con contraseña incorrecta
     */
    test("should login successfully with valid credentials", async ({ request }) => {

        const authApi = new AuthApi(request);

        const uniqueEmail = `e2e_login_${Date.now()}@example.com`;
        const password = "123456";

        // Registrar usuario
        const registerResponse = await authApi.register({
            name: "Marino",
            lastname: "Santos",
            email: uniqueEmail,
            phone: "66389090",
            password,
        });

        expect(registerResponse.status()).toBe(200);

        // Login
        const loginResponse = await authApi.login(
            uniqueEmail,
            password
        );

        expect(loginResponse.status()).toBe(200);

        const body = await loginResponse.json();

        expect(body).toHaveProperty("token");
        expect(body).toHaveProperty("user");
    });

    /**
     * Password es incorrecto
     */
    test("should reject login with incorrect password", async ({ request }) => {

        const authApi = new AuthApi(request);

        const uniqueEmail = `e2e_wrong_password_${Date.now()}@example.com`;
        const password = "123456";

        const registerResponse = await authApi.register({
            name: "Marino",
            lastname: "Santos",
            email: uniqueEmail,
            phone: "66389090",
            password,
        });

        expect(registerResponse.status()).toBe(200);

        const loginResponse = await authApi.login(
            uniqueEmail,
            "wrong-password"
        );

        expect(loginResponse.status()).toBe(401);
    });

    /**
     * Login con usuario inexistente
     */
    test("should reject login when user does not exist", async ({ request }) => {

        const authApi = new AuthApi(request);

        const loginResponse = await authApi.login(
            `nonexistent_${Date.now()}@example.com`,
            "123456"
        );

        expect(loginResponse.status()).toBe(404);
    });

    /**
     * Login con email inválido
     */
    test("should reject login with invalid email", async ({ request }) => {

        const authApi = new AuthApi(request);

        const response = await authApi.login(
            "correo-invalido",
            "123456"
        );

        expect(response.status()).toBe(400);
    });

    /**
     * Login con campos faltantes
     */
    test("should reject login when required fields are missing", async ({ request }) => {

        const authApi = new AuthApi(request);

        const response = await authApi.loginWithData({
            email: "usuario@example.com",
        });

        expect(response.status()).toBe(400);
    });
});