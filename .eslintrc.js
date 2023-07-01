module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["prettier"], 
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	rules: {
		"prefer-object-spread": 0,
		"@typescript-eslint/no-explicit-any": "off",
		"no-console": "off",
		"import/prefer-default-export": "off",
	},
}