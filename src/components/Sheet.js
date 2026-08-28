import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, sp } from '../theme';
import { T, IconBtn } from './ui';

/** Bottom sheet: dimmed backdrop, spring-in panel, tap-outside to close. */
export default function Sheet({ visible, onClose, title, sub, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(160)} style={StyleSheet.absoluteFill}>
          <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} />
        </Animated.View>

        <Animated.View
          // Eased, not sprung: a spring overshoots its resting position and
          // settles back, which on a panel this size reads as a bounce.
          entering={SlideInDown.duration(280).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(200).easing(Easing.in(Easing.cubic))}
          style={[styles.panel, { paddingBottom: Math.max(insets.bottom, sp(5)) }]}
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
