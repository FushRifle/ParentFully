module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',
        logTimings: true,
      },
    ],
    'react-native-worklets/plugin',
  ],
};