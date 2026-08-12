module.exports = {
    default: {
        paths: [
            "tests/e2e/bdd/features/**/*.feature"
        ],
        require: [
            "tests/e2e/bdd/steps/**/*.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress"
        ]
    }
};