/** @type {import('eslint').Linter.FlatConfig} */
export default [
	{
		rules: {
			'react-hooks/exhaustive-deps': [
				'warn',
				{
					'additionalHooks': '(usePromise)',
				},
			],
		},
	},
];