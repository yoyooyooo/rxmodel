const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.default,
  rules: {
    ...fabric.default.rules,
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
    'no-underscore-dangle': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-object-literal-type-assertion': 0,
    'no-console': 1,
    'no-param-reassign': 1,
  },
};
