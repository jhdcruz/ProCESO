import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';

import prettierPlugin from 'eslint-plugin-prettier/recommended';

const compat = new FlatCompat();

const config = [
  ...fixupConfigRules(compat.extends('next/core-web-vitals', 'prettier')),
  prettierPlugin,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['node_modules', '.next', 'out'],
  },
];

export default config;
