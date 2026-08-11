/**
 * Esto será nuestro equivalente al PAGE OBJECT MODEL, pero para la API
 */
import { APIRequestContext } from "@playwright/test";

export class AuthApi {

    constructor(private request: APIRequestContext) {}

    async register(userData: any) {
        return await this.request.post("/auth/register", {
            data: userData,
        });
    }

    async login(email: string, password: string) {
        return await this.request.post("/auth/login", {
            data: {
                email,
                password,
            },
        });
    }

    async loginWithData(data: any) {
        return await this.request.post("/auth/login", {
            data,
        });
    }
}