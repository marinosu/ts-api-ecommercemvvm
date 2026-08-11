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
import { UsersApi } from "../../api/pages/UsersApi";

let apiContext: APIRequestContext;

let authApi: AuthApi;
let usersApi: UsersApi;

let response: any;
let responseBody: any;

let token: string;
let userId: number;

let testEmail: string;
const testPassword = "Password123";


Before(async () => {

    apiContext = await request.newContext({
        baseURL: `http://${process.env.HOST}:${process.env.PORT}`,
    });

    authApi = new AuthApi(apiContext);
    usersApi = new UsersApi(apiContext);

});


After(async () => {

    await apiContext.dispose();

});


Given("I have an authenticated user", async () => {

    testEmail = `bdd_user_${Date.now()}@example.com`;

    // Registrar usuario
    const registerResponse = await authApi.register({
        name: "BDD",
        lastname: "User",
        email: testEmail,
        phone: "60000002",
        password: testPassword,
    });

    expect(registerResponse.status()).toBe(200);


    // Login
    const loginResponse = await authApi.login(
        testEmail,
        testPassword
    );

    expect(loginResponse.status()).toBe(200);


    const loginBody = await loginResponse.json();

    token = loginBody.token;

    userId = loginBody.user.id;

    //console.log("TOKEN BDD:", token);
    //console.log("LOGIN BODY:", loginBody);
});


When("I request the user information", async () => {

    response = await usersApi.getUser(
        userId,
        token
    );

    responseBody = await response.json();

});


Then(
    "I should receive the user information successfully",
    () => {

        expect(response.status()).toBe(200);

        expect(responseBody).toHaveProperty(
            "id",
            userId
        );

        expect(responseBody).toHaveProperty(
            "email",
            testEmail
        );

        expect(responseBody).not.toHaveProperty(
            "password"
        );

    }
);


When("I update the user information", async () => {

    response = await usersApi.updateUser(
        userId,
        token,
        {
            name: "BDD Updated",
            lastname: "User Updated",
            phone: "61111111",
        }
    );

    responseBody = await response.json();

});


Then(
    "the user information should be updated successfully",
    () => {

        expect(response.status()).toBe(200);

        expect(responseBody).toHaveProperty(
            "id",
            userId
        );

        expect(responseBody.name).toBe(
            "BDD Updated"
        );

        expect(responseBody.lastname).toBe(
            "User Updated"
        );

        expect(responseBody.phone).toBe(
            "61111111"
        );

        expect(responseBody).not.toHaveProperty(
            "password"
        );

    }
);