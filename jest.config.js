const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {

    testEnvironment: "node",

    transform: {
        ...tsJestTransformCfg,
    },

    testMatch: [
        "**/tests/unit/**/*.test.ts"
    ],

    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/server.ts",
        "!src/app.ts"
    ],

    coverageDirectory: "reports/coverage",

    clearMocks: true,

};