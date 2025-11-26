import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ ignores: ['dist', 'node_modules'] },
	...tseslint.configs.strict,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	...reactHooks.configs.recommended,
	{
		files: ['src/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: 'latest',
			sourceType: 'module',
		},

		rules: {
			// JavaScript rules
			...js.configs.recommended.rules,
			eqeqeq: 'error',
			'no-console': [
				'warn',
				{
					allow: ['error', 'warn', 'info', 'time', 'timeEnd', 'group', 'groupCollapsed', 'groupEnd'],
				},
			],
			'prefer-template': 'error',
			'no-duplicate-imports': 'error',

			// --- React rules
			'react/prop-types': 'off',
			'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.tsx'] }],
			'react-hooks/set-state-in-effect': 'off',

			// --- Typescript rules
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error'],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-dynamic-delete': 'off',
			'@typescript-eslint/unified-signatures': 'off',
		},

		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
