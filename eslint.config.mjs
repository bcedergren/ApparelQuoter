import nextVitals from 'eslint-config-next/core-web-vitals'

export default [
  ...nextVitals,
  {
    rules: {
      // Keep existing code patterns valid while we incrementally modernize hooks usage.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
]
