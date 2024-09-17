module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "import"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
      node: true,
    },
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".*rc.js", "*.config.js", "*.config.mts", "scripts/*"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-this-alias": "warn",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      { allowString: false, allowNumber: false, allowNullableObject: false },
    ],
    eqeqeq: ["error", "always", { null: "ignore" }],
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        groups: ["builtin", "external", "internal"],
      },
    ],
    "import/no-relative-parent-imports": [
      "error",
      {
        ignore: ["@"],
      },
    ],
    "import/no-cycle": "error",
    "import/default": "off",
    "import/named": "off",
    "import/namespace": "off",
    "import/no-named-as-default": "off",
    "no-fallthrough": "error",
  },
};
