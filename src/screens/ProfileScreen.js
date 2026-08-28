import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, radius, sp, hexA, grad } from '../theme';
import { USER, ADDRESSES, PAYMENTS, getRestaurant } from '../data';
import { useStore } from '../state/store';
import Press from '../components/Press';
import AddressSheet from '../components/AddressSheet';
import { RestaurantRow } from '../components/RestaurantCard';
import { T, Row, SectionHeader, Badge, Empty } from '../components/ui';

const STATS = (orders, favs) => [
  { label: 'Orders', value: String(orders), icon: 'bag-handle', tint: colors.primary },
  { label: 'Favourites', value: String(favs), icon: 'heart', tint: colors.danger },
  { label: 'Saved', value: 'SR 480', icon: 'pricetag', tint: colors.mint },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { favRestaurants, orders, addressId, paymentId } = useStore();

  const [addrOpen, setAddrOpen] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [promos, setPromos] = useState(true);
  const [contactless, setContactless] = useState(false);

  const pct = USER.points / USER.nextTierAt;
  const bar = useSharedValue(0);
  useEffect(() => {
    bar.value = withDelay(320, withTiming(pct, { duration: 700 }));
  }, [pct, bar]);

  const barStyle = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  const favs = favRestaurants.map(getRestaurant).filter(Boolean);
  const address = ADDRESSES.find((a) => a.id === addressId);
  const payment = PAYMENTS.find((p) => p.id === paymentId);

  const soon = (what) => Alert.alert(what, 'This is a demo — the backend for this comes later.');

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + sp(2), paddingBottom: insets.bottom + 190 }}
      >
        {/* --------------------------- identity --------------------------- */}
        <View style={{ paddingHorizontal: sp(5) }}>
          <Row>
            <LinearGradient colors={grad.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <T v="h1" c="#fff">{USER.name[0]}</T>
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: sp(4) }}>
              <T v="h1">{USER.name}</T>
              <T v="sm" c={colors.mute} style={{ marginTop: 3 }}>{USER.handle} · {USER.joined}</T>
            </View>
            <Press onPress={() => soon('Settings')} style={styles.gear} scaleTo={0.88}>
              <Ionicons name="settings-outline" size={19} color={colors.dim} />
            </Press>
          </Row>
        </View>

        {/* ---------------------------- loyalty --------------------------- */}
        <Animated.View entering={FadeInDown.delay(80).duration(260)}>
          <View style={styles.tier}>
            <LinearGradient
              colors={[hexA(colors.gold, 0.16), 'rgba(255,255,255,0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Row>
              <Ionicons name="trophy" size={18} color={colors.gold} />
              <T v="h3" style={{ marginLeft: sp(2.5), flex: 1 }}>{USER.tier}</T>
              <Badge label={`${USER.points} PTS`} tint={colors.gold} />
            </Row>

            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFill, barStyle]}>
                <LinearGradient
                  colors={grad.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <T v="sm" c={colors.dim} style={{ marginTop: sp(2.5) }}>
              {USER.nextTierAt - USER.points} points to <T v="sm" c={colors.gold}>Platinum</T> — about two more orders.
            </T>
          </View>
        </Animated.View>

        {/* ----------------------------- stats ---------------------------- */}
        <Animated.View entering={FadeInDown.delay(140).duration(260)}>
          <Row style={styles.stats}>
            {STATS(orders.length + 4, favs.length).map((s) => (
              <View key={s.label} style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: hexA(s.tint, 0.15) }]}>
                  <Ionicons name={s.icon} size={16} color={s.tint} />
                </View>
                <T v="h2" style={{ marginTop: sp(2.5) }}>{s.value}</T>
                <T v="xs" c={colors.mute} style={{ marginTop: 3 }}>{s.label.toUpperCase()}</T>
              </View>
            ))}
          </Row>
        </Animated.View>

        {/* --------------------------- quick rows -------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Account" />
        <View style={styles.group}>
          <LinkRow
            icon="location-outline"
            title="Delivery address"
            value={address ? `${address.label} · ${address.line}` : 'Add one'}
            onPress={() => setAddrOpen(true)}
          />
          <Hair />
          <LinkRow
            icon="card-outline"
            title="Payment method"
            value={payment ? (payment.last4 ? `${payment.label} ···· ${payment.last4}` : payment.label) : 'Add one'}
            onPress={() => soon('Payment methods')}
          />
          <Hair />
          <LinkRow icon="ticket-outline" title="Promo codes" value="3 available" onPress={() => soon('Promo codes')} />
          <Hair />
          <LinkRow icon="help-circle-outline" title="Help & support" value="" onPress={() => soon('Help & support')} />
        </View>

        {/* -------------------------- preferences -------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Preferences" />
        <View style={styles.group}>
          <ToggleRow
            icon="notifications-outline"
            title="Order updates"
            sub="Push notifications for every stage"
            value={notifs}
            onChange={setNotifs}
          />
          <Hair />
          <ToggleRow
            icon="pricetags-outline"
            title="Deals & offers"
            sub="Weekly discounts near you"
            value={promos}
            onChange={setPromos}
          />
          <Hair />
          <ToggleRow
            icon="hand-left-outline"
            title="Contactless delivery"
            sub="Leave it at the door"
            value={contactless}
            onChange={setContactless}
          />
        </View>

        {/* --------------------------- favourites -------------------------- */}
        <View style={{ height: sp(7) }} />
        <SectionHeader title="Your favourites" sub={`${favs.length} saved`} />
        {favs.length === 0 ? (
          <Empty
            icon="heart-outline"
            title="Nothing saved yet"
            sub="Tap the heart on any restaurant and it'll live here."
            action="Browse restaurants"
            onAction={() => nav.navigate('Home')}
          />
        ) : (
          <View style={{ paddingHorizontal: sp(5), gap: sp(3) }}>
            {favs.map((r, i) => (
              <Animated.View key={r.id} entering={FadeInDown.delay(i * 55).duration(260)}>
                <RestaurantRow r={r} />
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{ height: sp(8) }} />
        <Press onPress={() => soon('Sign out')} style={styles.signOut} scaleTo={0.97}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <T v="body" c={colors.danger} style={{ marginLeft: sp(2), fontWeight: '700' }}>Sign out</T>
        </Press>

        <T v="xs" c={colors.mute} style={{ textAlign: 'center', marginTop: sp(5) }}>
          FOODOO · DEMO BUILD · NO BACKEND YET
        </T>
      </ScrollView>

      <AddressSheet visible={addrOpen} onClose={() => setAddrOpen(false)} />
    </View>
  );
}

const Hair = () => <View style={styles.hair} />;

function LinkRow({ icon, title, value, onPress }) {
  return (
    <Press onPress={onPress} style={styles.linkRow} scaleTo={0.985}>
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={18} color={colors.dim} />
      </View>
      <View style={{ flex: 1, marginLeft: sp(3.5) }}>
        <T v="body" style={{ fontWeight: '600' }}>{title}</T>
        {!!value && <T v="sm" c={colors.mute} numberOfLines={1} style={{ marginTop: 2 }}>{value}</T>}
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.mute} />
    </Press>
  );
}

function ToggleRow({ icon, title, sub, value, onChange }) {
  return (
    <View style={styles.linkRow}>
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={18} color={value ? colors.primary : colors.dim} />
      </View>
      <View style={{ flex: 1, marginLeft: sp(3.5) }}>
        <T v="body" style={{ fontWeight: '600' }}>{title}</T>
        {!!sub && <T v="sm" c={colors.mute} style={{ marginTop: 2 }}>{sub}</T>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceMax, true: hexA(colors.primary, 0.55) }}
        thumbColor={value ? colors.primary : '#8A8A9E'}
        ios_backgroundColor={colors.surfaceMax}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  avatar: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  tier: {
    marginHorizontal: sp(5),
    marginTop: sp(5),
    padding: sp(4),
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.gold, 0.28),
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMax,
    marginTop: sp(4),
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4, overflow: 'hidden' },
  stats: { paddingHorizontal: sp(5), marginTop: sp(4), gap: sp(3) },
  stat: {
    flex: 1,
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  group: {
    marginHorizontal: sp(5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    overflow: 'hidden',
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: sp(4) },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
  },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginLeft: sp(4) + 38 + sp(3.5) },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: sp(5),
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: hexA(colors.danger, 0.1),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: hexA(colors.danger, 0.3),
  },
});
