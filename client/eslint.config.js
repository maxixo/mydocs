import js from "@eslint/js";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react,
      "react-hooks": hooks,
      "react-refresh": refresh
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      "react-refresh/only-export-components": "warn"
    }
  }
];
