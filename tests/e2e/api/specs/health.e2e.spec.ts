import { test, expect } from "@playwright/test";

test.describe("API Health Check", () => {

    test("should return API welcome message", async ({ request }) => {

        const response = await request.get("/");

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body).toEqual({
            message: "Bienvenido a la API con Node.JS",
        });
    });

});