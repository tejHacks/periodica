import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ELEMENTS, FAMILY_INFO, type Element } from './elements';
import { lab } from './look';

export type CellLook = 'family' | 'blank' | 'locked' | 'good' | 'bad';

const ROWS = [1, 2, 3, 4, 5, 6, 7, 9, 10];

/**
 * The periodic table laid out on a grid (lanthanides and actinides below).
 * `look` decides how each element's cell is drawn; `onPress` makes cells tappable.
 */
export const PeriodicTable = memo(function PeriodicTable({
  cell,
  maxZ = 118,
  look,
  onPress,
  showSymbols = true,
}: {
  cell: number;
  maxZ?: number;
  look: (e: Element) => CellLook;
  onPress?: (e: Element) => void;
  showSymbols?: boolean;
}) {
  const visible = ELEMENTS.filter((e) => e.z <= maxZ);
  const rows = ROWS.filter((r) => visible.some((e) => e.row === r));
  const gap = Math.max(1, Math.round(cell * 0.08));
  return (
    <View style={{ gap }}>
      {rows.map((r) => (
        <View key={r} style={{ flexDirection: 'row', gap, marginTop: r === 9 ? cell * 0.35 : 0 }}>
          {Array.from({ length: 18 }, (_, i) => {
            const e = visible.find((x) => x.row === r && x.col === i + 1);
            if (!e) return <View key={i} style={{ width: cell, height: cell }} />;
            const l = look(e);
            const color = FAMILY_INFO[e.family].color;
            const bg = l === 'family' ? color : l === 'good' ? lab.good : l === 'bad' ? lab.bad : l === 'locked' ? lab.panel : lab.slot;
            const label = showSymbols && l !== 'blank' ? (l === 'locked' ? '?' : e.symbol) : '';
            return (
              <Pressable
                key={i}
                disabled={!onPress}
                onPress={() => onPress?.(e)}
                accessibilityRole={onPress ? 'button' : undefined}
                accessibilityLabel={l === 'blank' ? `Period ${e.period}, column ${e.col}` : l === 'locked' ? `Undiscovered element ${e.z}` : `${e.name}, ${e.z}`}
                style={({ pressed }) => [styles.cell, { width: cell, height: cell, borderRadius: cell * 0.18, backgroundColor: bg, opacity: pressed ? 0.7 : 1, borderColor: l === 'blank' ? lab.slotEdge : 'transparent' }]}>
                {label ? <Text style={[styles.sym, { fontSize: cell * 0.42, color: l === 'locked' ? lab.subtle : '#0A0E1F' }]}>{label}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  cell: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  sym: { fontWeight: '800' },
});
