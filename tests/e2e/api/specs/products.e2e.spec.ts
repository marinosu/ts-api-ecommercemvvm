import { test, expect } from "@playwright/test";
import { AuthApi } from "../pages/AuthApi";

test.describe("E2E API Workflow — Autenticación", () => {
    let authApi: AuthApi;

    test.beforeAll(async () => {
        // El request se puede crear dentro del test para evitar
        // problemas con el fixture de Playwright.
    });

    test("Debería autenticar correctamente al usuario", async ({ request }) => {
        authApi = new AuthApi(request);

        const loginRes = await authApi.login(
            "msant@gmail.com",
            "123456"
        );

        expect(loginRes.status()).toBe(200);

        const body = await loginRes.json();

        expect(body.token).toBeDefined();
        expect(body.token).toMatch(/^Bearer\s/);

        expect(body.user).toBeDefined();
        expect(body.user.id).toBeDefined();
        expect(body.user.email).toBeDefined();

        console.log("Usuario autenticado:", body.user);
    });
});