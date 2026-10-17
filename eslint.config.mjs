import mantine from 'eslint-config-mantine';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...mantine,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'import/extensions': 'off',
      'no-tabs': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.{mjs,cjs,js,d.ts,d.mts}',
      '.storybook/**',
      'docs/**',
    ],
  }
);
