import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, sp, type, hexA } from '../theme';
import { PROMOS } from '../data';
import Img from './Img';
import Press from './Press';
import { T } from './ui';

const { width: SCREEN } = Dimensions.get('window');
const GAP = sp(3);
const CARD_W = SCREEN - sp(10);
const SNAP = CARD_W + GAP;

function Slide({ item, index, x, onPress }) {
  const a = useAnimatedStyle(() => {
    const d = x.value / SNAP - index;
    return {
      transform: [
        { scale: interpolate(Math.abs(d), [0, 1], [1, 0.92], Extrapolation.CLAMP) },
        { translateX: interpolate(d, [-1, 1], [24, -24], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(Math.abs(d), [0, 1], [1, 0.55], Extrapolation.CLAMP),
    };
  });

  // photo drifts the opposite way for a parallax feel
  const photo = useAnimatedStyle(() => {
    const d = x.value / SNAP - index;
    return { transform: [{ translateX: interpolate(d, [-1, 1], [-30, 30], Extrapolation.CLAMP) }, { scale: 1.15 }] };
  });

  return (
    <Animated.View style={[{ width: CARD_W }, a]}>
      <Press onPress={onPress} scaleTo={0.98}>
        <View style={styles.card}>
          <Animated.View style={[StyleSheet.absoluteFill, photo]}>
            <Img uri={item.img} seed={item.id} style={StyleSheet.absoluteFill} />
          </Animated.View>

          <LinearGradient
            colors={[hexA(item.tint, 0.1), 'rgba(11,11,16,0.55)', 'rgba(11,11,16,0.94)']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.cardBody}>
            <View style={[styles.tag, { backgroundColor: hexA(item.tint, 0.22), borderColor: hexA(item.tint, 0.5) }]}>
              <Ionicons name="pricetag" size={11} color={item.tint} />
              <T v="xs" c={item.tint} style={{ marginLeft: 5 }}>LIMITED</T>
            </View>

            <T v="display" style={{ marginTop: sp(2.5), lineHeight: 34 }}>{item.title}</T>
            <T v="sm" c={colors.dim} style={{ marginTop: sp(2) }}>{item.sub}</T>

            <View style={[styles.cta, { backgroundColor: item.tint }]}>
              <T v="sm" c="#0B0B10" style={{ fontWeight: '800' }}>{item.cta}</T>
              <Ionicons name="arrow-forward" size={14} color="#0B0B10" style={{ marginLeft: 6 }} />
            </View>
          </View>
        </View>
      </Press>
    </Animated.View>
  );
}

export default function PromoCarousel({ onPressPromo }) {
  const x = useSharedValue(0);
  const [page, setPage] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
    },
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
        contentContainerStyle={{ paddingHorizontal: sp(5), gap: GAP }}
      >
        {PROMOS.map((p, i) => (
          <Slide key={p.id} item={p} index={i} x={x} onPress={() => onPressPromo?.(p)} />
        ))}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {PROMOS.map((p, i) => (
          <Dot key={p.id} active={i === page} tint={PROMOS[page]?.tint ?? colors.primary} />
        ))}
      </View>
    </View>
  );
}

function Dot({ active, tint }) {
  const a = useAnimatedStyle(() => ({
    width: withTiming(active ? 20 : 6, { duration: 200 }),
    backgroundColor: active ? tint : colors.surfaceMax,
  }));
  return <Animated.View style={[styles.dot, a]} />;
}

const styles = StyleSheet.create({
  card: {
    height: 210,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
  },
  cardBody: { padding: sp(5) },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: sp(4),
    paddingHorizontal: sp(4),
    paddingVertical: sp(2.5),
    borderRadius: radius.pill,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: sp(3.5) },
  dot: { height: 6, borderRadius: 3 },
});
