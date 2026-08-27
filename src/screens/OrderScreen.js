import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, type, hexA, grad, spring, springSoft } from '../theme';
import { ORDER_STAGES, getRestaurant, ADDRESSES } from '../data';
import { useStore, money } from '../state/store';
import Press from '../components/Press';
import Img from '../components/Img';
import { T, Row, Badge, Empty, GhostButton, Rating } from '../components/ui';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/* route geometry — one cubic bezier drawn in a 320×220 box */
const MAP_W = 320;
const MAP_H = 220;
const P = { x0: 26, y0: 168, x1: 108, y1: 44, x2: 214, y2: 214, x3: 294, y3: 62 };
const PATH_D = `M${P.x0},${P.y0} C${P.x1},${P.y1} ${P.x2},${P.y2} ${P.x3},${P.y3}`;
const PATH_LEN = 430; // close enough for a dash animation

// resolved up front — worklets can't call plain JS helpers like hexA()
const MINT_SOFT = hexA(colors.mint, 0.22);

/** Cubic bezier evaluated on the UI thread. */
const bez = (a, b, c, d, t) => {
  'worklet';
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

export default function OrderScreen() {
  const { id } = useRoute().params ?? {};
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { orders, advance, addressId } = useStore();

  const order = orders.find((o) => o.id === String(id));
  const last = ORDER_STAGES.length - 1;
  const stage = order?.stage ?? 0;
  const done = stage >= last;

  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const [rated, setRated] = useState(0);

  // walk the order forward on a timer so the demo feels alive
  useEffect(() => {
    if (!order || done) return undefined;
    const t = setInterval(() => advance(order.id), 6500);
    return () => clearInterval(t);
  }, [order, done, advance]);

  useEffect(() => {
    progress.value = withSpring(stage / last, springSoft);
  }, [stage, last, progress]);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 1 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const dash = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LEN * (1 - progress.value),
  }));

  const courier = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      transform: [
        { translateX: bez(P.x0, P.x1, P.x2, P.x3, t) - 18 },
        { translateY: bez(P.y0, P.y1, P.y2, P.y3, t) - 18 },
        { scale: 1 + interpolate(pulse.value, [0, 1], [0, 0.06]) },
      ],
    };
  });

  const ripple = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value,
    transform: [{ scale: 0.6 + pulse.value * 1.5 }],
  }));

  const eta = useMemo(
    () => Math.max(2, Math.round((order?.etaMinutes ?? 30) * (1 - stage / last))),
    [order, stage, last],
  );

  if (!order) {
    return (
      <View style={styles.screen}>
        <Empty
          icon="receipt-outline"
          title="Order not found"
          sub="It may have finished already."
          action="Back to orders"
          onAction={() => nav.navigate('Tabs', { screen: 'Orders' })}
        />
      </View>
    );
  }

  const r = getRestaurant(order.rid);
  const address = ADDRESSES.find((a) => a.id === addressId) ?? ADDRESSES[0];
  const current = ORDER_STAGES[stage];

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[hexA(done ? colors.mint : colors.primary, 0.18), 'rgba(11,11,16,0)']}
        style={styles.glow}
        pointerEvents="none"
      />

      <Row style={{ paddingTop: insets.top + sp(3), paddingHorizontal: sp(5), paddingBottom: sp(3) }}>
        <Press onPress={() => nav.navigate('Tabs', { screen: 'Orders' })} style={styles.round} scaleTo={0.88}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Press>
        <View style={{ flex: 1, marginLeft: sp(3.5) }}>
          <T v="h3">Order {order.id}</T>
          <T v="sm" c={colors.mute} style={{ marginTop: 1 }}>{r?.name}</T>
        </View>
        <Badge label={done ? 'DELIVERED' : 'LIVE'} tint={done ? colors.mint : colors.primary} solid />
      </Row>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      >
        {/* ------------------------------ eta ------------------------------ */}
        <View style={{ paddingHorizontal: sp(5), paddingTop: sp(4) }}>
          {done ? (
            <>
              <Row>
                <T v="display">Delivered</T>
                <Ionicons name="sparkles" size={26} color={colors.gold} style={{ marginLeft: sp(2.5) }} />
              </Row>
              <T v="body" c={colors.mute} style={{ marginTop: sp(2) }}>
                Hope it was worth the wait. Enjoy.
              </T>
            </>
          ) : (
            <>
              <T v="sm" c={colors.mute}>ARRIVING IN</T>
              <Row style={{ alignItems: 'baseline', marginTop: sp(1) }}>
                <Animated.View key={eta} entering={FadeIn.duration(250)}>
                  <T style={{ ...type.display, fontSize: 54, lineHeight: 58 }}>{eta}</T>
                </Animated.View>
                <T v="h2" c={colors.dim} style={{ marginLeft: sp(2) }}>min</T>
              </Row>
              <T v="body" c={colors.dim} style={{ marginTop: sp(2) }}>{current.sub}</T>
            </>
          )}
        </View>

        {/* ------------------------------ map ------------------------------ */}
        <View style={styles.map}>
          <View style={styles.mapGrid} pointerEvents="none">
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={`h${i}`} style={[styles.gridLine, { top: (i + 1) * 27 }]} />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={`v${i}`} style={[styles.gridLineV, { left: (i + 1) * 33 }]} />
            ))}
          </View>

          <Svg width={MAP_W} height={MAP_H} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgGrad id="route" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.primary} />
                <Stop offset="1" stopColor={colors.gold} />
              </SvgGrad>
            </Defs>

            {/* faint full route */}
            <Path d={PATH_D} stroke={colors.surfaceMax} strokeWidth={4} fill="none" strokeLinecap="round" />
            {/* travelled portion */}
            <AnimatedPath
              d={PATH_D}
              stroke="url(#route)"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={PATH_LEN}
              animatedProps={dash}
            />
            <Circle cx={P.x0} cy={P.y0} r={7} fill={colors.surfaceMax} stroke={colors.primary} strokeWidth={3} />
            <Circle cx={P.x3} cy={P.y3} r={7} fill={colors.surfaceMax} stroke={colors.mint} strokeWidth={3} />
          </Svg>

          {/* courier marker riding the curve */}
          <Animated.View style={[styles.courier, courier]}>
            <Animated.View style={[styles.ripple, ripple]} />
            <View style={styles.courierDot}>
              <Ionicons name={done ? 'checkmark' : 'bicycle'} size={17} color="#0B0B10" />
            </View>
          </Animated.View>

          <View style={[styles.mapTag, { left: sp(3), bottom: sp(3) }]}>
            <Ionicons name="restaurant" size={11} color={colors.primary} />
            <T v="xs" c={colors.dim} style={{ marginLeft: 5 }} numberOfLines={1}>{r?.name}</T>
          </View>
          <View style={[styles.mapTag, { right: sp(3), top: sp(3) }]}>
            <Ionicons name="location" size={11} color={colors.mint} />
            <T v="xs" c={colors.dim} style={{ marginLeft: 5 }}>{address.label}</T>
          </View>
        </View>

        {/* ---------------------------- courier ---------------------------- */}
        <Animated.View entering={FadeInDown.delay(120).springify().damping(18)}>
          <Row style={styles.courierCard}>
            <LinearGradient colors={grad.violet} style={styles.avatar}>
              <T v="h3" c="#fff">{order.courier.name[0]}</T>
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: sp(3.5) }}>
              <T v="h3">{order.courier.name}</T>
              <Row style={{ marginTop: 3 }}>
                <Rating value={order.courier.rating} size={12} />
                <T v="sm" c={colors.mute} style={{ marginLeft: 8 }}>
                  {order.courier.vehicle} · {order.courier.trips} trips
                </T>
              </Row>
            </View>
            <Press
              onPress={() => Alert.alert('Message courier', 'Chat is not wired up in this demo build.')}
              style={styles.circleBtn}
              scaleTo={0.88}
            >
              <Ionicons name="chatbubble-ellipses" size={17} color={colors.text} />
            </Press>
            <Press
              onPress={() => Alert.alert('Call courier', 'Calling is not wired up in this demo build.')}
              style={[styles.circleBtn, { marginLeft: sp(2), backgroundColor: hexA(colors.mint, 0.16) }]}
              scaleTo={0.88}
            >
              <Ionicons name="call" size={17} color={colors.mint} />
            </Press>
          </Row>
        </Animated.View>

        {/* --------------------------- timeline ---------------------------- */}
        <View style={styles.timeline}>
          {ORDER_STAGES.map((s, i) => {
            const passed = i <= stage;
            const active = i === stage;
            return (
              <Row key={s.id} style={{ alignItems: 'flex-start' }}>
                <View style={{ alignItems: 'center', width: 34 }}>
                  <StageDot passed={passed} active={active} icon={s.icon} />
                  {i < ORDER_STAGES.length - 1 && (
                    <View style={[styles.stem, passed && i < stage && { backgroundColor: colors.mint }]} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: sp(3.5), paddingBottom: sp(6) }}>
                  <T v="h3" c={passed ? colors.text : colors.mute}>{s.label}</T>
                  <T v="sm" c={active ? colors.mint : colors.mute} style={{ marginTop: 3 }}>
                    {active ? 'Happening now' : s.sub}
                  </T>
                </View>
              </Row>
            );
          })}
        </View>

        {/* ----------------------------- rating ---------------------------- */}
        {done && (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.rate}>
            <T v="h2">How was it?</T>
            <T v="sm" c={colors.mute} style={{ marginTop: sp(1.5) }}>Rate {r?.name}</T>
            <Row style={{ marginTop: sp(4), gap: sp(2) }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Press key={n} onPress={() => setRated(n)} haptic="light" scaleTo={0.85}>
                  <Ionicons
                    name={n <= rated ? 'star' : 'star-outline'}
                    size={32}
                    color={n <= rated ? colors.gold : colors.surfaceMax}
                  />
                </Press>
              ))}
            </Row>
            {rated > 0 && (
              <Animated.View entering={FadeIn}>
                <T v="sm" c={colors.mint} style={{ marginTop: sp(3.5) }}>
                  Thanks — {rated} star{rated > 1 ? 's' : ''} recorded.
                </T>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* ---------------------------- receipt ---------------------------- */}
        <View style={styles.receipt}>
          <Row style={{ marginBottom: sp(3.5) }}>
            <Img uri={r?.logoImg} seed={order.id} radius={radius.md} style={{ width: 40, height: 40 }} />
            <View style={{ flex: 1, marginLeft: sp(3) }}>
              <T v="h3">{r?.name}</T>
              <T v="sm" c={colors.mute} style={{ marginTop: 2 }}>{order.placedAt}</T>
            </View>
          </Row>
          {order.items.map((it, i) => (
            <Row key={i} style={{ marginBottom: sp(2) }}>
              <T v="sm" c={colors.dim} style={{ width: 26 }}>{it.qty}×</T>
              <T v="sm" c={colors.dim} numberOfLines={1} style={{ flex: 1 }}>{it.name}</T>
            </Row>
          ))}
          <View style={styles.hair} />
          <Row>
            <T v="h3" style={{ flex: 1 }}>Total paid</T>
            <T v="h3" c={colors.primary}>{money(order.total)}</T>
          </Row>
        </View>

        <View style={{ paddingHorizontal: sp(5), marginTop: sp(5) }}>
          <GhostButton
            label="Back to orders"
            icon="receipt-outline"
            onPress={() => nav.navigate('Tabs', { screen: 'Orders' })}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function StageDot({ passed, active, icon }) {
  const s = useSharedValue(passed ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(passed ? 1 : 0, spring);
  }, [passed, s]);

  const a = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + s.value * 0.1 }],
    backgroundColor: s.value > 0.5 ? (active ? colors.mint : MINT_SOFT) : colors.surfaceHi,
    borderColor: s.value > 0.5 ? colors.mint : colors.surfaceMax,
  }));

  return (
    <Animated.View style={[styles.dot, a]}>
      <Ionicons name={icon} size={15} color={active ? '#0B0B10' : passed ? colors.mint : colors.mute} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  round: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  map: {
    height: MAP_H,
    marginHorizontal: sp(5),
    marginTop: sp(5),
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  courier: { position: 'absolute', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  ripple: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: hexA(colors.gold, 0.4) },
  courierDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  mapTag: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 150,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,11,16,0.8)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  courierCard: {
    marginHorizontal: sp(5),
    marginTop: sp(5),
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
  },
  timeline: { paddingHorizontal: sp(5), marginTop: sp(7) },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  stem: { width: 2, flex: 1, minHeight: 30, backgroundColor: colors.surfaceMax, marginTop: 4 },
  rate: {
    marginHorizontal: sp(5),
    padding: sp(5),
    borderRadius: radius.lg,
    backgroundColor: hexA(colors.gold, 0.08),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.gold, 0.28),
  },
  receipt: {
    marginHorizontal: sp(5),
    marginTop: sp(5),
    padding: sp(5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginVertical: sp(3.5) },
});
