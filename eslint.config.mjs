import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    js.configs.recommended,

    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.commonjs,
                crypto: "off",
            },
            ecmaVersion: "latest",
            sourceType: "script",
        },
        rules: {
            // Style de base (très standard)
            indent: ["error", 4, { SwitchCase: 1 }],
            quotes: ["error", "double", { avoidEscape: false }],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "eol-last": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "space-before-blocks": ["error", "always"],
            "keyword-spacing": ["error", { before: true, after: true }],
            "space-infix-ops": "error",
            "brace-style": ["error", "1tbs", { allowSingleLine: true }],
            curly: ["error", "all"],

            // “Bonnes pratiques” (très standard en Node)
            eqeqeq: ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
            "no-multi-spaces": "error",
            "no-trailing-spaces": "error",
            "no-duplicate-imports": "error",
            "no-useless-return": "error",
            "no-undef-init": "error",
            "no-implicit-coercion": "error",
            "prefer-arrow-callback": "error",
            "arrow-body-style": ["error", "as-needed"],

            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

            // Logs: à toi de voir (souvent utile)
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },

    {
        files: ["public/**/*.js"],
        languageOptions: {
            globals: globals.browser,
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            indent: ["error", 4, { SwitchCase: 1 }],
            quotes: ["error", "double", { avoidEscape: false }],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "eol-last": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "space-before-blocks": ["error", "always"],
            "keyword-spacing": ["error", { before: true, after: true }],
            "space-infix-ops": "error",
            "brace-style": ["error", "1tbs", { allowSingleLine: true }],
            curly: ["error", "all"],
            eqeqeq: ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
            "no-multi-spaces": "error",
            "no-trailing-spaces": "error",
            "no-duplicate-imports": "error",
            "no-useless-return": "error",
            "no-undef-init": "error",
            "no-implicit-coercion": "error",
            "prefer-arrow-callback": "error",
            "arrow-body-style": ["error", "as-needed"],

            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

            // Logs: à toi de voir (souvent utile)
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },

    {
        ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**"],
    },
]);
