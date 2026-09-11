import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      semi: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
]);
