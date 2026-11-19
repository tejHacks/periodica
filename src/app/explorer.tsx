import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useDiscovered } from '@/data/progress';
import { FAMILY_INFO, type Family } from '@/game/elements';
import { lab } from '@/game/look';
import { PeriodicTable } from '@/game/table';

export default function Explorer() {
  const [discovered] = useDiscovered();
  const found = new Set(discovered);
  return (
    <ScrollView style={{ backgroundColor: lab.bg }} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}>
      <Text style={styles.lede}>
        {found.size} of 118 discovered. Answer an element correctly in any level to reveal it. Tap a revealed element to learn about it.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
        <PeriodicTable cell={40} look={(e) => (found.has(e.z) ? 'family' : 'locked')} onPress={(e) => found.has(e.z) && router.push({ pathname: '/element/[z]', params: { z: String(e.z) } })} />
      </ScrollView>
      <View style={styles.legend}>
        {(Object.keys(FAMILY_INFO) as Family[]).map((f) => (
          <View key={f} style={styles.key}>
            <View style={[styles.dot, { backgroundColor: FAMILY_INFO[f].color }]} />
            <Text style={styles.keyText}>{FAMILY_INFO[f].label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lede: { color: lab.muted, fontSize: 15, lineHeight: 22 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: lab.panel, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  keyText: { color: lab.muted, fontSize: 12, fontWeight: '600' },
});
