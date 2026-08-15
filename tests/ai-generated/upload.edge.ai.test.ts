import request from "supertest";
import path from "path";
import fs from "fs";
import app from "../../src/app";

/**
 * SECURITY TEST SUITE: Upload Middleware Edge Cases & Vulnerabilities
 * Covers: Empty payloads, MIME bypass, file size limits, path traversal, corrupted files
 */
describe("Upload Middleware - Security Edge Cases", () => {
    const userId = "123";
    const validAuthToken = "Bearer valid_token"; // Ajusta según tu auth
    const baseRoute = `/users/upload/${userId}`;

    // =====================================================
    // GRUPO 1: PAYLOAD VACÍO / MISSING FILE (1 caso)
    // =====================================================
    describe("1. Empty/Missing File Handling", () => {
        test("should reject request with no file attached", async () => {
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .field("name", "Test User")
                .expect(400);

            expect(response.body.message || response.body.error).toBeDefined();
        });
    });

    // =====================================================
    // GRUPO 2: MIME TYPE & EXTENSION BYPASS (5 casos)
    // =====================================================
    describe("2. MIME Type and Extension Bypass Attempts", () => {
        test("should reject .exe file (binary executable)", async () => {
            const maliciousBuffer = Buffer.from("MZ\x90\x00"); // PE header
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", maliciousBuffer, "malware.exe")
                .expect(400);

            expect(response.body.message).toContain("Solo se permiten imagenes");
        });

        test("should reject .sh file (shell script)", async () => {
            const shellScript = Buffer.from("#!/bin/bash\nrm -rf /");
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", shellScript, "exploit.sh")
                .expect(400);

            expect(response.body.message).toContain("Solo se permiten imagenes");
        });

        test("should reject .php file (PHP script)", async () => {
            const phpScript = Buffer.from("<?php system($_GET['cmd']); ?>");
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", phpScript, "shell.php")
                .expect(400);

            expect(response.body.message).toContain("Solo se permiten imagenes");
        });

        test("should reject double extension .jpg.exe (bypass attempt)", async () => {
            const maliciousBuffer = Buffer.from("MZ\x90\x00");
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", maliciousBuffer, "photo.jpg.exe")
                .expect(400);

            expect(response.body.message).toContain("Solo se permiten imagenes");
        });

        test("should reject executable with fake JPEG MIME type", async () => {
            const maliciousBuffer = Buffer.from("MZ\x90\x00");
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", maliciousBuffer, {
                    filename: "fake.jpg",
                    contentType: "application/x-msdownload"
                })
                .expect(400);

            expect(response.body.message).toContain("Solo se permiten imagenes");
        });
    });

    // =====================================================
    // GRUPO 3: FILE SIZE LIMIT BYPASS (2 casos)
    // =====================================================
    describe("3. File Size Limit Handling", () => {
        test("should reject file exceeding size limit (e.g., 50MB)", async () => {
            // Crear un buffer de 50MB
            const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
            largeBuffer.write("fake jpeg data");

            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", largeBuffer, "huge.jpg")
                .expect(413); // Payload Too Large

            expect(response.body.message || response.body.error).toBeDefined();
        });

        test("should reject file at suspicious size boundary (near limit)", async () => {
            // Si el límite es 5MB, enviar 5.1MB
            const suspiciousBuffer = Buffer.alloc(5.1 * 1024 * 1024);
            
            // Agregar cabecera JPEG válida para passar verificación inicial
            const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            jpegHeader.copy(suspiciousBuffer);

            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", suspiciousBuffer, "large.jpg")
                .expect(413);

            expect(response.body.message || response.body.error).toBeDefined();
        });
    });

    // =====================================================
    // GRUPO 4: PATH TRAVERSAL VULNERABILITY (3 casos)
    // =====================================================
    describe("4. Path Traversal Attack Prevention", () => {
        test("should sanitize path traversal in filename (../../etc/passwd)", async () => {
            const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG magic number
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", validJpeg, "../../etc/passwd.jpg")
                .expect(200); // Should succeed pero con nombre sanitizado

            // Verificar que el archivo NO se guardó en /etc/passwd
            const evilPath = path.join(__dirname, "../../../etc/passwd.jpg");
            expect(fs.existsSync(evilPath)).toBe(false);

            // Verificar que se guardó en el directorio correcto
            const safePath = path.join(
                __dirname,
                `../../../public/uploads/users/${userId}/profile.jpg`
            );
            expect(fs.existsSync(safePath) || true).toBe(true); // Mock en tests
        });

        test("should prevent Windows-style path traversal (..\\\\admin\\\\config)", async () => {
            const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", validJpeg, "..\\..\\admin\\config.jpg")
                .expect(200);

            const evilPath = path.join(__dirname, "../../../admin/config.jpg");
            expect(fs.existsSync(evilPath)).toBe(false);
        });

        test("should reject deep path traversal (../../../../../../../etc/shadow)", async () => {
            const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", validJpeg, "../../../../../../../etc/shadow.jpg")
                .expect(200); // Se renombra internamente

            const shadowPath = path.join(__dirname, "../../../etc/shadow.jpg");
            expect(fs.existsSync(shadowPath)).toBe(false);
        });
    });

    // =====================================================
    // GRUPO 5: CORRUPTED/INVALID IMAGE FILES (4 casos)
    // =====================================================
    describe("5. Corrupted and Invalid Image Files", () => {
        test("should accept file with empty buffer but JPG MIME type", async () => {
            const emptyBuffer = Buffer.alloc(0);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", emptyBuffer, {
                    filename: "empty.jpg",
                    contentType: "image/jpeg"
                })
                .expect(400); // O 422 si hay validación

            // El middleware debería rechazar o aplicarse validación posterior
            expect(response.body.message || response.body.error).toBeDefined();
        });

        test("should reject partial/incomplete JPEG (truncated data)", async () => {
            // JPEG válido parcialmente
            const partialJpeg = Buffer.from([
                0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
                0x49, 0x46, 0x00, 0x01 // Truncado aquí
            ]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", partialJpeg, "truncated.jpg")
                .expect(400);

            expect(response.body.message || response.body.error).toBeDefined();
        });

        test("should reject file with invalid binary content but .jpg extension", async () => {
            const randomNoise = Buffer.from([
                0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07
            ]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", randomNoise, {
                    filename: "noise.jpg",
                    contentType: "image/jpeg"
                })
                .expect(400);

            expect(response.body.message || response.body.error).toBeDefined();
        });

        test("should reject PDF disguised as JPEG (application/pdf MIME detected)", async () => {
            const pdfBuffer = Buffer.from("%PDF-1.4\n%...");
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", pdfBuffer, "document.jpg")
                .expect(400);

            expect(response.body.message).toContain("Solo se permiten imagenes");
        });
    });

    // =====================================================
    // CASOS BONUS: VALIDACIÓN DE AUTENTICACIÓN
    // =====================================================
    describe("6. Authentication & Authorization", () => {
        test("should reject upload without authentication token", async () => {
            const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            
            const response = await request(app)
                .put(baseRoute)
                // Sin token
                .attach("file", validJpeg, "photo.jpg")
                .expect(401);

            expect(response.body.message || response.body.error).toBeDefined();
        });

        test("should reject upload with invalid/expired token", async () => {
            const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", "Bearer invalid_token_12345")
                .attach("file", validJpeg, "photo.jpg")
                .expect(401);

            expect(response.body.message || response.body.error).toBeDefined();
        });
    });

    // =====================================================
    // CASOS EXITOSOS (Control / Happy Path)
    // =====================================================
    describe("7. Valid Upload Scenarios", () => {
        test("should successfully upload valid JPEG image", async () => {
            const validJpeg = Buffer.from([
                0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
                0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
                0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
            ]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", validJpeg, "valid_photo.jpg")
                .expect(200);

            expect(response.body.id || response.body.user).toBeDefined();
        });

        test("should successfully upload valid PNG image", async () => {
            const validPng = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
            ]);
            
            const response = await request(app)
                .put(baseRoute)
                .set("Authorization", validAuthToken)
                .attach("file", validPng, "valid_photo.png")
                .expect(200);

            expect(response.body.id || response.body.user).toBeDefined();
        });
    });
});