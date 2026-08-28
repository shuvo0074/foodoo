import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, sp, type, hexA, elev, grad } from '../theme';
import { useStore, money, unitPriceOf } from '../state/store';
import { getRestaurant } from '../data';
import Press, { tap } from './Press';
import Img from './Img';
import { T, Badge, Rating, Row } from './ui';

/** Pre-select the first choice of every required option group. */
export const defaultOptions = (dish) => {
  const out = {};
  for (const g of dish.options || []) {
    if (g.required && g.items.length) out[g.id] = [g.items[0].id];
  }
  return out;
};

/**
 * "+" that morphs into a −/qty/+ stepper once the dish is in the cart.
 * Adding from here uses default options; the detail sheet is for customising.
 */
export function QuickAdd({ dish, size = 34, onNeedsDetail }) {
  const { lines, add, setQty, cartRid } = useStore();
  const opts = useMemo(() => defaultOptions(dish), [dish]);

  const line = useMemo(() => {
    const flat = Object.keys(opts).sort().map((g) => `${g}:${[...opts[g]].sort().join('+')}`).join('|');
    return lines.find((l) => l.key === `${dish.id}__${flat}`);
  }, [lines, dish.id, opts]);

  const qty = line?.qty ?? 0;

  const pop = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const bump = () => {
    pop.value = withSequence(withTiming(0.82, { duration: 80 }), withTiming(1, { duration: 150 }));
  };

  const doAdd = useCallback(() => {
    // Dishes with a real choice to make should open the detail sheet instead.
    const hasChoice = (dish.options || []).some((g) => g.required && g.items.length > 1);
    if (hasChoice && qty === 0 && onNeedsDetail) return onNeedsDetail();

    if (cartRid && cartRid !== dish.rid) {
      const cur = getRestaurant(cartRid);
      Alert.alert(
        'Start a new cart?',
        `Your cart has items from ${cur?.name}. Adding this will clear it.`,
        [
          { text: 'Keep cart', style: 'cancel' },
          { text: 'Start new', style: 'destructive', onPress: () => { add(dish, opts, 1); bump(); } },
        ],
      );
      return;
    }
    add(dish, opts, 1);
    bump();
  }, [dish, opts, qty, cartRid, add, onNeedsDetail]);

  if (qty === 0) {
    return (
      <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={aStyle}>
        <Press onPress={doAdd} haptic="medium" scaleTo={0.86}>
          <LinearGradient
            colors={grad.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[{ width: size, height: size, borderRadius: size / 2 }, styles.center, elev(2, colors.primary)]}
          >
            <Ionicons name="add" size={size * 0.62} color="#fff" />
          </LinearGradient>
        </Press>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      layout={LinearTransition.duration(220)}
      style={[styles.stepper, { height: size }, aStyle]}
    >
      <Press onPress={() => { setQty(line.key, qty - 1); bump(); }} haptic="light" style={styles.stepBtn} scaleTo={0.85}>
        <Ionicons name={qty === 1 ? 'trash-outline' : 'remove'} size={16} color="#fff" />
      </Press>
      <Animated.Text key={qty} entering={FadeIn.duration(140)} style={styles.stepQty}>
        {qty}
      </Animated.Text>
      <Press onPress={() => { setQty(line.key, qty + 1); bump(); }} haptic="light" style={styles.stepBtn} scaleTo={0.85}>
        <Ionicons name="add" size={16} color="#fff" />
      </Press>
    </Animated.View>
  );
}

/** Tall card used in the "Trending now" horizontal rail. */
export function DishCard({ dish, width = 168, style }) {
  const nav = useNavigation();
  const r = getRestaurant(dish.rid);
  const open = () => nav.navigate('Dish', { id: dish.id });

  return (
    <Press onPress={open} style={[{ width }, style]} scaleTo={0.97}>
      <Img uri={dish.img} seed={dish.id} radius={radius.md} style={{ height: width * 0.86 }}>
        <LinearGradient colors={['rgba(11,11,16,0)', 'rgba(11,11,16,0.6)']} style={StyleSheet.absoluteFill} />
        {!!dish.badge && (
          <Badge label={dish.badge} tint={colors.gold} solid style={{ position: 'absolute', top: 8, left: 8 }} />
        )}
        <View style={styles.cardAdd}>
          <QuickAdd dish={dish} size={32} onNeedsDetail={open} />
        </View>
      </Img>

      <View style={{ paddingTop: sp(2.5) }}>
        <T v="h3" numberOfLines={1}>{dish.name}</T>
        <T v="sm" c={colors.mute} numberOfLines={1} style={{ marginTop: 2 }}>{r?.name}</T>
        <Row style={{ marginTop: sp(2), justifyContent: 'space-between' }}>
          <T v="h3" c={colors.primary}>{money(dish.price)}</T>
          <Rating value={dish.rating} size={12} />
        </Row>
      </View>
    </Press>
  );
}

/** Wide row used inside a restaurant's menu. */
export function DishRow({ dish, style }) {
  const nav = useNavigation();
  const open = () => nav.navigate('Dish', { id: dish.id });

  return (
    <Press onPress={open} style={[styles.dishRow, style]} scaleTo={0.985}>
      <View style={{ flex: 1, paddingRight: sp(3) }}>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {!!dish.badge && <Badge label={dish.badge} tint={colors.gold} />}
          {dish.veg && <Badge label="VEG" tint={colors.mint} />}
          {dish.spicy && <Badge label="SPICY" tint={colors.danger} />}
        </Row>
        <T v="h3" style={{ marginTop: dish.badge || dish.veg || dish.spicy ? sp(2) : 0 }} numberOfLines={2}>
          {dish.name}
        </T>
        <T v="sm" c={colors.mute} numberOfLines={2} style={{ marginTop: 4, lineHeight: 18 }}>
          {dish.desc}
        </T>
        <Row style={{ marginTop: sp(2.5) }}>
          <T v="h3" c={colors.text}>{money(dish.price)}</T>
          <View style={styles.sep} />
          <Rating value={dish.rating} size={12} />
          <View style={styles.sep} />
          <T v="sm" c={colors.mute}>{dish.kcal} kcal</T>
        </Row>
      </View>

      <View>
        <Img uri={dish.img} seed={dish.id} radius={radius.md} style={styles.dishImg} />
        <View style={styles.rowAdd}>
          <QuickAdd dish={dish} size={34} onNeedsDetail={open} />
        </View>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  cardAdd: { position: 'absolute', right: 8, bottom: 8 },
  rowAdd: { position: 'absolute', right: -6, bottom: -8 },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sp(4),
    paddingHorizontal: sp(5),
  },
  dishImg: { width: 104, height: 104 },
  sep: { width: 1, height: 11, backgroundColor: colors.strokeHi, marginHorizontal: sp(2.5) },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 3,
    ...elev(2, colors.primary),
  },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  stepQty: {
    ...type.sm,
    color: '#fff',
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
});
