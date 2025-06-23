module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-async-storage|@react-native-community|@react-native-picker|@react-native-svg|@react-native-masked-view|@react-native-firebase|@react-native-vector-icons|@react-native-safe-area-view|@react-native-screens|@react-native-reanimated|@react-native-clipboard|@react-native-html-to-pdf|@react-native-pager-view|@react-native-webview|@react-navigation/.*)"
  ],
  setupFiles: [
    "<rootDir>/jest.setup.js"
  ],
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
