import tseslint from "typescript-eslint";

export default tseslint.config(
  { linterOptions: { reportUnusedDisableDirectives: "off" }, ignores: [".next/**", "node_modules/**"] },
  ...tseslint.configs.recommended,
  { rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-object-type": "off",
  } },
);
