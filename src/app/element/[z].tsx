import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { byZ, FAMILY_INFO } from '@/game/elements';
import { lab } from '@/game/look';

const stateLabel = { solid: 'Solid', liquid: 'Liquid', gas: 'Gas', unknown: 'Unknown (made in labs)' } as const;

export default function ElementCard() {
  const { z } = useLocalSearchParams<{ z: string }>();
  const e = byZ(Number(z));
  if (!e) return null;
  const color = FAMILY_INFO[e.family].color;
  const facts: [string, string][] = [
    ['Atomic number', String(e.z)],
    ['Family', FAMILY_INFO[e.family].label],
    ['Period', String(e.period)],
    ['Group', e.group ? String(e.group) : e.family === 'lanthanide' ? 'Lanthanides (f-block)' : 'Actinides (f-block)'],
    ['At room temperature', stateLabel[e.state]],
  ];
  return (
    <ScrollView style={{ backgroundColor: lab.bg }} contentContainerStyle={{ padding: 20, gap: 18 }}>
      <Stack.Screen options={{ title: e.name }} />
      <View style={[styles.tile, { backgroundColor: color }]}>
        <Text style={styles.num}>{e.z}</Text>
        <Text style={styles.sym}>{e.symbol}</Text>
        <Text style={styles.name}>{e.name}</Text>
      </View>
      <View style={styles.card}>
        {facts.map(([k, v], i) => (
          <View key={k} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: lab.line }]}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tile: { alignSelf: 'center', width: 200, height: 200, borderRadius: 32, padding: 18, justifyContent: 'space-between' },
  num: { color: lab.bg, fontSize: 20, fontWeight: '800' },
  sym: { color: lab.bg, fontSize: 84, fontWeight: '900', textAlign: 'center', lineHeight: 92 },
  name: { color: lab.bg, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  card: { backgroundColor: lab.panel, borderRadius: 20, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, gap: 12 },
  k: { color: lab.muted, fontSize: 15 },
  v: { color: lab.text, fontSize: 15, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
});
