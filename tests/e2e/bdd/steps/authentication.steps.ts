import dotenv from "dotenv";

dotenv.config();

import {
    Given,
    When,
    Then,
    Before,
    After,
} from "@cucumber/cucumber";

import {
    request,
    APIRequestContext,
    expect,
} from "@playwright/test";

import { AuthApi } from "../../api/pages/AuthApi";

let apiContext: APIRequestContext;
let authApi: AuthApi;

let response: any;
let responseBody: any;

let testEmail: string;
let testPassword = "Password123";

Before(async () => {

    //console.log("HOST:", process.env.HOST);
    //console.log("PORT:", process.env.PORT);

    apiContext = await request.newContext({
        baseURL: `http://${process.env.HOST}:${process.env.PORT}`,
    });

    authApi = new AuthApi(apiContext);
});

/*Before(async () => {

    apiContext = await request.newContext({
        baseURL: `http://${process.env.HOST}:${process.env.PORT}`,
    });

    authApi = new AuthApi(apiContext);

});*/

After(async () => {

    await apiContext.dispose();

});

/**
 * Escenario 1 - Registro
 */
Given("I have valid registration data", () => {

    testEmail = `bdd_${Date.now()}@example.com`;

});

When("I send a registration request", async () => {

    response = await authApi.register({
        name: "BDD",
        lastname: "Test",
        email: testEmail,
        phone: "60000000",
        password: testPassword,
    });

    responseBody = await response.json();

});

Then("the registration should be successful", () => {

    expect(response.status()).toBe(200);

    expect(responseBody).toBeDefined();

});

/**
 * Login exitoso
 */
Given("I have a registered user", async () => {

    testEmail = `bdd_login_${Date.now()}@example.com`;

    const registerResponse = await authApi.register({
        name: "BDD",
        lastname: "Login",
        email: testEmail,
        phone: "60000001",
        password: testPassword,
    });

    expect(registerResponse.status()).toBe(200);

});

When("I login with valid credentials", async () => {

    response = await authApi.login(
        testEmail,
        testPassword
    );

    responseBody = await response.json();

});

Then("I should receive an authentication token", () => {

    expect(response.status()).toBe(200);

    expect(responseBody).toHaveProperty("token");

    expect(responseBody.token).toContain("Bearer");

});

/**
 * Login con contraseña incorrecta
 */
When("I login with an invalid password", async () => {

    response = await authApi.login(
        testEmail,
        "WrongPassword123"
    );

    responseBody = await response.json();

});

Then(
    "the login should be rejected with status 401",
    () => {

        expect(response.status()).toBe(401);

    }
);

/**
 * Usuario inexistente
 */
Given(
    "I have credentials for a non existing user",
    () => {

        testEmail =
            `nonexistent_${Date.now()}@example.com`;

    }
);

When("I attempt to login", async () => {

    response = await authApi.login(
        testEmail,
        testPassword
    );

    responseBody = await response.json();

});

Then(
    "the login should be rejected with status 404",
    () => {

        expect(response.status()).toBe(404);

    }
);