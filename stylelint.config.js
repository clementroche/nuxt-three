module.exports = {
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  extends: 'stylelint-config-sass-guidelines',
  rules: {
    'selector-class-pattern': null,
    'selector-max-id': null,
    'at-rule-blacklist': null,
    'max-nesting-depth': null,
    // 'scss/at-function-pattern': '^(_?)[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/at-mixin-pattern': '^(_?)[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/dollar-variable-pattern': '^(_?)[a-z0-9]+([a-z0-9-]+[a-z0-9]+)?$',
    'selector-no-qualifying-type': null,
    'property-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'selector-max-compound-selectors': null,
    'scss/at-function-pattern': null
  }
}
