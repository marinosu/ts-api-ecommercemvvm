/**
 * Page Object para gestionar endpoints de Productos
 */
import { APIRequestContext } from "@playwright/test";

export class ProductsApi {
    constructor(private request: APIRequestContext) {}

    /**
     * Obtiene la lista completa de productos
     * GET /products
     */
    async getProducts(token?: string) {
        if (token) {
            return await this.request.get("/products", {
                headers: {
                    Authorization: token.startsWith("Bearer ")
                        ? token
                        : `Bearer ${token}`,
                },
            });
        }
        return await this.request.get("/products");
    }

    /**
     * Obtiene un producto por su ID
     * GET /products/:id
     */
    async getProductById(id: number, token?: string) {
        if (token) {
            return await this.request.get(`/products/${id}`, {
                headers: {
                    Authorization: token.startsWith("Bearer ")
                        ? token
                        : `Bearer ${token}`,
                },
            });
        }
        return await this.request.get(`/products/${id}`);
    }

    /**
     * Crea un nuevo producto
     * POST /products (requiere Bearer Token)
     */
    async createProduct(
        token: string,
        productData: {
            name: string;
            description?: string;
            price: number;
            stock?: number;
            category?: string;
            sku?: string;
        }
    ) {
        return await this.request.post("/products", {
            headers: {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
            },
            data: productData,
        });
    }

    /**
     * Elimina un producto por su ID
     * DELETE /products/:id (requiere Bearer Token)
     */
    async deleteProduct(id: number, token: string) {
        return await this.request.delete(`/products/${id}`, {
            headers: {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
            },
        });
    }

    /**
     * Actualiza un producto (bonus)
     * PUT /products/:id (requiere Bearer Token)
     */
    async updateProduct(
        id: number,
        token: string,
        productData: {
            name?: string;
            description?: string;
            price?: number;
            stock?: number;
            category?: string;
        }
    ) {
        return await this.request.put(`/products/${id}`, {
            headers: {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
            },
            data: productData,
        });
    }
}