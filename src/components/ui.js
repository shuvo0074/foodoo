import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, type, sp, hexA, elev } from '../theme';
import Press from './Press';

/* ------------------------------- text ------------------------------- */

export const T = ({ v = 'body', c = colors.text, style, children, ...rest }) => (
  <Text style={[type[v], { color: c }, style]} {...rest}>
    {children}
  </Text>
);

/* ------------------------------ badges ------------------------------ */

export const Badge = ({ label, tint = colors.primary, icon, solid = false, style }) => (
  <View
    style={[
      styles.badge,
      { backgroundColor: solid ? tint : hexA(tint, 0.16), borderColor: solid ? 'transparent' : hexA(tint, 0.35) },
      style,
    ]}
  >
    {!!icon && <Ionicons name={icon} size={11} color={solid ? '#0B0B10' : tint} style={{ marginRight: 4 }} />}
    <Text style={[type.xs, { color: solid ? '#0B0B10' : tint }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

export const Rating = ({ value, reviews, size = 13, tint = colors.gold }) => (
  <View style={styles.row}>
    <Ionicons name="star" size={size} color={tint} />
    <Text style={[type.sm, { color: colors.text, fontWeight: '700', marginLeft: 4 }]}>{value}</Text>
    {reviews != null && (
      <Text style={[type.sm, { color: colors.mute, marginLeft: 4 }]}>({fmt(reviews)})</Text>
    )}
  </View>
);

export const Dot = ({ c = colors.mute }) => (
  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: c, marginHorizontal: 7 }} />
);

/* ------------------------------ buttons ----------------------------- */

export const IconBtn = ({ name, onPress, size = 20, tint = colors.text, bg = colors.surfaceHi, style, badge }) => (
  <Press onPress={onPress} style={[styles.iconBtn, { backgroundColor: bg }, style]} scaleTo={0.88}>
    <Ionicons name={name} size={size} color={tint} />
    {badge > 0 && (
      <View style={styles.iconBadge}>
        <Text style={{ color: '#0B0B10', fontSize: 10, fontWeight: '900' }}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    )}
  </Press>
);

export const PrimaryButton = ({ label, onPress, icon, right, disabled, style, haptic = 'medium' }) => (
  <Press onPress={onPress} disabled={disabled} haptic={haptic} style={[style]} scaleTo={0.97}>
    <LinearGradient
      colors={disabled ? [colors.surfaceMax, colors.surfaceHi] : ['#FF9556', '#FF6B2C', '#E2500F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.primaryBtn, !disabled && elev(2, colors.primary)]}
    >
      {!!icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />}
      <Text style={[type.h3, { color: '#fff' }]}>{label}</Text>
      {!!right && <View style={styles.btnRight}>{right}</View>}
    </LinearGradient>
  </Press>
);

export const GhostButton = ({ label, onPress, icon, style, tint = colors.text }) => (
  <Press onPress={onPress} style={[styles.ghostBtn, style]} scaleTo={0.97}>
    {!!icon && <Ionicons name={icon} size={17} color={tint} style={{ marginRight: 7 }} />}
    <Text style={[type.body, { color: tint, fontWeight: '700' }]}>{label}</Text>
  </Press>
);

/* ------------------------------ sections ---------------------------- */

export const SectionHeader = ({ title, action, onAction, sub }) => (
  <View style={styles.sectionHeader}>
    <View style={{ flex: 1 }}>
      <T v="h2">{title}</T>
      {!!sub && <T v="sm" c={colors.mute} style={{ marginTop: 2 }}>{sub}</T>}
    </View>
    {!!action && (
      <Press onPress={onAction} style={styles.row} haptic="select">
        <Text style={[type.sm, { color: colors.primary, fontWeight: '700' }]}>{action}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} style={{ marginLeft: 2 }} />
      </Press>
    )}
  </View>
);

/* ----------------------------- skeletons ---------------------------- */

/** Shimmering placeholder block. */
export const Skeleton = ({ w = '100%', h = 16, r = 8, style, delay = 0 }) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, false),
    );
  }, [delay]);

  const a = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.5, 1], [0.35, 0.75, 0.35]),
    transform: [{ translateX: interpolate(p.value, [0, 1], [-40, 40]) }],
  }));

  return (
    <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: colors.surfaceHi, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, a]}>
        <LinearGradient
          colors={['transparent', hexA('#FFFFFF', 0.09), 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/* ---------------------------- empty state --------------------------- */

export const Empty = ({ icon = 'search', title, sub, action, onAction }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name={icon} size={28} color={colors.mute} />
    </View>
    <T v="h3" style={{ marginTop: sp(4), textAlign: 'center' }}>{title}</T>
    {!!sub && (
      <T v="sm" c={colors.mute} style={{ marginTop: sp(1.5), textAlign: 'center', maxWidth: 260, lineHeight: 19 }}>
        {sub}
      </T>
    )}
    {!!action && <GhostButton label={action} onPress={onAction} style={{ marginTop: sp(5) }} />}
  </View>
);

/* ------------------------------ helpers ----------------------------- */

export const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const Card = ({ style, children }) => <View style={[styles.card, style]}>{children}</View>;

export const Row = ({ style, children, ...rest }) => (
  <View style={[styles.row, style]} {...rest}>{children}</View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  iconBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  primaryBtn: {
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(5),
  },
  btnRight: { position: 'absolute', right: sp(5) },
  ghostBtn: {
    height: 48,
    paddingHorizontal: sp(5),
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: sp(5),
    marginBottom: sp(3.5),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  empty: { alignItems: 'center', paddingVertical: sp(16), paddingHorizontal: sp(6) },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
});
