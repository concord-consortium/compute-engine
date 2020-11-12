module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ['lcov'],
    coverageDirectory: '../coverage',
    roots: ['<rootDir>/../test', '<rootDir>/../dist'],
    reporters: ['jest-silent-reporter'],
    globals: {
        'ts-jest': {
            tsConfig: {
                module: 'system',
            },
        },
    },
};
