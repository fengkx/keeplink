module.exports = {
  extends: ['sukka/typescript', 'plugin:@next/next/recommended'],
  rules: {
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'no-void': 'off',
  },
  parserOptions: {
    project: ['./tsconfig.json'],
  },
};
