import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, radius, sp, hexA } from '../theme';
import { PAST_ORDERS, ORDER_STAGES, getRestaurant } from '../data';
import { useStore, money } from '../state/store';
import { defaultOptions } from '../components/DishCard';
import Press from '../components/Press';
import Img from '../components/Img';
import { T, Row, Badge, Empty } from '../components/ui';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'History' },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { orders, add, clear } = useStore();
  const [tab, setTab] = useState('active');

  const live = useMemo(() => orders.filter((o) => o.status === 'live'), [orders]);
  const past = useMemo(
    () => [...orders.filter((o) => o.status !== 'live'), ...PAST_ORDERS],
    [orders],
  );

  const reorder = (o) => {
    const r = getRestaurant(o.rid);
    if (!r) return;
    const found = o.items
      .map((it) => ({ dish: r.dishes.find((d) => d.name === it.name), qty: it.qty }))
      .filter((x) => x.dish);

    if (!found.length) {
      Alert.alert('Unavailable', 'Those items are no longer on the menu.');
      return;
    }

    Alert.alert(
      'Reorder?',
      `Add ${found.length} item${found.length > 1 ? 's' : ''} from ${r.name} to your cart.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to cart',
          onPress: () => {
            clear();
            found.forEach(({ dish, qty }) => add(dish, defaultOptions(dish), qty));
            nav.navigate('Cart');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top + sp(2), paddingHorizontal: sp(5) }}>
        <T v="h1">Orders</T>

        <Row style={styles.segment}>
          {TABS.map((t) => {
            const active = t.id === tab;
            const n = t.id === 'active' ? live.length : past.length;
            return (
              <Press key={t.id} onPress={() => setTab(t.id)} haptic="select" style={{ flex: 1 }} scaleTo={0.96}>
                <View style={[styles.segItem, active && styles.segItemActive]}>
                  <T v="sm" c={active ? colors.text : colors.mute} style={{ fontWeight: '700' }}>
                    {t.label}
                  </T>
                  {n > 0 && (
                    <View style={[styles.segCount, active && { backgroundColor: colors.primary }]}>
                      <T v="xs" c={active ? '#0B0B10' : colors.mute}>{n}</T>
                    </View>
                  )}
                </View>
              </Press>
            );
          })}
        </Row>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: sp(5), paddingBottom: insets.bottom + 190 }}
      >
        {tab === 'active' &&
          (live.length === 0 ? (
            <Empty
              icon="bicycle-outline"
              title="No orders in flight"
              sub="When you place an order you'll be able to watch it move here, step by step."
              action="Find something to eat"
              onAction={() => nav.navigate('Home')}
            />
          ) : (
            <View style={{ paddingHorizontal: sp(5), gap: sp(4) }}>
              {live.map((o, i) => {
                const r = getRestaurant(o.rid);
                const stage = ORDER_STAGES[o.stage];
                const pct = (o.stage + 1) / ORDER_STAGES.length;
                return (
                  <Animated.View key={o.id} entering={FadeInDown.delay(i * 60).springify().damping(18)}>
                    <Press onPress={() => nav.navigate('Order', { id: o.id })} style={styles.liveCard} scaleTo={0.98}>
                      <Row>
                        <Img uri={r?.logoImg} seed={o.id} radius={radius.md} style={styles.logo} />
                        <View style={{ flex: 1, marginLeft: sp(3.5) }}>
                          <T v="h3" numberOfLines={1}>{r?.name}</T>
                          <T v="sm" c={colors.mute} style={{ marginTop: 2 }}>
                            {o.items.reduce((s, x) => s + x.qty, 0)} items · {money(o.total)}
                          </T>
                        </View>
                        <Badge label="LIVE" tint={colors.mint} solid />
                      </Row>

                      <View style={styles.track}>
                        <View style={styles.trackBg} />
                        <Animated.View
                          layout={LinearTransition.springify()}
                          style={[styles.trackFill, { width: `${pct * 100}%` }]}
                        />
                      </View>

                      <Row style={{ marginTop: sp(3) }}>
                        <Ionicons name={stage.icon} size={15} color={colors.mint} />
                        <T v="sm" c={colors.text} style={{ marginLeft: 7, flex: 1, fontWeight: '600' }}>
                          {stage.label}
                        </T>
                        <T v="sm" c={colors.mute}>~{o.etaMinutes} min</T>
                      </Row>
                    </Press>
                  </Animated.View>
                );
              })}
            </View>
          ))}

        {tab === 'past' &&
          (past.length === 0 ? (
            <Empty icon="receipt-outline" title="No past orders" sub="Your order history will show up here." />
          ) : (
            <View style={{ paddingHorizontal: sp(5), gap: sp(3.5) }}>
              {past.map((o, i) => {
                const r = getRestaurant(o.rid);
                const cancelled = o.status === 'cancelled';
                return (
                  <Animated.View key={o.id} entering={FadeInDown.delay(Math.min(i, 8) * 55).springify().damping(18)}>
                    <View style={styles.pastCard}>
                      <Row>
                        <Img uri={r?.logoImg} seed={o.id} radius={radius.md} style={styles.logo} dim={cancelled ? 0.5 : 0} />
                        <View style={{ flex: 1, marginLeft: sp(3.5) }}>
                          <Row>
                            <T v="h3" numberOfLines={1} style={{ flex: 1 }}>{r?.name}</T>
                            <Badge
                              label={cancelled ? 'CANCELLED' : 'DELIVERED'}
                              tint={cancelled ? colors.danger : colors.mint}
                            />
                          </Row>
                          <T v="sm" c={colors.mute} style={{ marginTop: 3 }}>{o.placedAt}</T>
                        </View>
                      </Row>

                      <View style={styles.itemList}>
                        {o.items.map((it, k) => (
                          <Row key={k} style={{ marginTop: k ? 5 : 0 }}>
                            <T v="sm" c={colors.dim} style={{ width: 24 }}>{it.qty}×</T>
                            <T v="sm" c={colors.dim} numberOfLines={1} style={{ flex: 1 }}>{it.name}</T>
                          </Row>
                        ))}
                      </View>

                      <Row style={styles.pastFoot}>
                        <T v="h3">{money(o.total)}</T>
                        <View style={{ flex: 1 }} />
                        <Press onPress={() => reorder(o)} haptic="medium" scaleTo={0.95}>
                          <Row style={styles.reorder}>
                            <Ionicons name="refresh" size={14} color={colors.primary} />
                            <T v="sm" c={colors.primary} style={{ marginLeft: 6, fontWeight: '700' }}>Reorder</T>
                          </Row>
                        </Press>
                      </Row>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  segment: {
    marginTop: sp(4),
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  segItem: {
    flexDirection: 'row',
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItemActive: { backgroundColor: colors.surfaceMax },
  segCount: {
    marginLeft: 7,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: colors.surfaceMax,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 52, height: 52 },
  liveCard: {
    padding: sp(4),
    borderRadius: radius.lg,
    backgroundColor: hexA(colors.mint, 0.07),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.mint, 0.28),
  },
  track: { height: 5, marginTop: sp(4), justifyContent: 'center' },
  trackBg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.surfaceMax, borderRadius: 3 },
  trackFill: { height: 5, borderRadius: 3, backgroundColor: colors.mint },
  pastCard: {
    padding: sp(4),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  itemList: {
    marginTop: sp(3.5),
    paddingTop: sp(3.5),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
  },
  pastFoot: { marginTop: sp(4), alignItems: 'center' },
  reorder: {
    paddingHorizontal: sp(3.5),
    paddingVertical: sp(2.5),
    borderRadius: radius.pill,
    backgroundColor: hexA(colors.primary, 0.14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.primary, 0.35),
  },
});
