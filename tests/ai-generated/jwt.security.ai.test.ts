import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { generateToken, verifyToken } from "../../src/config/jwt";

/**
 * SECURITY TEST SUITE: JWT Token Validation & Authentication Middleware
 * Covers: Missing headers, malformed tokens, expired tokens, tampered tokens, invalid secrets
 */
describe("JWT Security - Authentication & Token Validation", () => {
    
    // Configuración de datos de prueba
    const validPayload = { id: "user123", email: "test@example.com" };
    const validToken = generateToken(validPayload);
    const invalidSecret = "wrong_secret_key";
    const baseRoute = "/api/protected"; // Ajusta según tu ruta protegida real
    
    // =====================================================
    // TEST 1: Missing Authorization Header
    // =====================================================
    describe("1. Missing Authorization Header", () => {
        test("should reject request with no Authorization header", async () => {
            const response = await request(app)
                .get(baseRoute)
                // Sin header Authorization
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no proporcionado|no válido|unauthorized/i
            );
        });
    });

    // =====================================================
    // TEST 2: Malformed Authorization Header - No Bearer Prefix
    // =====================================================
    describe("2. Malformed Authorization Header - Missing Bearer", () => {
        test("should reject token without 'Bearer ' prefix", async () => {
            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", validToken) // Sin "Bearer " prefix
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no proporcionado|no válido|bearer/i
            );
        });
    });

    // =====================================================
    // TEST 3: Malformed Authorization Header - Truncated Token
    // =====================================================
    describe("3. Truncated/Incomplete Token", () => {
        test("should reject truncated token (first half only)", async () => {
            const truncatedToken = validToken.substring(0, Math.floor(validToken.length / 2));
            
            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${truncatedToken}`)
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no válido|expirado|malformed/i
            );
        });
    });

    // =====================================================
    // TEST 4: Malformed Authorization Header - Random String
    // =====================================================
    describe("4. Random/Garbage String as Token", () => {
        test("should reject random string as token", async () => {
            const randomString = "randomgarbage123notavalidtoken456";
            
            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${randomString}`)
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no válido|expirado/i
            );
        });
    });

    // =====================================================
    // TEST 5: Expired JWT Token
    // =====================================================
    describe("5. Expired JWT Token", () => {
        test("should reject expired token (expiresIn: 0)", async () => {
            // Crear un token que expira inmediatamente
            const expiredToken = jwt.sign(validPayload, process.env.JWT_SECRET || "secret_key", { 
                expiresIn: "0s" // Expira al instante
            });

            // Esperar un pequeño delay para asegurar que expiró
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${expiredToken}`)
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /expirado|expired/i
            );
        });
    });

    // =====================================================
    // TEST 6: Token Signed with Wrong Secret
    // =====================================================
    describe("6. Token Signed with Invalid Secret", () => {
        test("should reject token signed with different secret", async () => {
            // Crear un token con un secreto diferente
            const maliciousToken = jwt.sign(validPayload, invalidSecret, { 
                expiresIn: "2d" 
            });

            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${maliciousToken}`)
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no válido|invalid/i
            );
        });
    });

    // =====================================================
    // TEST 7: Tampered Token Payload
    // =====================================================
    describe("7. Tampered/Modified Token Payload", () => {
        test("should reject token with altered payload", async () => {
            // Crear un token válido, decodificar y modificar payload
            const decoded = jwt.decode(validToken) as any;
            
            // Alterar el payload (cambiar email)
            const tamperedPayload = { 
                ...decoded, 
                email: "attacker@malicious.com",
                isAdmin: true // Inyectar privilegios
            };

            // Firmar con secreto incorrecto (simulando alteración)
            const tamperedToken = jwt.sign(tamperedPayload, invalidSecret, { 
                expiresIn: "2d" 
            });

            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${tamperedToken}`)
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no válido|invalid/i
            );
        });
    });

    // =====================================================
    // TEST 8: Null/Undefined Token Values
    // =====================================================
    describe("8. Null, Undefined, or Empty Token Values", () => {
        test("should reject empty string as token", async () => {
            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", "Bearer ")
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no válido|no proporcionado/i
            );
        });
    });

    // =====================================================
    // TEST 9: Payload Alterations - Adding Unauthorized Claims
    // =====================================================
    describe("9. Payload Alterations - Privilege Escalation Attempt", () => {
        test("should reject token with added admin/role claims", async () => {
            // Intentar crear un token con claims de administrador
            const maliciousPayload = {
                ...validPayload,
                isAdmin: true,
                role: "ADMIN",
                permissions: ["read", "write", "delete"]
            };

            // Firmar con secreto incorrecto (ya que el middleware verifica la firma)
            const escalationToken = jwt.sign(maliciousPayload, invalidSecret, { 
                expiresIn: "2d" 
            });

            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${escalationToken}`)
                .expect(401);

            expect(response.body.message || response.body.error).toMatch(
                /no válido|invalid/i
            );
        });
    });

    // =====================================================
    // CONTROL TESTS: Valid Token Scenarios (Happy Path)
    // =====================================================
    describe("Control Tests - Valid Authentication", () => {
        test("should allow request with valid Bearer token", async () => {
            const response = await request(app)
                .get(baseRoute)
                .set("Authorization", `Bearer ${validToken}`)
                .expect(200); // O el código que uses para éxito

            expect(response.body).toBeDefined();
        });
    });

    // =====================================================
    // UNIT TESTS: JWT Utility Functions
    // =====================================================
    describe("JWT Utility Functions - Unit Tests", () => {
        test("verifyToken should throw on tampered JWT", () => {
            const tamperedToken = jwt.sign(validPayload, invalidSecret, { 
                expiresIn: "2d" 
            });

            expect(() => {
                verifyToken(tamperedToken);
            }).toThrow();
        });

        test("verifyToken should throw on expired token", async () => {
            const expiredToken = jwt.sign(validPayload, process.env.JWT_SECRET || "secret_key", { 
                expiresIn: "0s" 
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(() => {
                verifyToken(expiredToken);
            }).toThrow();
        });
    });
});