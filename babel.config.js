module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 runs through react-native-worklets — this must stay last.
  plugins: ['react-native-worklets/plugin'],
};
