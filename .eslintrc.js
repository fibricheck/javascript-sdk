module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',   
    'prettier'
  ],
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
  },
};
