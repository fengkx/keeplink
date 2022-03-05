module.exports = {
  extends: 'sukka/typescript',
  rules: {
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'no-void': 'off',
  },
  parserOptions: {
    project: ['./tsconfig.json'],
  },
};
