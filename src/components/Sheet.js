import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, sp } from '../theme';
import { T, IconBtn } from './ui';

/**
 * Bottom sheet: dimmed backdrop, slide-up panel, tap-outside to close.
 *
 * The animation is driven by a shared value and `useAnimatedStyle` rather than
 * Reanimated's `entering`/`exiting` layout animations. Layout animations inside
 * a React Native `Modal` misbehave on iOS — the panel renders in place but its
 * touch targets don't follow, so taps inside it (picking a row, the close
 * button) silently do nothing. Plain animated styles behave on both platforms.
 */
export default function Sheet({ visible, onClose, title, sub, children }) {
  const insets = useSafeAreaInsets();

  // keep the modal mounted until the close animation has finished
  const [mounted, setMounted] = useState(visible);
  const p = useSharedValue(0);
  const height = useSharedValue(420);

  const unmount = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      p.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
    } else {
      p.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(unmount)();
      });
    }
  }, [visible, p, unmount]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: p.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - p.value) * height.value }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} />
        </Animated.View>

        <Animated.View
          onLayout={(e) => {
            // slide exactly its own height so it always clears the screen
            height.value = e.nativeEvent.layout.height || 420;
          }}
          style={[styles.panel, { paddingBottom: Math.max(insets.bottom, sp(5)) }, panelStyle]}
        >
          <View style={styles.grabber} />
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <T v="h2">{title}</T>
              {!!sub && <T v="sm" c={colors.mute} style={{ marginTop: 3 }}>{sub}</T>}
            </View>
            <IconBtn name="close" onPress={onClose} size={18} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(5,5,9,0.72)' },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgSoft,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.strokeHi,
    paddingHorizontal: sp(5),
    paddingTop: sp(2.5),
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceMax,
    marginBottom: sp(4),
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: sp(4) },
});
