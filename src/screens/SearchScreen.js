import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Keyboard } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, type, hexA, spring } from '../theme';
import { search, RESTAURANTS, CATEGORIES } from '../data';
import Press from '../components/Press';
import { RestaurantRow } from '../components/RestaurantCard';
import { DishRow } from '../components/DishCard';
import { T, Row, Empty, SectionHeader } from '../components/ui';

// resolved up front — worklets can't call plain JS helpers like hexA()
const FOCUS_BORDER = hexA(colors.primary, 0.65);

const POPULAR = ['Mandi', 'Shawarma', 'Kabsa', 'Kunafa', 'Broast', 'Mashawi'];
const FILTERS = [
  { id: 'all', label: 'Everything' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'dishes', label: 'Dishes' },
];

function Segmented({ value, onChange, items }) {
  return (
    <Row style={styles.segment}>
      {items.map((it) => {
        const active = it.id === value;
        return (
          <Press key={it.id} onPress={() => onChange(it.id)} haptic="select" style={{ flex: 1 }} scaleTo={0.96}>
            <View style={[styles.segItem, active && styles.segItemActive]}>
              <T v="sm" c={active ? colors.text : colors.mute} style={{ fontWeight: '700' }}>
                {it.label}
              </T>
            </View>
          </Press>
        );
      })}
    </Row>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [recent, setRecent] = useState(['Chicken mandi', 'Shawarma Souq']);
  const [focused, setFocused] = useState(false);

  const focus = useSharedValue(0);
  useEffect(() => {
    focus.value = withSpring(focused ? 1 : 0, spring);
  }, [focused, focus]);

  const barStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [colors.stroke, FOCUS_BORDER]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [colors.surface, colors.surfaceHi]),
  }));

  const results = useMemo(() => search(q), [q]);
  const hasQuery = q.trim().length > 0;
  const showRestaurants = filter !== 'dishes';
  const showDishes = filter !== 'restaurants';
  const nothing =
    hasQuery &&
    (!showRestaurants || results.restaurants.length === 0) &&
    (!showDishes || results.dishes.length === 0);

  const commit = (term) => {
    setQ(term);
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 6));
    Keyboard.dismiss();
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top + sp(2), paddingHorizontal: sp(5) }}>
        <T v="h1">Search</T>

        <Animated.View style={[styles.bar, barStyle]}>
          <Ionicons name="search" size={19} color={focused ? colors.primary : colors.mute} />
          <TextInput
            ref={inputRef}
            value={q}
            onChangeText={setQ}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => q.trim() && commit(q.trim())}
            placeholder="Dishes, cuisines, restaurants…"
            placeholderTextColor={colors.mute}
            returnKeyType="search"
            style={styles.input}
            selectionColor={colors.primary}
            autoCorrect={false}
          />
          {hasQuery && (
            <Animated.View entering={FadeIn.duration(140)}>
              <Press onPress={() => setQ('')} haptic="light" scaleTo={0.85}>
                <Ionicons name="close-circle" size={19} color={colors.mute} />
              </Press>
            </Animated.View>
          )}
        </Animated.View>

        {hasQuery && (
          <Animated.View entering={FadeInDown.duration(200)} layout={LinearTransition}>
            <Segmented value={filter} onChange={setFilter} items={FILTERS} />
          </Animated.View>
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 190, paddingTop: sp(5) }}
      >
        {!hasQuery && (
          <>
            {recent.length > 0 && (
              <>
                <SectionHeader title="Recent" action="Clear" onAction={() => setRecent([])} />
                <View style={{ paddingHorizontal: sp(5), gap: sp(2) }}>
                  {recent.map((term, i) => (
                    <Animated.View key={term} entering={FadeInDown.delay(i * 50).springify().damping(18)}>
                      <Press onPress={() => commit(term)} style={styles.recentRow} scaleTo={0.98}>
                        <Ionicons name="time-outline" size={17} color={colors.mute} />
                        <T v="body" style={{ flex: 1, marginLeft: sp(3) }}>{term}</T>
                        <Ionicons
                          name="arrow-up-outline"
                          size={15}
                          color={colors.mute}
                          style={{ transform: [{ rotate: '45deg' }] }}
                        />
                      </Press>
                    </Animated.View>
                  ))}
                </View>
                <View style={{ height: sp(7) }} />
              </>
            )}

            <SectionHeader title="Popular searches" />
            <View style={styles.chips}>
              {POPULAR.map((p, i) => (
                <Animated.View key={p} entering={FadeInDown.delay(i * 45).springify().damping(18)}>
                  <Press onPress={() => commit(p)} haptic="select" scaleTo={0.94}>
                    <View style={styles.chip}>
                      <Ionicons name="trending-up" size={13} color={colors.primary} />
                      <T v="sm" style={{ marginLeft: 6, fontWeight: '600' }}>{p}</T>
                    </View>
                  </Press>
                </Animated.View>
              ))}
            </View>

            <View style={{ height: sp(7) }} />
            <SectionHeader title="Browse by cuisine" />
            <View style={styles.grid}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c, i) => (
                <Animated.View
                  key={c.id}
                  entering={FadeInDown.delay(i * 40).springify().damping(18)}
                  style={{ width: '48%' }}
                >
                  <Press onPress={() => commit(c.label)} scaleTo={0.97}>
                    <View
                      style={[
                        styles.cuisine,
                        { borderColor: hexA(c.tint, 0.28), backgroundColor: hexA(c.tint, 0.08) },
                      ]}
                    >
                      <Ionicons name={c.icon} size={24} color={c.tint} />
                      <T v="h3" style={{ marginTop: sp(2) }}>{c.label}</T>
                      <T v="xs" c={colors.mute} style={{ marginTop: 3 }}>
                        {RESTAURANTS.filter((r) => r.cats.includes(c.id)).length} PLACES
                      </T>
                    </View>
                  </Press>
                </Animated.View>
              ))}
            </View>
          </>
        )}

        {hasQuery && nothing && (
          <Empty
            icon="search-outline"
            title={`No results for “${q}”`}
            sub="Try a cuisine, a dish name, or one of the popular searches."
            action="Clear search"
            onAction={() => setQ('')}
          />
        )}

        {hasQuery && showRestaurants && results.restaurants.length > 0 && (
          <>
            <SectionHeader title="Restaurants" sub={`${results.restaurants.length} found`} />
            <View style={{ paddingHorizontal: sp(5), gap: sp(3) }}>
              {results.restaurants.map((r, i) => (
                <Animated.View key={r.id} entering={FadeInDown.delay(i * 50).springify().damping(18)}>
                  <RestaurantRow r={r} />
                </Animated.View>
              ))}
            </View>
            <View style={{ height: sp(7) }} />
          </>
        )}

        {hasQuery && showDishes && results.dishes.length > 0 && (
          <>
            <SectionHeader title="Dishes" sub={`${results.dishes.length} found`} />
            <View style={styles.dishList}>
              {results.dishes.map((d, i) => (
                <Animated.View key={d.id} entering={FadeInDown.delay(i * 40).springify().damping(18)}>
                  <DishRow dish={d} />
                  {i < results.dishes.length - 1 && <View style={styles.hair} />}
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    paddingHorizontal: sp(4),
    marginTop: sp(4),
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: sp(3),
    color: colors.text,
    ...type.body,
    padding: 0,
  },
  segment: {
    marginTop: sp(4),
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  segItem: {
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItemActive: { backgroundColor: colors.surfaceMax },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sp(3),
    paddingHorizontal: sp(4),
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2.5), paddingHorizontal: sp(5) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sp(3.5),
    paddingVertical: sp(2.5),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sp(3),
    paddingHorizontal: sp(5),
    justifyContent: 'space-between',
  },
  cuisine: {
    padding: sp(4),
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 116,
    justifyContent: 'center',
  },
  dishList: {
    marginHorizontal: sp(5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
    overflow: 'hidden',
  },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.stroke, marginHorizontal: sp(5) },
});
