module.exports = {
  extends: ['eda/core'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
}
