import globals from "globals";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  js.configs.recommended,
  {
    files: ["public/**/*.js", "client/src/**/*.vue", "client/src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        window: "readonly",
        document: "readonly",
        console: "readonly",
        Chart: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      semi: ["error", "always"],
      "no-unused-vars": "error",
    },
  },
  {
    files: ["server.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        require: "readonly",
        module: "writable",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      semi: ["error", "always"],
      "no-unused-vars": "error",
    },
  },
  ...pluginVue.configs["flat/recommended"],
  {
    ignores: ["client/dist/**"],
  },
];
