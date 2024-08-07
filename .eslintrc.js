module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".eslintrc.js"
  ],
  rules: {
    "prettier/prettier": [
      "error", {
        "singleQuote": false
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn", {
        varsIgnorePattern: "^_|error|opts",
        argsIgnorePattern: "^_|error|opts"
      }
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-namespace": "off"
  }
};
