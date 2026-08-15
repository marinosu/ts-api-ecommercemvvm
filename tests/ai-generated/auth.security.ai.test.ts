// tests/ai-generated/auth.security.test.ts
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database/prismaClient";

describe("🔐 PENETRATION TEST SUITE - AUTH SECURITY", () => {
  
  // ============================================
  // TEST GROUP 1: SQL/NoSQL INJECTION (2 tests)
  // ============================================
  describe("1️⃣ SQL/NoSQL Injection Prevention", () => {
    it("should prevent SQL injection through email field in register", async () => {
      const sqlInjectionPayloads = [
        "test@example.com' OR '1'='1",
        "test@example.com'; DROP TABLE users; --",
        "test@example.com\" OR 1=1 --",
      ];

      for (const maliciousEmail of sqlInjectionPayloads) {
        const response = await request(app)
          .post("/auth/register")
          .send({
            name: "John",
            lastname: "Doe",
            email: maliciousEmail,
            phone: "+1234567890",
            password: "SecurePass123!",
          });

        expect(response.status).toBe(400);
      }
    });

    it("should prevent NoSQL injection patterns in login email", async () => {
      const noSqlPayloads = [
        '{"$gt": ""}',
        '{"$regex": ".*"}',
      ];

      for (const payload of noSqlPayloads) {
        const response = await request(app)
          .post("/auth/login")
          .send({
            email: payload,
            password: "SecurePass123!",
          });

        expect(response.status).toBe(400);
      }
    });
  });

  // ============================================
  // TEST GROUP 2: DoS PREVENTION (2 tests)
  // ============================================
  describe("2️⃣ DoS Prevention - Extreme Password Length", () => {
    it("should reject extremely long passwords (10,000 chars) to prevent hashing DoS", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Test",
          lastname: "User",
          email: `dos-${Date.now()}@example.com`,
          phone: "+1234567890",
          password: "a".repeat(10000),
        });

      expect(response.status).toBe(400);
    });

    it("should reject moderately long passwords (129 chars) exceeding reasonable limits", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Test",
          lastname: "User",
          email: `dos-long-${Date.now()}@example.com`,
          phone: "+1234567890",
          password: "a".repeat(129),
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // TEST GROUP 3: TYPE COERCION BYPASS (2 tests)
  // ============================================
  describe("3️⃣ Type Coercion Bypass Prevention", () => {
    it("should reject non-string email values (number type coercion attack)", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "John",
          lastname: "Doe",
          email: 12345, // ⚠️ number instead of string
          phone: "+1234567890",
          password: "SecurePass123!",
        });

      expect(response.status).toBe(400);
    });

    it("should reject null/empty password values", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "John",
          lastname: "Doe",
          email: `test-${Date.now()}@example.com`,
          phone: "+1234567890",
          password: null,
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // TEST GROUP 4: MALFORMED JSON PAYLOADS (3 tests)
  // ============================================
  describe("4️⃣ Malformed JSON Payload Prevention", () => {
    it("should reject completely empty request body in register", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({});

      expect(response.status).toBe(400);
    });

    it("should reject missing required fields in register (partial payload)", async () => {
      const incompletePayloads = [
        { name: "John" },
        { email: `test-${Date.now()}@example.com` },
        { name: "John", email: `test-${Date.now()}@example.com` },
      ];

      for (const payload of incompletePayloads) {
        const response = await request(app)
          .post("/auth/register")
          .send(payload);

        expect(response.status).toBe(400);
      }
    });

    it("should reject extremely long field values (10,000 chars in name)", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "a".repeat(10000),
          lastname: "Doe",
          email: `long-${Date.now()}@example.com`,
          phone: "+1234567890",
          password: "SecurePass123!",
        });

      // Expect rejection or 413 Payload Too Large
      expect([400, 413]).toContain(response.status);
    });
  });

  // ============================================
  // TEST GROUP 5: PRIVILEGE ESCALATION (1 test)
  // ============================================
  describe("5️⃣ Privilege Escalation Prevention", () => {
    it("should prevent role/admin field injection in register payload", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "John",
          lastname: "Doe",
          email: `admin-inject-${Date.now()}@example.com`,
          phone: "+1234567890",
          password: "SecurePass123!",
          roles: [{ id: "ADMIN" }],
          isAdmin: true,
        });

      // If accepted, verify injected fields were NOT persisted
      if (response.status === 200) {
        const user = response.body.user;
        expect(user.isAdmin).toBeUndefined();
        expect(user.roles?.[0]?.id).not.toBe("ADMIN");
      }
    });
  });

  // ============================================
  // TEST GROUP 6: EMAIL NORMALIZATION (1 test)
  // ============================================
  describe("6️⃣ Email Normalization & Duplicate Prevention", () => {
    it("should normalize email case and reject duplicate registrations", async () => {
      const baseEmail = `normalize-test-${Date.now()}@example.com`;
      const emailVariations = [
        baseEmail,
        baseEmail.toUpperCase(),
        "  " + baseEmail, // Spaces
      ];

      let successCount = 0;

      for (const email of emailVariations) {
        const response = await request(app)
          .post("/auth/register")
          .send({
            name: "Test",
            lastname: "User",
            email: email,
            phone: "+1234567890",
            password: "SecurePass123!",
          });

        if (response.status === 200) {
          successCount++;
        }
      }

      // ⚠️ CRITICAL: Only ONE account should be created
      expect(successCount).toBeLessThanOrEqual(1);
    });
  });

  // ============================================
  // CLEANUP
  // ============================================
  afterAll(async () => {
    await prisma.$disconnect();
  });
});