import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: [
            'node_modules/**',
            'allure-results/**',
            'allure-report/**',
            'artifacts/**',
            'test-results/**',
        ],
    },

    js.configs.recommended,

    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: { ...globals.node },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

            // An unawaited Playwright call resolves after the step has already reported
            // success, so the assertion silently never runs. This is the single most common
            // way an automation suite turns green while testing nothing.
            'require-await': 'error',

            eqeqeq: ['error', 'always'],
            'no-console': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
        },
    },

    {
        // Step definitions and hooks rely on Cucumber's `this` (the World), so they must stay
        // `function` expressions. Arrow functions there silently lose the World and fail with
        // "cannot read property of undefined" at run time.
        files: ['step-definitions/**/*.js'],
        rules: {
            'func-names': 'off',
            'prefer-arrow-callback': 'off',
        },
    },

    {
        // The logger is the one place allowed to write to stdout; everything else goes
        // through it so that output stays attributable to a worker.
        files: ['support/logger.js', 'scripts/**/*.js'],
        rules: { 'no-console': 'off' },
    },

    // Must stay last: switches off every stylistic rule Prettier owns, so the two tools
    // cannot disagree about formatting.
    prettier,
];
