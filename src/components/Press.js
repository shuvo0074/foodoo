import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Haptics from 'react-native-haptic-feedback';
import { spring } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HAPTIC_OPTS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

const HAPTIC_MAP = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  success: 'notificationSuccess',
  select: 'selection',
};

const tap = (kind) => {
  if (!kind) return;
  try {
    Haptics.trigger(HAPTIC_MAP[kind] ?? 'impactLight', HAPTIC_OPTS);
  } catch {
    // haptics are a nicety — never let them break a press
  }
};

/**
 * Pressable that springs down on touch. Every tappable surface in the app
 * uses this so presses feel like one consistent physical object.
 */
export default function Press({
  children,
  style,
  scaleTo = 0.955,
  haptic = 'light',
  dimTo = 1,
  onPress,
  disabled,
  ...rest
}) {
  const s = useSharedValue(1);
  const o = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
    opacity: o.value,
  }));

  const onIn = useCallback(() => {
    s.value = withSpring(scaleTo, spring);
    if (dimTo !== 1) o.value = withSpring(dimTo, spring);
  }, [scaleTo, dimTo, s, o]);

  const onOut = useCallback(() => {
    s.value = withSpring(1, spring);
    if (dimTo !== 1) o.value = withSpring(1, spring);
  }, [dimTo, s, o]);

  const handle = useCallback(
    (e) => {
      if (disabled) return;
      tap(haptic);
      onPress?.(e);
    },
    [disabled, haptic, onPress],
  );

  return (
    <AnimatedPressable
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={handle}
      disabled={disabled}
      style={[style, aStyle, disabled && { opacity: 0.45 }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export { tap };
