import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, type, hexA } from '../theme';
import { getRestaurant } from '../data';
import { useStore, money, unitPriceOf, optionLabels } from '../state/store';
import Press from '../components/Press';
import Img from '../components/Img';
import { DishCard } from '../components/DishCard';
import { T, Row, Empty, PrimaryButton, SectionHeader } from '../components/ui';

const TIPS = [0, 5, 10, 20];

export default function CartScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    lines, cartRid, totals, setQty, remove, clear,
    promo, applyPromo, clearPromo, tip, setTip,
  } = useStore();

  const [code, setCode] = useState('');
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const r = cartRid ? getRestaurant(cartRid) : null;

  // upsell: popular dishes from this restaurant that aren't in the cart yet
  const suggestions = useMemo(() => {
    if (!r) return [];
    const inCart = new Set(lines.map((l) => l.dish.id));
    return r.dishes.filter((d) => !inCart.has(d.id) && d.popular).slice(0, 6);
  }, [r, lines]);

  const tryPromo = () => {
    if (applyPromo(code)) {
      setCode('');
      return;
    }
    shake.value = withSequence(
      withTiming(-8, { duration: 55 }),
      withTiming(8, { duration: 55 }),
      withTiming(-5, { duration: 55 }),
      withTiming(0, { duration: 70 }),
    );
    Alert.alert('Invalid code', 'Try FOODOO50, FREESHIP or SAVE20.');
  };

  const confirmClear = () =>
    Alert.alert('Empty cart?', 'This removes everything in it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Empty', style: 'destructive', onPress: clear },
    ]);

  const belowMin = r ? totals.subtotal < r.minOrder : false;

  if (!lines.length) {
    return (
      <View style={styles.screen}>
        <Header onClose={() => nav.goBack()} title="Your cart" />
        <Empty
          icon="bag-outline"
          title="Your cart is empty"
          sub="Browse restaurants and add something you'll regret in the morning."
          action="Find food"
          onAction={() => nav.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header onClose={() => nav.goBack()} title="Your cart" onClear={confirmClear} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* restaurant strip */}
        {!!r && (
          <Press
            onPress={() => nav.replace('Restaurant', { id: r.id })}
            style={styles.rStrip}
            scaleTo={0.98}
          >
            <Img uri={r.logoImg} seed={r.id} radius={radius.md} style={{ width: 44, height: 44 }} />
            <View style={{ flex: 1, marginLeft: sp(3.5) }}>
              <T v="h3" numberOfLines={1}>{r.name}</T>
              <T v="sm" c={colors.mute} style={{ marginTop: 2 }}>
                {r.etaMin}–{r.etaMax} min ·{' '}
                {r.deliveryFee === 0 ? 'Free delivery' : `${money(r.deliveryFee)} delivery`}
              </T>
            </View>
            <Row style={styles.addMore}>
              <Ionicons name="add" size={15} color={colors.primary} />
              <T v="sm" c={colors.primary} style={{ marginLeft: 4, fontWeight: '700' }}>Add more</T>
            </Row>
          </Press>
        )}

        {/* lines */}
        <View style={styles.list}>
          {lines.map((l, i) => {
            const labels = optionLabels(l.dish, l.opts);
            const unit = unitPriceOf(l.dish, l.opts);
            return (
              <Animated.View
                key={l.key}
                entering={FadeInDown.delay(Math.min(i, 8) * 45).duration(260)}
                exiting={FadeOutLeft.duration(220)}
                layout={LinearTransition.duration(220)}
              >
                <View style={styles.line}>
                  <Img uri={l.dish.img} seed={l.dish.id} radius={radius.md} style={{ width: 74, height: 74 }} />

                  <View style={{ flex: 1, marginLeft: sp(3.5) }}>
                    <Row style={{ alignItems: 'flex-start' }}>
                      <T v="h3" numberOfLines={2} style={{ flex: 1 }}>{l.dish.name}</T>
                      <Press onPress={() => remove(l.key)} haptic="light" scaleTo={0.85} style={{ padding: 4 }}>
                        <Ionicons name="close" size={16} color={colors.mute} />
                      </Press>
                    </Row>

                    {labels.length > 0 && (
                      <T v="sm" c={colors.mute} numberOfLines={2} style={{ marginTop: 3 }}>
                        {labels.join(' · ')}
                      </T>
                    )}
                    {!!l.note && (
                      <Row style={{ marginTop: 5 }}>
                        <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.gold} />
                        <T v="sm" c={colors.gold} numberOfLines={1} style={{ marginLeft: 5, flex: 1 }}>{l.note}</T>
                      </Row>
                    )}

                    <Row style={{ marginTop: sp(3) }}>
                      <T v="h3" c={colors.primary}>{money(unit * l.qty)}</T>
                      <View style={{ flex: 1 }} />
                      <Row style={styles.qty}>
                        <Press onPress={() => setQty(l.key, l.qty - 1)} style={styles.qtyBtn} scaleTo={0.85} haptic="light">
                          <Ionicons name={l.qty === 1 ? 'trash-outline' : 'remove'} size={15} color={colors.text} />
                        </Press>
                        <Animated.Text key={l.qty} entering={FadeIn.duration(140)} style={styles.qtyNum}>
                          {l.qty}
                        </Animated.Text>
                        <Press onPress={() => setQty(l.key, l.qty + 1)} style={styles.qtyBtn} scaleTo={0.85} haptic="light">
                          <Ionicons name="add" size={15} color={colors.text} />
                        </Press>
                      </Row>
                    </Row>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* upsell */}
        {suggestions.length > 0 && (
          <>
            <View style={{ height: sp(7) }} />
            <SectionHeader title="Add something else?" sub={`Popular at ${r.name}`} />
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: sp(5), gap: sp(3.5) }}
            >
              {suggestions.map((d) => (
                <DishCard key={d.id} dish={d} width={150} />
              ))}
            </Animated.ScrollView>
          </>
        )}

        {/* promo */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Promo code" sub="Try FOODOO50, FREESHIP or SAVE20" />
        <View style={{ paddingHorizontal: sp(5) }}>
          {promo ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Row style={styles.promoOn}>
                <Ionicons name="checkmark-circle" size={19} color={colors.mint} />
                <View style={{ flex: 1, marginLeft: sp(3) }}>
                  <T v="h3" c={colors.mint}>{promo.code}</T>
                  <T v="sm" c={colors.dim} style={{ marginTop: 2 }}>{promo.label}</T>
                </View>
                <Press onPress={clearPromo} haptic="light" scaleTo={0.9} style={{ padding: 6 }}>
                  <Ionicons name="close" size={17} color={colors.mute} />
                </Press>
              </Row>
            </Animated.View>
          ) : (
            <Animated.View style={shakeStyle}>
              <Row style={styles.promoInput}>
                <Ionicons name="pricetag-outline" size={17} color={colors.mute} />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter a code"
                  placeholderTextColor={colors.mute}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onSubmitEditing={tryPromo}
                  style={styles.promoText}
                  selectionColor={colors.primary}
                />
                <Press onPress={tryPromo} haptic="medium" scaleTo={0.94} disabled={!code.trim()}>
                  <View style={[styles.applyBtn, !code.trim() && { opacity: 0.4 }]}>
                    <T v="sm" c="#0B0B10" style={{ fontWeight: '800' }}>Apply</T>
                  </View>
                </Press>
              </Row>
            </Animated.View>
          )}
        </View>

        {/* tip */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Tip your courier" sub="100% goes to them" />
        <Row style={{ paddingHorizontal: sp(5), gap: sp(2.5) }}>
          {TIPS.map((t) => {
            const on = tip === t;
            return (
              <Press key={t} onPress={() => setTip(t)} haptic="select" style={{ flex: 1 }} scaleTo={0.94}>
                <View style={[styles.tip, on && styles.tipOn]}>
                  <T v="h3" c={on ? '#0B0B10' : colors.text}>{t === 0 ? 'None' : `$${t}`}</T>
                </View>
              </Press>
            );
          })}
        </Row>

        {/* totals */}
        <View style={{ height: sp(7) }} />
        <View style={styles.totals}>
          <TotalRow label="Subtotal" value={money(totals.subtotal)} />
          {totals.discount > 0 && (
            <TotalRow label={`Discount (${promo?.code})`} value={`−${money(totals.discount)}`} tint={colors.mint} />
          )}
          <TotalRow
            label="Delivery"
            value={totals.delivery === 0 ? 'Free' : money(totals.delivery)}
            tint={totals.delivery === 0 ? colors.mint : undefined}
          />
          <TotalRow label="Service fee" value={money(totals.service)} />
          {totals.tip > 0 && <TotalRow label="Courier tip" value={money(totals.tip)} />}
          <View style={styles.totalHair} />
          <Row>
            <T v="h2" style={{ flex: 1 }}>Total</T>
            <Animated.View key={totals.total} entering={FadeIn.duration(200)}>
              <T v="h1" c={colors.primary}>{money(totals.total)}</T>
            </Animated.View>
          </Row>
        </View>

        {belowMin && (
          <Animated.View entering={FadeIn} style={styles.warn}>
            <Ionicons name="information-circle-outline" size={16} color={colors.gold} />
            <T v="sm" c={colors.gold} style={{ marginLeft: sp(2.5), flex: 1 }}>
              Add {money(r.minOrder - totals.subtotal)} more to reach the {money(r.minOrder)} minimum.
            </T>
          </Animated.View>
        )}
      </Animated.ScrollView>

      {/* checkout */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, sp(4)) }]}>
        <PrimaryButton
          label={belowMin ? `Minimum ${money(r.minOrder)}` : 'Go to checkout'}
          disabled={belowMin}
          onPress={() => nav.navigate('Checkout')}
          right={
            !belowMin && (
              <View style={styles.footPrice}>
                <T v="sm" c="#fff" style={{ fontWeight: '800' }}>{money(totals.total)}</T>
              </View>
            )
          }
        />
      </View>
    </View>
  );
}

function Header({ title, onClose, onClear }) {
  const insets = useSafeAreaInsets();
  return (
    <Row style={[styles.header, { paddingTop: insets.top + sp(3) }]}>
      <Press onPress={onClose} style={styles.round} scaleTo={0.88}>
        <Ionicons name="chevron-down" size={21} color={colors.text} />
      </Press>
      <T v="h2" style={{ flex: 1, marginLeft: sp(3.5) }}>{title}</T>
      {!!onClear && (
        <Press onPress={onClear} haptic="light" scaleTo={0.92}>
          <T v="sm" c={colors.danger} style={{ fontWeight: '700' }}>Empty</T>
        </Press>
      )}
    </Row>
  );
}

const TotalRow = ({ label, value, tint }) => (
  <Row style={{ marginBottom: sp(3) }}>
    <T v="body" c={colors.dim} style={{ flex: 1 }}>{label}</T>
    <T v="body" c={tint ?? colors.text} style={{ fontWeight: '700' }}>{value}</T>
  </Row>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: sp(5),
    paddingBottom: sp(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.stroke,
  },
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
  rStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: sp(5),
    marginBottom: sp(4),
    padding: sp(3),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  addMore: {
    paddingHorizontal: sp(3),
    paddingVertical: sp(2),
    borderRadius: radius.pill,
    backgroundColor: hexA(colors.primary, 0.14),
  },
  list: { paddingHorizontal: sp(5), gap: sp(3) },
  line: {
    flexDirection: 'row',
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  qty: {
    backgroundColor: colors.surfaceHi,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    paddingHorizontal: 3,
  },
  qtyBtn: { width: 30, height: 32, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { ...type.sm, color: colors.text, fontWeight: '800', minWidth: 18, textAlign: 'center' },
  promoInput: {
    height: 54,
    borderRadius: radius.lg,
    paddingHorizontal: sp(4),
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  promoText: { flex: 1, marginLeft: sp(3), color: colors.text, ...type.body, padding: 0 },
  applyBtn: {
    paddingHorizontal: sp(4),
    paddingVertical: sp(2.5),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  promoOn: {
    padding: sp(4),
    borderRadius: radius.lg,
    backgroundColor: hexA(colors.mint, 0.1),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.mint, 0.32),
  },
  tip: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  tipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  totals: {
    marginHorizontal: sp(5),
    padding: sp(5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  totalHair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginBottom: sp(4) },
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: sp(5),
    marginTop: sp(4),
    padding: sp(3.5),
    borderRadius: radius.md,
    backgroundColor: hexA(colors.gold, 0.1),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.gold, 0.3),
  },
  footer: {
    paddingHorizontal: sp(5),
    paddingTop: sp(4),
    backgroundColor: colors.bgSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  footPrice: {
    paddingHorizontal: sp(3),
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
});
