import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sp, type, hexA, elev, spring } from '../theme';
import { useStore } from '../state/store';
import Press from '../components/Press';
import CartBar from '../components/CartBar';

// resolved up front — worklets can't call plain JS helpers like hexA()
const TAB_ACTIVE_BG = hexA(colors.primary, 0.17);

const TABS = {
  Home: { label: 'Home', icon: 'home', iconOff: 'home-outline' },
  Search: { label: 'Search', icon: 'compass', iconOff: 'compass-outline' },
  Orders: { label: 'Orders', icon: 'receipt', iconOff: 'receipt-outline' },
  Profile: { label: 'You', icon: 'person', iconOff: 'person-outline' },
};

function TabItem({ meta, focused, onPress, badge }) {
  const p = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, spring);
  }, [focused, p]);

  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      p.value,
      [0, 1],
      ['rgba(255,255,255,0)', TAB_ACTIVE_BG],
    ),
  }));

  const icon = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + p.value * 0.08 }, { translateY: -p.value }],
  }));

  const label = useAnimatedStyle(() => ({
    width: interpolate(p.value, [0, 1], [0, 52]),
    opacity: p.value,
    marginLeft: interpolate(p.value, [0, 1], [0, 6]),
  }));

  return (
    <Press onPress={onPress} haptic="select" scaleTo={0.9} style={styles.tabPress}>
      <Animated.View style={[styles.tab, box]}>
        <Animated.View style={icon}>
          <Ionicons
            name={focused ? meta.icon : meta.iconOff}
            size={22}
            color={focused ? colors.primary : colors.mute}
          />
          {badge > 0 && <View style={styles.tabBadge} />}
        </Animated.View>
        <Animated.View style={[styles.labelClip, label]}>
          <Animated.Text numberOfLines={1} style={[type.sm, styles.labelText]}>
            {meta.label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Press>
  );
}

/** Floating blurred pill bar. The cart summary docks just above it. */
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { orders } = useStore();
  const live = orders.filter((o) => o.status === 'live').length;
  const pad = Math.max(insets.bottom, sp(3));

  return (
    <>
      <CartBar bottom={pad + 76} />
      <View style={[styles.barWrap, { paddingBottom: pad }]} pointerEvents="box-none">
        <View style={[styles.bar, elev(3)]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={Platform.OS === 'android' ? 12 : 18}
            reducedTransparencyFallbackColor={colors.surface}
          />
          <View style={styles.barTint} />
          {state.routes.map((route, i) => {
            const meta = TABS[route.name];
            if (!meta) return null;
            const focused = state.index === i;
            return (
              <TabItem
                key={route.key}
                meta={meta}
                focused={focused}
                badge={route.name === 'Orders' ? live : 0}
                onPress={() => {
                  const e = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
                }}
              />
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp(4),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: sp(2),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.strokeHi,
  },
  barTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,16,24,0.72)' },
  tabPress: { flex: 1 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: radius.pill,
    marginHorizontal: 2,
  },
  labelClip: { overflow: 'hidden' },
  labelText: { color: colors.primary, fontWeight: '800' },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint,
  },
});
