import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, sp, elev } from '../theme';
import { useStore, money } from '../state/store';
import Press from './Press';
import Img from './Img';
import { T, Row } from './ui';

/**
 * Floating cart summary. Springs up when the cart fills, nudges on every add.
 * `bottom` lets each screen sit it above its own chrome (tab bar / safe area).
 */
export default function CartBar({ bottom = 0 }) {
  const nav = useNavigation();
  const { totals, lastAdded, cartRid } = useStore();
  const visible = totals.count > 0;

  const show = useSharedValue(0);
  const nudge = useSharedValue(0);

  useEffect(() => {
    show.value = withTiming(visible ? 1 : 0, { duration: 240 });
  }, [visible]);

  useEffect(() => {
    if (lastAdded === 0) return;
    nudge.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 170 }),
    );
  }, [lastAdded]);

  const wrap = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [
      { translateY: interpolate(show.value, [0, 1], [130, 0]) },
      { scale: 0.96 + show.value * 0.04 + nudge.value * 0.03 },
    ],
  }));

  if (!visible) {
    // keep it mounted only while animating out
    return <Animated.View pointerEvents="none" style={[styles.wrap, { bottom }, wrap]} />;
  }

  return (
    <Animated.View style={[styles.wrap, { bottom }, wrap]} pointerEvents="box-none">
      <Press onPress={() => nav.navigate('Cart')} haptic="medium" scaleTo={0.975}>
        <LinearGradient
          colors={['#FF9556', '#FF6B2C', '#E2500F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bar, elev(3, colors.primary)]}
        >
          {/* Padding lives on this inner row, never on the gradient: on iOS
              react-native-linear-gradient paints inside its padding box, so
              padding shrinks the visible gradient instead of insetting content
              — which left the pill flush with the edge. */}
          <View style={styles.barInner}>
            <View style={styles.countPill}>
              <T v="h3" c="#fff">{totals.count}</T>
            </View>

            <View style={{ flex: 1, marginLeft: sp(3) }}>
              <T v="h3" c="#fff" numberOfLines={1}>
                {totals.restaurant?.name ?? 'Your cart'}
              </T>
              <T v="sm" c="rgba(255,255,255,0.82)" numberOfLines={1}>
                {totals.count} item{totals.count > 1 ? 's' : ''} · {money(totals.subtotal)}
              </T>
            </View>

            <Row style={styles.viewCart}>
              <T v="sm" c="#fff" style={{ fontWeight: '800' }}>View cart</T>
              <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 6 }} />
            </Row>
          </View>
        </LinearGradient>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: sp(4),
    right: sp(4),
  },
  bar: {
    height: 64,
    borderRadius: radius.lg,
  },
  barInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sp(3),
  },
  countPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  viewCart: {
    // shrink-wrapped so a long restaurant name can never push it past the edge
    flexShrink: 0,
    marginLeft: sp(2.5),
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: sp(3.5),
    paddingVertical: sp(2.5),
    borderRadius: radius.pill,
  },
});
