import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { Linter } from 'eslint';

export const config: Linter.Config[] = [
	{
		...react.configs.flat.recommended,
		name: 'react',
	},
	{
		...react.configs.flat['jsx-runtime'],
		name: 'react-jsx-runtime',
	},
	{
		...reactHooks.configs.flat['recommended-latest'],
		name: 'react-hooks',
	},

	// Custom additional config
	{
		files: ['src/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'coverage/**',
			'public/**',
			'.vite/**',
			'**/*.min.js',
			'**/sw.js',
		],

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: 'latest',
			sourceType: 'module',
		},

		rules: {
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

			'react/prop-types': 'off',

			'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.tsx'] }],

			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/use-memo': 'off',
			'react-hooks/exhaustive-deps': [
				'warn',
				{
					additionalHooks: '(usePromise)',
				},
			],
		},

		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];