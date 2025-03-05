import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
        coverageDirectory: 'coverage',
        testMatch: ['**/tests/**/*.test.(ts|tsx)'],
        // verbose: true,
        // fakeTimers: {
        //     legacyFakeTimers: true
        // }
        testEnvironment: 'jsdom',
        transform: {
            '^.+\\.(ts|tsx)$': 'ts-jest'
        },
        fakeTimers: {
            legacyFakeTimers: true
        }
    };
};
