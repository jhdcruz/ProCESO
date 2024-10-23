/* eslint-disable import/no-anonymous-default-export */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  eslintPluginPrettierRecommended,
  {
    rules: {
      'react/jsx-sort-props': 'warn',
      'react/sort-default-props': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  },
  {
    ignores: ['src/libs/supabase/_database.ts'],
  },
];
