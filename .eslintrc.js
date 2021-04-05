module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        node: true,
        browser: false,
        commonjs: true,
    },
    settings: {},
    extends: [
        'plugin:@typescript-eslint/recommended',
        'eslint:recommended',
        //'prettier',
        //'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 1 }],
        indent: ['warn', 4, { SwitchCase: 1 }],
    },
};
