import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import RootNavigator from './src/navigation';
import { StoreProvider } from './src/state/store';
import { colors } from './src/theme';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.stroke,
    notification: colors.primary,
  },
};

/**
 * No GestureHandlerRootView here on purpose. Nothing in the app uses
 * react-native-gesture-handler — native-stack and bottom-tabs are both native,
 * and presses/sheets use RN's own Pressable and Modal. Importing the package
 * just to wrap the tree pulled in its GestureComponents module, which reads the
 * deprecated `DrawerLayoutAndroid` off react-native at load time and logged a
 * deprecation warning on every start. Add it back if a real gesture is needed.
 */
export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StoreProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <RootNavigator />
          </NavigationContainer>
        </StoreProvider>
      </SafeAreaProvider>
    </View>
  );
}
