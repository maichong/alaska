module.exports = {
  extends: [
    'eslint-config-alloy/typescript-react',
  ],
  globals: {},
  settings: {
    react: {
      version: '16.0'
    }
  },
  rules: {
    'arrow-parens': 'error',
    complexity: 'off',
    indent: ['error', 2, {
      SwitchCase: 1
    }],
    "max-nested-callbacks": ['error', 4],
    // 禁止不必要的布尔转换
    'no-extra-boolean-cast': 'error',
    // 禁止不必要的括号
    'no-extra-parens': 'error',
    // 强制使用有效的 JSDoc 注释
    // 'valid-jsdoc': 'error',
    'no-param-reassign': 'off',
    "no-return-await": 'off',
    'no-unused-vars': 'off',
    'no-shadow': 'error',
    'object-curly-spacing': ['error', 'always'],
    'prefer-template': 'error',
    radix: 'off',
    'react/jsx-indent-props': ['error', 2]
  },
  overrides: [{
    files: ['*.d.ts'],
    rules: {
      'no-dupe-class-members': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'typescript/member-ordering': 'off'
    }
  }]
}
