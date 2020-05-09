module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended'
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'no-console': 0,
    'no-undef': 0,
    'new-cap': 0,
    'unicorn/number-literal-case': 0,
    'vue/require-component-is': 0,
    'nuxt/no-globals-in-created': 0
  }
}
