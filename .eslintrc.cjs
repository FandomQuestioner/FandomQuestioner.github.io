module.exports = {
  extends: ['mantine'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    "no-tabs": 0,
    "react/jsx-indent-props": [0, "tab"],
  },
};
