import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, radius, sp, hexA } from '../theme';
import { ADDRESSES } from '../data';
import { useStore } from '../state/store';
import Press from './Press';
import Sheet from './Sheet';
import { T } from './ui';

/** The delivery-address picker. Shared by the Home header and the Profile row. */
export default function AddressSheet({ visible, onClose }) {
  const { addressId, setAddress } = useStore();

  return (
    <Sheet visible={visible} onClose={onClose} title="Delivery address" sub="Where should we send it?">
      <View style={{ gap: sp(2.5) }}>
        {ADDRESSES.map((a) => {
          const active = a.id === addressId;
          return (
            <Press
              key={a.id}
              onPress={() => {
                setAddress(a.id);
                onClose();
              }}
              style={[styles.row, active && styles.rowActive]}
              scaleTo={0.98}
            >
              <View style={[styles.icon, active && { backgroundColor: hexA(colors.primary, 0.18) }]}>
                <Ionicons name={a.icon} size={17} color={active ? colors.primary : colors.dim} />
              </View>
              <View style={{ flex: 1, marginLeft: sp(3) }}>
                <T v="h3">{a.label}</T>
                <T v="sm" c={colors.mute} numberOfLines={1} style={{ marginTop: 2 }}>{a.line}</T>
                <T v="xs" c={colors.mute} style={{ marginTop: 4 }}>{a.note.toUpperCase()}</T>
              </View>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Press>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sp(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stroke,
  },
  rowActive: { borderColor: hexA(colors.primary, 0.5), backgroundColor: hexA(colors.primary, 0.07) },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHi,
  },
});
