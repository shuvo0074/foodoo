import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, hexA } from '../theme';
import { ADDRESSES, PAYMENTS } from '../data';
import { useStore, money } from '../state/store';
import Press from '../components/Press';
import { T, Row, PrimaryButton, SectionHeader, Empty } from '../components/ui';

const SLOTS = [
  { id: 'asap', label: 'ASAP', sub: 'As soon as possible' },
  { id: 'soon', label: 'In 1 hour', sub: 'Scheduled' },
  { id: 'tonight', label: 'Tonight, 8:00 PM', sub: 'Scheduled' },
];

export default function CheckoutScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { lines, totals, addressId, setAddress, paymentId, setPayment, placeOrder, promo, tip } = useStore();

  const [slot, setSlot] = useState('asap');
  const [placing, setPlacing] = useState(false);

  const r = totals.restaurant;

  const submit = () => {
    setPlacing(true);
    setTimeout(() => {
      const order = placeOrder();
      setPlacing(false);
      nav.replace('Order', { id: order.id });
    }, 1700);
  };

  if (!lines.length && !placing) {
    return (
      <View style={styles.screen}>
        <Header onBack={() => nav.goBack()} />
        <Empty
          icon="bag-outline"
          title="Nothing to check out"
          sub="Your cart is empty."
          action="Find food"
          onAction={() => nav.navigate('Tabs', { screen: 'Home' })}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header onBack={() => nav.goBack()} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
      >
        <View style={{ paddingHorizontal: sp(5) }}>
          <T v="display">Checkout</T>
          <T v="body" c={colors.mute} style={{ marginTop: sp(1.5) }}>
            {r?.name} · {totals.count} item{totals.count > 1 ? 's' : ''}
          </T>
        </View>

        {/* ---------------------------- address --------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Deliver to" />
        <View style={{ paddingHorizontal: sp(5), gap: sp(2.5) }}>
          {ADDRESSES.map((a, i) => {
            const on = a.id === addressId;
            return (
              <Animated.View key={a.id} entering={FadeInDown.delay(i * 50).duration(260)}>
                <Press
                  onPress={() => setAddress(a.id)}
                  style={[styles.pick, on && styles.pickOn]}
                  scaleTo={0.98}
                  haptic="select"
                >
                  <View style={[styles.pickIcon, on && { backgroundColor: hexA(colors.primary, 0.18) }]}>
                    <Ionicons name={a.icon} size={17} color={on ? colors.primary : colors.dim} />
                  </View>
                  <View style={{ flex: 1, marginLeft: sp(3.5) }}>
                    <T v="h3">{a.label}</T>
                    <T v="sm" c={colors.mute} numberOfLines={1} style={{ marginTop: 2 }}>{a.line}</T>
                  </View>
                  <Radio on={on} />
                </Press>
              </Animated.View>
            );
          })}
        </View>

        {/* ----------------------------- timing ---------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="When" />
        <Row style={{ paddingHorizontal: sp(5), gap: sp(2.5) }}>
          {SLOTS.map((s) => {
            const on = s.id === slot;
            return (
              <Press key={s.id} onPress={() => setSlot(s.id)} haptic="select" style={{ flex: 1 }} scaleTo={0.95}>
                <View style={[styles.slot, on && styles.slotOn]}>
                  <T v="sm" c={on ? '#0B0B10' : colors.text} style={{ fontWeight: '800', textAlign: 'center' }}>
                    {s.label}
                  </T>
                  <T
                    v="xs"
                    c={on ? 'rgba(11,11,16,0.65)' : colors.mute}
                    style={{ marginTop: 4, textAlign: 'center' }}
                  >
                    {s.sub.toUpperCase()}
                  </T>
                </View>
              </Press>
            );
          })}
        </Row>

        {/* ---------------------------- payment ---------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Pay with" />
        <View style={{ paddingHorizontal: sp(5), gap: sp(2.5) }}>
          {PAYMENTS.map((p, i) => {
            const on = p.id === paymentId;
            return (
              <Animated.View key={p.id} entering={FadeInDown.delay(i * 50).duration(260)}>
                <Press
                  onPress={() => setPayment(p.id)}
                  style={[styles.pick, on && styles.pickOn]}
                  scaleTo={0.98}
                  haptic="select"
                >
                  <View style={[styles.pickIcon, { backgroundColor: hexA(p.tint, 0.16) }]}>
                    <Ionicons name={p.icon} size={17} color={p.tint} />
                  </View>
                  <View style={{ flex: 1, marginLeft: sp(3.5) }}>
                    <T v="h3">{p.label}</T>
                    {!!p.last4 && <T v="sm" c={colors.mute} style={{ marginTop: 2 }}>···· ···· ···· {p.last4}</T>}
                  </View>
                  <Radio on={on} />
                </Press>
              </Animated.View>
            );
          })}
        </View>

        {/* ---------------------------- summary ---------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Order summary" />
        <View style={styles.summary}>
          {lines.map((l) => (
            <Row key={l.key} style={{ marginBottom: sp(3) }}>
              <View style={styles.qtyChip}>
                <T v="xs" c={colors.primary}>{l.qty}×</T>
              </View>
              <T v="body" numberOfLines={1} style={{ flex: 1, marginLeft: sp(3) }}>{l.dish.name}</T>
              <T v="body" c={colors.dim}>{money(l.dish.price * l.qty)}</T>
            </Row>
          ))}

          <View style={styles.hair} />

          <Row style={{ marginBottom: sp(3) }}>
            <T v="body" c={colors.dim} style={{ flex: 1 }}>Subtotal</T>
            <T v="body" style={{ fontWeight: '700' }}>{money(totals.subtotal)}</T>
          </Row>
          {totals.discount > 0 && (
            <Row style={{ marginBottom: sp(3) }}>
              <T v="body" c={colors.mint} style={{ flex: 1 }}>Discount ({promo?.code})</T>
              <T v="body" c={colors.mint} style={{ fontWeight: '700' }}>−{money(totals.discount)}</T>
            </Row>
          )}
          <Row style={{ marginBottom: sp(3) }}>
            <T v="body" c={colors.dim} style={{ flex: 1 }}>Delivery + service</T>
            <T v="body" style={{ fontWeight: '700' }}>{money(totals.delivery + totals.service)}</T>
          </Row>
          {tip > 0 && (
            <Row style={{ marginBottom: sp(3) }}>
              <T v="body" c={colors.dim} style={{ flex: 1 }}>Courier tip</T>
              <T v="body" style={{ fontWeight: '700' }}>{money(totals.tip)}</T>
            </Row>
          )}

          <View style={styles.hair} />
          <Row>
            <T v="h2" style={{ flex: 1 }}>Total</T>
            <T v="h1" c={colors.primary}>{money(totals.total)}</T>
          </Row>
        </View>

        <Row style={styles.secure}>
          <Ionicons name="lock-closed" size={13} color={colors.mute} />
          <T v="xs" c={colors.mute} style={{ marginLeft: 6 }}>DEMO CHECKOUT · NO REAL PAYMENT IS TAKEN</T>
        </Row>
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, sp(4)) }]}>
        <PrimaryButton
          label={`Place order · ${money(totals.total)}`}
          icon="checkmark-circle"
          onPress={submit}
          haptic="success"
        />
      </View>

      <PlacingOverlay visible={placing} />
    </View>
  );
}

/* --------------------------- placing overlay -------------------------- */

function PlacingOverlay({ visible }) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    spin.value = 0;
    spin.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 650 }), withTiming(0, { duration: 650 })),
      -1,
      false,
    );
  }, [visible, spin, pulse]);

  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const glow = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.4,
    transform: [{ scale: 1 + pulse.value * 0.25 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[styles.glow, glow]} />
            <Animated.View style={[styles.ring, ring]}>
              <LinearGradient
                colors={[colors.primary, 'rgba(255,107,44,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={styles.ringHole}>
              <Ionicons name="restaurant" size={26} color={colors.primary} />
            </View>
          </View>

          <T v="h2" style={{ marginTop: sp(6) }}>Sending your order…</T>
          <T v="sm" c={colors.mute} style={{ marginTop: sp(2) }}>Confirming with the kitchen</T>
        </View>
      </View>
    </Modal>
  );
}

function Header({ onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <Row style={{ paddingTop: insets.top + sp(3), paddingHorizontal: sp(5), paddingBottom: sp(4) }}>
      <Press onPress={onBack} style={styles.round} scaleTo={0.88}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Press>
    </Row>
  );
}

const Radio = ({ on }) => (
  <View style={[styles.radio, on && { borderColor: colors.primary }]}>
    {on && <View style={styles.radioDot} />}
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
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
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  pickOn: { borderColor: hexA(colors.primary, 0.5), backgroundColor: hexA(colors.primary, 0.07) },
  pickIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surfaceMax,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  slot: {
    minHeight: 66,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(2),
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  slotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  summary: {
    marginHorizontal: sp(5),
    padding: sp(5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  qtyChip: {
    minWidth: 28,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: hexA(colors.primary, 0.15),
  },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginBottom: sp(4) },
  secure: { justifyContent: 'center', marginTop: sp(5) },
  footer: {
    paddingHorizontal: sp(5),
    paddingTop: sp(4),
    backgroundColor: colors.bgSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6,6,10,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: hexA(colors.primary, 0.35),
  },
  ring: { position: 'absolute', width: 92, height: 92, borderRadius: 46, overflow: 'hidden' },
  ringHole: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
