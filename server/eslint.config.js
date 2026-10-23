import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuration ESLint (format plat) du serveur.
 *
 * Le serveur est en ESM strict TypeScript : on n'autorise ni `any` implicite
 * ni les variables inutilisées, et on impose l'import des modules avec
 * l'extension `.js` (résolution Node ESM).
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'prisma/migrations/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'prisma/**/*.ts', 'scripts/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['prisma/seed.ts', 'scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
);
