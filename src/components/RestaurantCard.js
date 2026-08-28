import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, sp, type, grad, hexA, elev } from '../theme';
import { useStore, money } from '../state/store';
import Press, { tap } from './Press';
import Img from './Img';
import { T, Badge, Rating, Dot, Row } from './ui';

/** Heart that pops and settles when toggled. */
export function HeartButton({ active, onToggle, size = 18, style }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const press = useCallback(() => {
    s.value = withSequence(withTiming(0.7, { duration: 90 }), withTiming(1, { duration: 160 }));
    tap(active ? 'light' : 'medium');
    onToggle?.();
  }, [active, onToggle]);

  return (
    <Press onPress={press} haptic={null} scaleTo={1} style={[styles.heart, style]}>
      <Animated.View style={a}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={size}
          color={active ? colors.danger : '#fff'}
        />
      </Animated.View>
    </Press>
  );
}

/** Large photo-led card for the main discovery feed. */
export function RestaurantCard({ r, width, style }) {
  const nav = useNavigation();
  const { favRestaurants, toggleFavRestaurant } = useStore();
  const fav = favRestaurants.includes(r.id);

  return (
    <Press
      onPress={() => nav.navigate('Restaurant', { id: r.id })}
      style={[{ width }, style]}
      scaleTo={0.975}
    >
      <Img uri={r.heroImg} seed={r.id} radius={radius.lg} style={styles.hero}>
        <LinearGradient colors={grad.scrimDown} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

        <View style={styles.heroTop}>
          <Row style={{ flex: 1, flexWrap: 'wrap', gap: 6 }}>
            {!r.open && <Badge label="Closed · pre-order" tint={colors.mute} solid />}
            {r.open && r.deliveryFee === 0 && <Badge label="FREE DELIVERY" tint={colors.mint} solid />}
            {r.open && !!r.promo && r.deliveryFee !== 0 && <Badge label={r.promo.toUpperCase()} tint={colors.gold} solid />}
          </Row>
          <HeartButton active={fav} onToggle={() => toggleFavRestaurant(r.id)} />
        </View>

        <View style={styles.heroBottom}>
          <Row>
            <Img uri={r.logoImg} seed={r.name} radius={12} style={styles.logo} />
            <View style={{ flex: 1, marginLeft: sp(3) }}>
              <T v="h2" numberOfLines={1}>{r.name}</T>
              <T v="sm" c={colors.dim} numberOfLines={1} style={{ marginTop: 2 }}>
                {r.cuisines.join(' · ')}
              </T>
            </View>
          </Row>

          <Row style={styles.metaRow}>
            <Rating value={r.rating} reviews={r.reviews} />
            <Dot />
            <Ionicons name="time-outline" size={13} color={colors.dim} />
            <T v="sm" c={colors.dim} style={{ marginLeft: 4 }}>{r.etaMin}–{r.etaMax} min</T>
            <Dot />
            <Ionicons name="bicycle-outline" size={14} color={colors.dim} />
            <T v="sm" c={r.deliveryFee === 0 ? colors.mint : colors.dim} style={{ marginLeft: 4 }}>
              {r.deliveryFee === 0 ? 'Free' : money(r.deliveryFee)}
            </T>
          </Row>
        </View>
      </Img>
    </Press>
  );
}

/** Compact horizontal row for search results and lists. */
export function RestaurantRow({ r, style }) {
  const nav = useNavigation();
  const { favRestaurants, toggleFavRestaurant } = useStore();
  const fav = favRestaurants.includes(r.id);

  return (
    <Press onPress={() => nav.navigate('Restaurant', { id: r.id })} style={[styles.row, style]} scaleTo={0.98}>
      <Img uri={r.logoImg} seed={r.id} radius={radius.md} style={styles.rowImg} dim={r.open ? 0 : 0.45} />
      <View style={{ flex: 1, marginLeft: sp(3.5) }}>
        <Row>
          <T v="h3" numberOfLines={1} style={{ flex: 1 }}>{r.name}</T>
          <HeartButton active={fav} onToggle={() => toggleFavRestaurant(r.id)} size={16} style={styles.heartFlat} />
        </Row>
        <T v="sm" c={colors.mute} numberOfLines={1} style={{ marginTop: 3 }}>
          {r.cuisines.join(' · ')} · {r.area}
        </T>
        <Row style={{ marginTop: sp(2) }}>
          <Rating value={r.rating} size={12} />
          <Dot />
          <T v="sm" c={colors.dim}>{r.etaMin}–{r.etaMax} min</T>
          <Dot />
          <T v="sm" c={r.deliveryFee === 0 ? colors.mint : colors.dim}>
            {r.deliveryFee === 0 ? 'Free delivery' : `${money(r.deliveryFee)} delivery`}
          </T>
        </Row>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: sp(3),
    gap: sp(2),
  },
  heroBottom: { padding: sp(4) },
  logo: {
    width: 46,
    height: 46,
    borderWidth: 2,
    borderColor: hexA('#FFFFFF', 0.18),
  },
  metaRow: { marginTop: sp(3) },
  heart: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,11,16,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA('#FFFFFF', 0.18),
  },
  heartFlat: { backgroundColor: 'transparent', borderColor: 'transparent', width: 28, height: 28 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sp(3),
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  rowImg: { width: 76, height: 76 },
});
