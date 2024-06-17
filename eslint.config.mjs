import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';

import prettierPlugin from 'eslint-plugin-prettier/recommended';

const compat = new FlatCompat();

const config = [
  ...fixupConfigRules(compat.extends('next/core-web-vitals')),
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...prettierPlugin,
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-sort-props': 'warn',
      'react/jsx-uses-vars': 'off',
    },
    ignores: ['node_modules', '.next', 'out'],
  },
];

export default config;
