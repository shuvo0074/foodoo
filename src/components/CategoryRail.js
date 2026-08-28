import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, sp, type, hexA } from '../theme';
import { CATEGORIES } from '../data';
import Press from './Press';

function Chip({ cat, active, onPress }) {
  const p = useSharedValue(active ? 1 : 0);

  // Worklets can't call back into plain JS helpers, so resolve the tints here
  // and let the animated style only interpolate between finished colours.
  const fill = useMemo(() => hexA(cat.tint, 0.18), [cat.tint]);
  const edge = useMemo(() => hexA(cat.tint, 0.55), [cat.tint]);

  useEffect(() => {
    p.value = withTiming(active ? 1 : 0, { duration: 200 });
  }, [active, p]);

  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface, fill]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.stroke, edge]),
    transform: [{ scale: 0.96 + p.value * 0.04 }],
  }));

  const label = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], [colors.dim, cat.tint]),
  }));

  const glyph = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + p.value * 0.18 }, { rotate: `${p.value * -8}deg` }],
  }));

  return (
    <Press onPress={onPress} haptic="select" scaleTo={0.93}>
      <Animated.View style={[styles.chip, box]}>
        <Animated.View style={[styles.glyph, glyph]}>
          <Ionicons name={cat.icon} size={16} color={active ? cat.tint : colors.dim} />
        </Animated.View>
        <Animated.Text style={[type.sm, styles.label, label]}>{cat.label}</Animated.Text>
      </Animated.View>
    </Press>
  );
}

export default function CategoryRail({ value, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={style}
    >
      {CATEGORIES.map((c) => (
        <Chip key={c.id} cat={c} active={value === c.id} onPress={() => onChange(c.id)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: sp(5), gap: sp(2.5), paddingVertical: sp(1) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: sp(4),
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  glyph: { marginRight: 7 },
  label: { fontWeight: '700' },
});
