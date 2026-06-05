module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Playwright requires {} destructuring syntax for the fixtures argument —
      // no-empty-pattern would otherwise flag every test that uses no built-in fixtures.
      files: ['e2e/**/*.spec.ts', 'e2e/**/*.ts'],
      rules: { 'no-empty-pattern': 'off' },
    },
  ],
}
