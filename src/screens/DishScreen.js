import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, type, hexA, grad, elev } from '../theme';
import { getDish, getRestaurant } from '../data';
import { useStore, money, unitPriceOf } from '../state/store';
import Press from '../components/Press';
import Img from '../components/Img';
import { T, Row, Badge, Empty } from '../components/ui';

const HERO_H = 320;

export default function DishScreen() {
  const { id } = useRoute().params ?? {};
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const dish = getDish(String(id));
  const { add, cartRid, favDishes, toggleFavDish } = useStore();

  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [sel, setSel] = useState(() => {
    const out = {};
    for (const g of dish?.options || []) {
      if (g.required && g.items.length) out[g.id] = [g.items[0].id];
    }
    return out;
  });

  const y = useSharedValue(0);
  const pop = useSharedValue(1);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(y.value, [-220, 0], [1.6, 1], Extrapolation.CLAMP) },
      { translateY: interpolate(y.value, [0, HERO_H], [0, HERO_H * 0.4], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(y.value, [0, HERO_H * 0.8], [1, 0.15], Extrapolation.CLAMP),
  }));

  const priceStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const unit = useMemo(() => (dish ? unitPriceOf(dish, sel) : 0), [dish, sel]);
  const total = Math.round(unit * qty * 100) / 100;

  // hooks are all declared above
  if (!dish) {
    return (
      <View style={styles.screen}>
        <Empty icon="alert-circle-outline" title="Dish not found" action="Go back" onAction={() => nav.goBack()} />
      </View>
    );
  }

  const r = getRestaurant(dish.rid);
  const fav = favDishes.includes(dish.id);

  const bump = () => {
    pop.value = withSequence(withTiming(1.08, { duration: 110 }), withTiming(1, { duration: 150 }));
  };

  const toggle = (group, itemId) => {
    setSel((s) => {
      const cur = s[group.id] || [];
      const max = group.max ?? 99;
      let next;
      if (max === 1) {
        // radio: required groups can't be emptied
        next = cur[0] === itemId && !group.required ? [] : [itemId];
      } else if (cur.includes(itemId)) {
        next = cur.filter((x) => x !== itemId);
      } else {
        next = cur.length >= max ? cur : [...cur, itemId];
      }
      return { ...s, [group.id]: next };
    });
    bump();
  };

  const missing = (dish.options || []).filter((g) => g.required && !(sel[g.id] || []).length);

  const commit = () => {
    if (missing.length) {
      Alert.alert('Almost there', `Please choose: ${missing.map((g) => g.title).join(', ')}`);
      return;
    }
    const doAdd = () => {
      add(dish, sel, qty, note.trim());
      nav.goBack();
    };
    if (cartRid && cartRid !== dish.rid) {
      Alert.alert(
        'Start a new cart?',
        `Your cart has items from ${getRestaurant(cartRid)?.name}. Adding this will clear it.`,
        [
          { text: 'Keep cart', style: 'cancel' },
          { text: 'Start new', style: 'destructive', onPress: doAdd },
        ],
      );
      return;
    }
    doAdd();
  };

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.hero, heroStyle]}>
        <Img uri={dish.imgLarge} seed={dish.id} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={grad.scrimDown} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        <View style={{ height: HERO_H - 52 }} pointerEvents="none" />

        <View style={styles.body}>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {!!dish.badge && <Badge label={dish.badge.toUpperCase()} tint={colors.gold} solid />}
            {dish.veg && <Badge label="VEGETARIAN" tint={colors.mint} />}
            {dish.spicy && <Badge label="SPICY" tint={colors.danger} />}
          </Row>

          <T v="display" style={{ marginTop: sp(3), lineHeight: 36 }}>{dish.name}</T>

          <Press
            onPress={() => nav.replace('Restaurant', { id: dish.rid })}
            style={{ marginTop: sp(2.5) }}
            haptic="select"
          >
            <Row>
              <Img uri={r?.logoImg} seed={r?.id} radius={9} style={{ width: 26, height: 26 }} />
              <T v="sm" c={colors.primary} style={{ marginLeft: sp(2.5), fontWeight: '700' }}>{r?.name}</T>
              <Ionicons name="chevron-forward" size={13} color={colors.primary} />
            </Row>
          </Press>

          <T v="body" c={colors.dim} style={{ marginTop: sp(4), lineHeight: 22 }}>{dish.desc}</T>

          <Row style={styles.facts}>
            <Fact icon="star" tint={colors.gold} value={String(dish.rating)} label={`${dish.reviews} reviews`} />
            <View style={styles.factSep} />
            <Fact icon="flame-outline" tint={colors.primary} value={String(dish.kcal)} label="calories" />
            <View style={styles.factSep} />
            <Fact icon="time-outline" tint={colors.text} value={`${dish.prepMin}m`} label="prep time" />
          </Row>

          {/* ---------------------------- options --------------------------- */}
          {(dish.options || []).map((g, gi) => {
            const cur = sel[g.id] || [];
            const single = (g.max ?? 99) === 1;
            return (
              <Animated.View
                key={g.id}
                entering={FadeInDown.delay(gi * 70).duration(260)}
                style={{ marginTop: sp(7) }}
              >
                <Row>
                  <T v="h2" style={{ flex: 1 }}>{g.title}</T>
                  <Badge
                    label={g.required ? 'REQUIRED' : `UP TO ${g.max}`}
                    tint={g.required ? colors.primary : colors.mute}
                  />
                </Row>

                <View style={styles.optGroup}>
                  {g.items.map((it, ii) => {
                    const on = cur.includes(it.id);
                    const full = !single && !on && cur.length >= (g.max ?? 99);
                    return (
                      <View key={it.id}>
                        <Press
                          onPress={() => !full && toggle(g, it.id)}
                          haptic="select"
                          scaleTo={0.99}
                          style={[styles.opt, full && { opacity: 0.4 }]}
                        >
                          <View style={[styles.mark, single && styles.markRound, on && styles.markOn]}>
                            {on && (
                              <Ionicons name={single ? 'ellipse' : 'checkmark'} size={single ? 9 : 13} color="#0B0B10" />
                            )}
                          </View>
                          <T v="body" style={{ flex: 1, marginLeft: sp(3.5) }}>{it.label}</T>
                          {it.price > 0 && (
                            <T v="sm" c={on ? colors.primary : colors.mute} style={{ fontWeight: '700' }}>
                              +{money(it.price)}
                            </T>
                          )}
                        </Press>
                        {ii < g.items.length - 1 && <View style={styles.optHair} />}
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            );
          })}

          {/* --------------------------- instructions ------------------------ */}
          <View style={{ marginTop: sp(7) }}>
            <T v="h2">Special instructions</T>
            <T v="sm" c={colors.mute} style={{ marginTop: 4 }}>Allergies, no onions, extra napkins…</T>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note for the kitchen"
              placeholderTextColor={colors.mute}
              multiline
              style={styles.note}
              selectionColor={colors.primary}
            />
          </View>
        </View>
      </Animated.ScrollView>

      {/* ---------------------------- top chrome --------------------------- */}
      <Row style={[styles.topBar, { top: insets.top + sp(2) }]} pointerEvents="box-none">
        <Press onPress={() => nav.goBack()} style={styles.round} scaleTo={0.88}>
          <Ionicons name="chevron-down" size={22} color="#fff" />
        </Press>
        <View style={{ flex: 1 }} />
        <Press onPress={() => toggleFavDish(dish.id)} style={styles.round} scaleTo={0.88} haptic="medium">
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={19} color={fav ? colors.danger : '#fff'} />
        </Press>
      </Row>

      {/* ------------------------------ footer ----------------------------- */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, sp(4)) }]}>
          <Row style={styles.stepper}>
            <Press
              onPress={() => {
                setQty((q) => Math.max(1, q - 1));
                bump();
              }}
              style={styles.stepBtn}
              scaleTo={0.85}
              disabled={qty === 1}
            >
              <Ionicons name="remove" size={19} color={qty === 1 ? colors.mute : colors.text} />
            </Press>
            <Animated.Text key={qty} entering={FadeIn.duration(150)} style={styles.stepQty}>{qty}</Animated.Text>
            <Press
              onPress={() => {
                setQty((q) => Math.min(20, q + 1));
                bump();
              }}
              style={styles.stepBtn}
              scaleTo={0.85}
            >
              <Ionicons name="add" size={19} color={colors.text} />
            </Press>
          </Row>

          <Press onPress={commit} haptic="success" scaleTo={0.97} style={{ flex: 1, marginLeft: sp(3) }}>
            <LinearGradient
              colors={grad.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.addBtn, elev(2, colors.primary)]}
            >
              {/* padding on the inner row, not the gradient — see PrimaryButton */}
              <View style={styles.addBtnInner}>
                <T v="h3" c="#fff">Add to cart</T>
                <Animated.View style={[styles.pricePill, priceStyle]}>
                  <T v="sm" c="#fff" style={{ fontWeight: '800' }}>{money(total)}</T>
                </Animated.View>
              </View>
            </LinearGradient>
          </Press>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Fact({ icon, value, label, tint }) {
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
  body: {
    paddingHorizontal: sp(5),
    paddingTop: sp(5),
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    minHeight: 400,
  },
  facts: {
    marginTop: sp(5),
    paddingVertical: sp(4),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  factSep: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: colors.stroke },
  optGroup: {
    marginTop: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    overflow: 'hidden',
  },
  opt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sp(4), paddingVertical: sp(3.5) },
  optHair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginLeft: sp(4) },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.surfaceMax,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markRound: { borderRadius: 11 },
  markOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  note: {
    marginTop: sp(3.5),
    minHeight: 92,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    padding: sp(4),
    color: colors.text,
    ...type.body,
    textAlignVertical: 'top',
  },
  topBar: { position: 'absolute', left: sp(4), right: sp(4), zIndex: 20 },
  round: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,11,16,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA('#FFFFFF', 0.18),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sp(4),
    paddingTop: sp(3.5),
    backgroundColor: colors.bgSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  stepper: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    paddingHorizontal: 4,
  },
  stepBtn: { width: 38, height: 46, alignItems: 'center', justifyContent: 'center' },
  stepQty: { ...type.h3, color: colors.text, minWidth: 22, textAlign: 'center' },
  addBtn: {
    height: 56,
    borderRadius: radius.lg,
  },
  addBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(4),
  },
  pricePill: {
    marginLeft: sp(3),
    paddingHorizontal: sp(3),
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
});
