import type { Config } from "jest";
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
    testEnvironment: "node",

    transform: {
        ...tsJestTransformCfg,
    },

    testMatch: [
        "**/tests/unit/**/*.test.ts",
    ],

    collectCoverageFrom: [
        "src/**/*.ts",

        /**
         * Archivos de infraestructura
         */
        "!src/server.ts",
        "!src/app.ts",
        "!src/database/prismaClient.ts",

        /**
         * Rutas serán cubiertas posteriormente mediante E2E/API tests
         */
        "!src/routes/**",

        /**
         * Código generado automáticamente por Prisma
         */
        "!src/generated/**",
    ],

    coverageDirectory: "reports/coverage",

    coverageReporters: [
        "text",
        "text-summary",
        "html",
        "lcov",
    ],

    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    clearMocks: true,
};

export default config;