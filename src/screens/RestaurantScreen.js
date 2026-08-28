import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Share, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, hexA, grad } from '../theme';
import { getRestaurant } from '../data';
import { useStore, money } from '../state/store';
import Press from '../components/Press';
import Img from '../components/Img';
import CartBar from '../components/CartBar';
import Frost from '../components/Frost';
import { DishRow } from '../components/DishCard';
import { HeartButton } from '../components/RestaurantCard';
import { T, Row, Badge, Empty } from '../components/ui';

const HERO_H = 300;
const CHIPS_H = 56;

export default function RestaurantScreen() {
  const { id } = useRoute().params ?? {};
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const scroller = useRef(null);
  const offsets = useRef([]);

  const r = getRestaurant(String(id));
  const { favRestaurants, toggleFavRestaurant } = useStore();

  const [active, setActive] = useState(0);
  const [chipsOn, setChipsOn] = useState(false);
  const y = useSharedValue(0);

  // absolute content offsets of each menu section, shared with the UI thread
  const sectionY = useSharedValue([]);
  const lastActive = useSharedValue(0);
  const lastChips = useSharedValue(false);

  const topBarH = insets.top + 52;
  const stickAt = HERO_H - topBarH - 30;

  // Section tops are reported relative to the menu wrapper, so we add the
  // wrapper's own offset to get a real content coordinate.
  const menuTop = useRef(0);
  const rawOffsets = useRef({});
  const publish = useCallback(() => {
    const list = Object.keys(rawOffsets.current)
      .map(Number)
      .sort((a, b) => a - b)
      .map((k) => menuTop.current + rawOffsets.current[k]);
    sectionY.value = list;
    offsets.current = list;
  }, [sectionY]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const top = e.contentOffset.y;
      y.value = top;

      // only cross back to JS when something actually changes
      const on = top > stickAt - 30;
      if (on !== lastChips.value) {
        lastChips.value = on;
        runOnJS(setChipsOn)(on);
      }

      const list = sectionY.value;
      if (list.length) {
        let i = 0;
        const probe = top + topBarH + CHIPS_H + 24;
        for (let k = 0; k < list.length; k += 1) if (probe >= list[k]) i = k;
        if (i !== lastActive.value) {
          lastActive.value = i;
          runOnJS(setActive)(i);
        }
      }
    },
  });

  /* --------------------------- animated bits -------------------------- */

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      // pull down → grow; scroll up → drift for parallax
      { scale: interpolate(y.value, [-200, 0], [1.55, 1], Extrapolation.CLAMP) },
      { translateY: interpolate(y.value, [0, HERO_H], [0, HERO_H * 0.45], Extrapolation.CLAMP) },
    ],
  }));

  const heroFade = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, HERO_H * 0.75], [0, 1], Extrapolation.CLAMP),
  }));

  const barBg = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [stickAt - 60, stickAt], [0, 1], Extrapolation.CLAMP),
  }));

  const barTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [stickAt - 40, stickAt], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [stickAt - 40, stickAt], [12, 0], Extrapolation.CLAMP) }],
  }));

  const chipsStyle = useAnimatedStyle(() => {
    const p = interpolate(y.value, [stickAt - 30, stickAt], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-18, 0]) }],
    };
  });

  // every hook is declared above this point
  if (!r) {
    return (
      <View style={styles.screen}>
        <Empty
          icon="alert-circle-outline"
          title="Restaurant not found"
          action="Go back"
          onAction={() => nav.goBack()}
        />
      </View>
    );
  }

  const fav = favRestaurants.includes(r.id);

  /* ------------------------------ helpers ----------------------------- */

  const jumpTo = (i) => {
    const at = offsets.current?.[i];
    if (at == null) return;
    setActive(i);
    lastActive.value = i;
    scroller.current?.scrollTo({ y: Math.max(0, at - topBarH - CHIPS_H - 8), animated: true });
  };

  const share = () =>
    Share.share({
      message: `${r.name} on Foodoo — ${r.tagline}. ${r.rating}★ · ${r.etaMin}-${r.etaMax} min`,
    }).catch(() => {});

  return (
    <View style={styles.screen}>
      {/* ------------------------------ hero ------------------------------ */}
      <Animated.View style={[styles.hero, heroStyle]}>
        <Img uri={r.heroImg} seed={r.id} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={grad.scrimDown} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }, heroFade]} />
      </Animated.View>

      {/* ---------------------------- scroller ---------------------------- */}
      <Animated.ScrollView
        ref={scroller}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 190 }}
      >
        <View style={{ height: HERO_H - 44 }} pointerEvents="none" />

        {/* info panel that overlaps the hero */}
        <View style={styles.panel}>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {r.badges.map((b) => (
              <Badge key={b} label={b.toUpperCase()} tint={b === 'Free delivery' ? colors.mint : colors.primary} />
            ))}
            {!r.open && <Badge label="CLOSED · PRE-ORDER" tint={colors.mute} />}
          </Row>

          <T v="display" style={{ marginTop: sp(3) }}>{r.name}</T>
          <T v="body" c={colors.dim} style={{ marginTop: sp(1.5) }}>{r.tagline}</T>
          <T v="sm" c={colors.mute} style={{ marginTop: sp(2) }}>
            {r.cuisines.join(' · ')} · {r.area}
          </T>

          <Row style={styles.statRow}>
            <Stat icon="star" tint={colors.gold} value={String(r.rating)} label={`${r.reviews} reviews`} />
            <View style={styles.statSep} />
            <Stat icon="time-outline" tint={colors.text} value={`${r.etaMin}-${r.etaMax}`} label="minutes" />
            <View style={styles.statSep} />
            <Stat
              icon="bicycle-outline"
              tint={r.deliveryFee === 0 ? colors.mint : colors.text}
              value={r.deliveryFee === 0 ? 'Free' : money(r.deliveryFee)}
              label={`${r.distanceKm} km away`}
            />
          </Row>

          {!!r.promo && (
            <Animated.View entering={FadeInDown.delay(150).duration(260)}>
              <View style={styles.promo}>
                <Ionicons name="pricetag" size={15} color={colors.gold} />
                <T v="sm" c={colors.gold} style={{ marginLeft: sp(2.5), flex: 1, fontWeight: '700' }}>
                  {r.promo}
                </T>
                <Ionicons name="chevron-forward" size={15} color={hexA(colors.gold, 0.7)} />
              </View>
            </Animated.View>
          )}
        </View>

        {/* menu */}
        <View
          style={{ marginTop: sp(6) }}
          onLayout={(e) => {
            menuTop.current = e.nativeEvent.layout.y;
            publish();
          }}
        >
          {r.sections.map((s, i) => (
            <View
              key={s.title}
              onLayout={(e) => {
                rawOffsets.current[i] = e.nativeEvent.layout.y;
                publish();
              }}
            >
              <Row style={styles.sectionTitle}>
                <T v="h2">{s.title}</T>
                <T v="sm" c={colors.mute} style={{ marginLeft: sp(2.5) }}>{s.data.length}</T>
              </Row>

              <View style={styles.menuCard}>
                {s.data.map((d, k) => (
                  <Animated.View key={d.id} entering={FadeIn.delay(Math.min(k, 6) * 40)}>
                    <DishRow dish={d} />
                    {k < s.data.length - 1 && <View style={styles.hair} />}
                  </Animated.View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <T v="sm" c={colors.mute} style={{ textAlign: 'center' }}>{r.address}</T>
          <T v="xs" c={colors.mute} style={{ textAlign: 'center', marginTop: 6 }}>
            MINIMUM ORDER {`$${r.minOrder.toFixed(2)}`}
          </T>
        </View>
      </Animated.ScrollView>

      {/* ---------------------------- top chrome --------------------------- */}
      <View style={[styles.topBar, { height: topBarH, paddingTop: insets.top }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, barBg]} pointerEvents="none">
          <Frost blur={20} iosTint="rgba(11,11,16,0.7)" androidTint="rgba(11,11,16,0.96)" />
        </Animated.View>

        <Row style={{ paddingHorizontal: sp(4), flex: 1 }}>
          <Press onPress={() => nav.goBack()} style={styles.round} scaleTo={0.88}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Press>

          <Animated.View style={[{ flex: 1, marginHorizontal: sp(3) }, barTitle]}>
            <T v="h3" numberOfLines={1}>{r.name}</T>
          </Animated.View>

          <Press onPress={share} style={[styles.round, { marginRight: sp(2) }]} scaleTo={0.88}>
            <Ionicons name="share-outline" size={19} color="#fff" />
          </Press>
          <HeartButton active={fav} onToggle={() => toggleFavRestaurant(r.id)} style={styles.round} />
        </Row>
      </View>

      {/* section chips — fade in once the menu reaches the top */}
      <Animated.View
        style={[styles.chips, { top: topBarH }, chipsStyle]}
        pointerEvents={chipsOn ? 'auto' : 'none'}
      >
        <Frost blur={20} iosTint="rgba(11,11,16,0.7)" androidTint="rgba(11,11,16,0.96)" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: sp(4), gap: sp(2), alignItems: 'center' }}
        >
          {r.sections.map((s, i) => (
            <Press key={s.title} onPress={() => jumpTo(i)} haptic="select" scaleTo={0.94}>
              <View style={[styles.chip, active === i && styles.chipActive]}>
                <T v="sm" c={active === i ? '#0B0B10' : colors.dim} style={{ fontWeight: '700' }}>
                  {s.title}
                </T>
              </View>
            </Press>
          ))}
        </ScrollView>
      </Animated.View>

      <CartBar bottom={insets.bottom + sp(4)} />
    </View>
  );
}

function Stat({ icon, value, label, tint }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Row>
        <Ionicons name={icon} size={14} color={tint} />
        <T v="h3" c={tint} style={{ marginLeft: 5 }}>{value}</T>
      </Row>
      <T v="xs" c={colors.mute} style={{ marginTop: 4 }}>{label.toUpperCase()}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_H },
  panel: {
    marginHorizontal: sp(4),
    padding: sp(5),
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.strokeHi,
  },
  statRow: {
    marginTop: sp(5),
    paddingTop: sp(4),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  statSep: { width: StyleSheet.hairlineWidth, height: 30, backgroundColor: colors.stroke },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(4),
    padding: sp(3.5),
    borderRadius: radius.md,
    backgroundColor: hexA(colors.gold, 0.1),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.gold, 0.3),
  },
  sectionTitle: { paddingHorizontal: sp(5), marginBottom: sp(3), marginTop: sp(5), alignItems: 'baseline' },
  menuCard: {
    marginHorizontal: sp(4),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    overflow: 'hidden',
  },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginHorizontal: sp(5) },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, justifyContent: 'center' },
  round: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,11,16,0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA('#FFFFFF', 0.16),
  },
  chips: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CHIPS_H,
    zIndex: 15,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.stroke,
    overflow: 'hidden',
  },
  chip: {
    paddingHorizontal: sp(4),
    height: 34,
    borderRadius: radius.pill,
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: { marginTop: sp(8), paddingHorizontal: sp(6) },
});
