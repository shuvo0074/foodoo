import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors } from '../theme';

/**
 * Frosted backdrop for bars and headers.
 *
 * iOS gets a real blur with a tint on top. Android does NOT:
 * @react-native-community/blur is unreliable there and dims the whole window
 * instead of staying inside its own bounds, which shows up as a grey wash over
 * the page. A solid tint looks the same at these opacities and is cheaper.
 */
export default function Frost({
  blur = 20,
  iosTint = 'rgba(11,11,16,0.66)',
  androidTint = 'rgba(14,14,20,0.94)',
}) {
  if (Platform.OS !== 'ios') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: androidTint }]} pointerEvents="none" />;
  }

  return (
    <>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={blur}
        reducedTransparencyFallbackColor={colors.bg}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: iosTint }]} pointerEvents="none" />
    </>
  );
}
