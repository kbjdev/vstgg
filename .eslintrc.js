require('@rushstack/eslint-config/patch/modern-module-resolution');
/** @type {import('eslint').ESLint.ConfigData} */
const eslintConfig = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    '@rushstack/eslint-config/profile/web-app',
    'plugin:import/recommended',
    'plugin:import/electron',
    'plugin:import/typescript',
  ],
  parserOptions: { tsconfigRootDir: __dirname },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    '@rushstack/no-new-null': 'off',
    '@rushstack/typedef-var': 'off',
    '@typescript-eslint/typedef': [
      'warn',
      {
        arrayDestructuring: false,
        arrowParameter: false,
        memberVariableDeclaration: true,
        objectDestructuring: false,
        parameter: false,
        propertyDeclaration: true,
        variableDeclaration: false,
        variableDeclarationIgnoreFunction: true,
      },
    ],

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/parameter-properties': [
      'warn',
      {
        allow: ['private readonly', 'public readonly'],
      },
    ],
    'import/no-named-as-default': 'off',
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        pathGroups: [
          { pattern: '@src/**', group: 'internal' },
          { pattern: 'react', group: 'external', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index', 'type'],
      },
    ],
  },
  overrides: [
    {
      files: ['src/renderer/**/*.ts?(x)'],
      settings: {
        react: {
          version: '18.3.1',
        },
      },
      plugins: ['react', 'react-refresh', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
      ],
      rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'react/no-unknown-property': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/jsx-no-target-blank': 'off',
        'jsx-a11y/aria-props': 'warn',
        'jsx-a11y/aria-proptypes': 'warn',
        'jsx-a11y/aria-unsupported-elements': 'warn',
        'jsx-a11y/role-has-required-aria-props': 'warn',
        'jsx-a11y/role-supports-aria-props': 'warn',
      },
    },
  ],
};

module.exports = eslintConfig;
