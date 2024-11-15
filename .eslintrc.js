module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': 'eslint:recommended',
    'ignorePatterns': ['drawdown.js'],
    'overrides': [
    ],
    'parserOptions': {
        'ecmaVersion': 'latest'
    },
    'rules': {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['off', 'single'],
        'semi': ['error', 'always'],
        'no-underscore-dangle': 'off',
    },
    // Add the `globals` section to whitelist the global variables
    globals: {
        'Action': 'readonly',
        'Config': 'readonly',
        'HTTP': 'readonly',
        'Help': 'readonly',
        'LaunchBar': 'readonly',
        'OpenAI': 'readonly',
        'Parse': 'readonly',
        'Persona': 'readonly',
        'Readwise': 'readonly',
        'Util': 'readonly',
        'config': 'readonly',
        'help': 'readonly',
        'include': 'readonly',
        'markdown': 'readonly',
        'module': 'readonly',
        'parse': 'readonly',
        'persona': 'readonly',
        'persona_defaults': 'readonly',
        'util': 'readonly',
    }
};
