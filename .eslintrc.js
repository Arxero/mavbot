module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'import'],
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:import/recommended'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		semi: 'off',
		'@typescript-eslint/semi': ['error'],
		'@typescript-eslint/no-unused-vars': ['error'],
		// '@typescript-eslint/no-duplicate-imports': ['error', { "includeExports": true }],
		'@typescript-eslint/explicit-function-return-type': ['error'],
		'@typescript-eslint/no-empty-function': ['error'],
		'@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
		'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
		'@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: false }],
		'padding-line-between-statements': [
			'error',
			{ blankLine: 'always', prev: '*', next: 'function' },
			{ blankLine: 'always', prev: '*', next: 'return' },
		],
		'import/no-duplicates': ['error', {'considerQueryString': true}],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'import/no-unresolved': 'off',
		'import/named': 'off',
	},
};
