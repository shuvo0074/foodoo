import React, { useCallback, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme';

/** Deterministic warm gradient so a tile still looks designed before the photo lands. */
const PLACEHOLDERS = [
  ['#3A2A22', '#1A1420'],
  ['#2A3327', '#141C1A'],
  ['#33262E', '#1B1420'],
  ['#2B2C3A', '#15151F'],
  ['#38301F', '#1C1712'],
];

const hash = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/**
 * Image with a gradient underlay that shows instantly and cross-fades into the
 * photo. If the network is unavailable the tile still reads as a designed
 * surface instead of an empty hole.
 */
export default function Img({ uri, style, radius = 0, seed = '', children, dim = 0 }) {
  const pal = PLACEHOLDERS[hash(seed || uri || '') % PLACEHOLDERS.length];
  const fade = useSharedValue(0);
  const [failed, setFailed] = useState(false);

  const onLoad = useCallback(() => {
    fade.value = withTiming(1, { duration: 420 });
  }, [fade]);

  const photoStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <View style={[styles.wrap, { borderRadius: radius }, style]}>
      <LinearGradient colors={pal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {!!uri && !failed && (
        <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onLoad={onLoad}
            onError={() => setFailed(true)}
          />
        </Animated.View>
      )}
      {dim > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(11,11,16,${dim})` }]} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.surfaceHi },
});
