import { APIRequestContext } from "@playwright/test";

export class UsersApi {
    constructor(private request: APIRequestContext) {}

    async getUser(id: number, token: string) {
        return await this.request.get(`/users/${id}`, {
            headers: {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
            },
        });
    }

    async getUserWithoutToken(id: number) {
        return await this.request.get(`/users/${id}`);
    }

    async updateUser(
        id: number,
        token: string,
        data: {
            name?: string;
            lastname?: string;
            phone?: string;
        }
    ) {
        return await this.request.put(`/users/upload/${id}`, {
            headers: {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
            },
            multipart: {
                ...data,
            },
        });
    }
}