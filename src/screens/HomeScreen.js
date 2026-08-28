import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, hexA } from '../theme';
import { ADDRESSES, TRENDING, USER, byCategory, getRestaurant } from '../data';
import { useStore } from '../state/store';
import Press from '../components/Press';
import Sheet from '../components/Sheet';
import Frost from '../components/Frost';
import CategoryRail from '../components/CategoryRail';
import PromoCarousel from '../components/PromoCarousel';
import { RestaurantCard } from '../components/RestaurantCard';
import { DishCard } from '../components/DishCard';
import { T, Row, SectionHeader, IconBtn, Skeleton, Empty } from '../components/ui';

const { width: SCREEN } = Dimensions.get('window');
const CARD_W = SCREEN - sp(10);

export default function HomeScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { addressId, setAddress, totals, orders } = useStore();

  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
    },
  });

  // Stand-in for the first API fetch.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1100);
  }, []);

  const address = ADDRESSES.find((a) => a.id === addressId) ?? ADDRESSES[0];
  const list = useMemo(() => byCategory(cat), [cat]);
  const liveOrder = orders.find((o) => o.status === 'live');

  const headerH = insets.top + 58;

  const headerBg = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 60], [0, 1], Extrapolation.CLAMP),
  }));

  const greetingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 70], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [0, 70], [0, -10], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={styles.screen}>
      {/* warm glow behind the top of the page */}
      <LinearGradient
        colors={[hexA(colors.primary, 0.16), 'rgba(11,11,16,0)']}
        style={styles.glow}
        pointerEvents="none"
      />

      {/* ------------------------------ header ----------------------------- */}
      <View style={[styles.header, { paddingTop: insets.top, height: headerH }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, headerBg]} pointerEvents="none">
          <Frost blur={18} iosTint="rgba(11,11,16,0.66)" androidTint="rgba(11,11,16,0.96)" />
        </Animated.View>

        <Row style={styles.headerRow}>
          <Press onPress={() => setAddrOpen(true)} style={{ flex: 1 }} haptic="select">
            <Row>
              <View style={styles.pin}>
                <Ionicons name="location" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: sp(2.5) }}>
                <Row>
                  <T v="xs" c={colors.mute}>DELIVER TO</T>
                  <Ionicons name="chevron-down" size={12} color={colors.mute} style={{ marginLeft: 4 }} />
                </Row>
                <T v="h3" numberOfLines={1} style={{ marginTop: 1 }}>
                  {address.label} · <T v="sm" c={colors.dim}>{address.line}</T>
                </T>
              </View>
            </Row>
          </Press>

          <IconBtn
            name="cart-outline"
            badge={totals.count}
            onPress={() => nav.navigate('Cart')}
            style={{ marginLeft: sp(2) }}
          />
        </Row>
      </View>

      {/* ------------------------------ content ---------------------------- */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerH + sp(2), paddingBottom: insets.bottom + 190 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <Animated.View style={greetingStyle}>
          <View style={styles.greeting}>
            <T v="display">Hungry, {USER.name}?</T>
            <T v="body" c={colors.mute} style={{ marginTop: sp(1.5) }}>
              {list.length} places delivering to you right now
            </T>
          </View>
        </Animated.View>

        {/* search entry — the real input lives on the Search tab */}
        <Press onPress={() => nav.navigate('Search')} style={styles.searchBar} scaleTo={0.985} haptic="select">
          <Ionicons name="search" size={19} color={colors.mute} />
          <T v="body" c={colors.mute} style={{ flex: 1, marginLeft: sp(3) }}>
            Search “mandi”, “shawarma”, “kunafa”…
          </T>
          <View style={styles.searchChip}>
            <Ionicons name="options-outline" size={16} color={colors.primary} />
          </View>
        </Press>

        {/* live order strip */}
        {!!liveOrder && (
          <Animated.View entering={FadeInDown.duration(260)}>
            <Press
              onPress={() => nav.navigate('Order', { id: liveOrder.id })}
              style={styles.liveStrip}
              scaleTo={0.98}
            >
              <View style={styles.livePulse}>
                <Ionicons name="bicycle" size={17} color={colors.mint} />
              </View>
              <View style={{ flex: 1, marginLeft: sp(3) }}>
                <T v="h3">Order on the way</T>
                <T v="sm" c={colors.dim} style={{ marginTop: 2 }}>
                  {getRestaurant(liveOrder.rid)?.name} · arriving in ~{liveOrder.etaMinutes} min
                </T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mute} />
            </Press>
          </Animated.View>
        )}

        <View style={{ height: sp(5) }} />
        <PromoCarousel onPressPromo={() => nav.navigate('Search')} />

        <View style={{ height: sp(7) }} />
        <SectionHeader title="What are you after?" />
        <CategoryRail value={cat} onChange={setCat} />

        <View style={{ height: sp(7) }} />
        <SectionHeader
          title="Trending now"
          sub="What everyone's ordering tonight"
          action="See all"
          onAction={() => nav.navigate('Search')}
        />
        {loading ? (
          <Row style={{ paddingHorizontal: sp(5), gap: sp(3.5) }}>
            {[0, 1, 2].map((i) => (
              <View key={i}>
                <Skeleton w={168} h={144} r={radius.md} delay={i * 120} />
                <Skeleton w={120} h={14} style={{ marginTop: sp(2.5) }} delay={i * 120} />
                <Skeleton w={80} h={12} style={{ marginTop: sp(1.5) }} delay={i * 120} />
              </View>
            ))}
          </Row>
        ) : (
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: sp(5), gap: sp(3.5) }}
          >
            {TRENDING.map((d, i) => (
              <Animated.View key={d.id} entering={FadeInDown.delay(i * 55).duration(260)}>
                <DishCard dish={d} />
              </Animated.View>
            ))}
          </Animated.ScrollView>
        )}

        <View style={{ height: sp(7) }} />
        <SectionHeader
          title={cat === 'all' ? 'All restaurants' : 'Matching your craving'}
          sub={`${list.length} nearby`}
        />

        <View style={{ paddingHorizontal: sp(5), gap: sp(4) }}>
          {loading && [0, 1].map((i) => <Skeleton key={i} w="100%" h={220} r={radius.lg} delay={i * 150} />)}

          {!loading && list.length === 0 && (
            <Empty
              icon="fast-food-outline"
              title="Nothing here yet"
              sub="We don't have that cuisine in your area. Try another category."
              action="Show everything"
              onAction={() => setCat('all')}
            />
          )}

          {!loading &&
            list.map((r, i) => (
              <Animated.View
                key={`${cat}-${r.id}`}
                entering={FadeInDown.delay(Math.min(i, 6) * 60).duration(260)}
              >
                <RestaurantCard r={r} width={CARD_W} />
              </Animated.View>
            ))}
        </View>
      </Animated.ScrollView>

      {/* --------------------------- address sheet ------------------------- */}
      <Sheet
        visible={addrOpen}
        onClose={() => setAddrOpen(false)}
        title="Delivery address"
        sub="Where should we send it?"
      >
        <View style={{ gap: sp(2.5) }}>
          {ADDRESSES.map((a) => {
            const active = a.id === addressId;
            return (
              <Press
                key={a.id}
                onPress={() => {
                  setAddress(a.id);
                  setAddrOpen(false);
                }}
                style={[styles.addrRow, active && styles.addrRowActive]}
                scaleTo={0.98}
              >
                <View style={[styles.addrIcon, active && { backgroundColor: hexA(colors.primary, 0.18) }]}>
                  <Ionicons name={a.icon} size={17} color={active ? colors.primary : colors.dim} />
                </View>
                <View style={{ flex: 1, marginLeft: sp(3) }}>
                  <T v="h3">{a.label}</T>
                  <T v="sm" c={colors.mute} numberOfLines={1} style={{ marginTop: 2 }}>{a.line}</T>
                  <T v="xs" c={colors.mute} style={{ marginTop: 4 }}>{a.note.toUpperCase()}</T>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </Press>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  headerRow: { paddingHorizontal: sp(5), paddingBottom: sp(2.5) },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: hexA(colors.primary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { paddingHorizontal: sp(5), paddingTop: sp(3), paddingBottom: sp(5) },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: sp(5),
    height: 54,
    borderRadius: radius.lg,
    paddingHorizontal: sp(4),
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  searchChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexA(colors.primary, 0.14),
  },
  liveStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: sp(5),
    marginTop: sp(3),
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: hexA(colors.mint, 0.09),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.mint, 0.3),
  },
  livePulse: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexA(colors.mint, 0.16),
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  addrRowActive: { borderColor: hexA(colors.primary, 0.5), backgroundColor: hexA(colors.primary, 0.07) },
  addrIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
  },
});
