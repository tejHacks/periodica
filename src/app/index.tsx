import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBest, useDiscovered, useOnboarded, useStars } from '@/data/progress';
import { isUnlocked, LEVELS } from '@/game/levels';
import { lab } from '@/game/look';

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <Ionicons key={i} name={i <= n ? 'star' : 'star-outline'} size={size} color={i <= n ? lab.gold : lab.subtle} />
      ))}
    </View>
  );
}

export default function Home() {
  const [onboarded, , ready] = useOnboarded();
  const [stars] = useStars();
  const [best] = useBest();
  const [discovered] = useDiscovered();
  if (!ready) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>THE PERIODIC TABLE GAME</Text>
        <Text style={styles.title}>Periodica</Text>

        <Pressable accessibilityRole="button" accessibilityLabel={`Explorer: ${discovered.length} of 118 discovered`} onPress={() => router.push('/explorer')} style={styles.collection}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.collTitle}>{discovered.length} / 118 discovered</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(discovered.length / 118) * 100}%` }]} />
            </View>
            <Text style={styles.collSub}>Open the Explorer to see your table fill in</Text>
          </View>
          <Ionicons name="grid" size={28} color={lab.cyan} />
        </Pressable>

        <View style={styles.rowBetween}>
          <Text style={styles.section}>Levels</Text>
          <Text style={styles.section}>{`★ ${totalStars} / ${LEVELS.length * 3}`}</Text>
        </View>
        {LEVELS.map((l) => {
          const open = isUnlocked(l.id, stars);
          return (
            <Pressable
              key={l.id}
              accessibilityRole="button"
              accessibilityLabel={open ? `Level ${l.id}, ${l.title}` : `Level ${l.id}, locked`}
              disabled={!open}
              onPress={() => router.push({ pathname: '/play/[level]', params: { level: String(l.id) } })}
              style={({ pressed }) => [styles.level, !open && { opacity: 0.45 }, pressed && { transform: [{ scale: 0.98 }] }]}>
              <View style={[styles.badge, { backgroundColor: open ? lab.cyan : lab.panelHi }]}>
                {open ? <Text style={styles.badgeText}>{l.id}</Text> : <Ionicons name="lock-closed" size={18} color={lab.subtle} />}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.levelTitle}>{l.title}</Text>
                <Text style={styles.levelSub}>{open ? l.subtitle : `Earn a star on level ${l.id - 1} to unlock`}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Stars n={stars[l.id] ?? 0} />
                {best[l.id] ? <Text style={styles.best}>Best {best[l.id]}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: lab.bg },
  content: { padding: 18, gap: 12, paddingBottom: 48 },
  kicker: { color: lab.cyan, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: lab.text, fontSize: 40, fontWeight: '900', letterSpacing: -1, marginBottom: 6 },
  collection: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 22, backgroundColor: lab.panel, borderWidth: 1, borderColor: lab.line },
  collTitle: { color: lab.text, fontSize: 18, fontWeight: '800' },
  collSub: { color: lab.subtle, fontSize: 13 },
  track: { height: 8, borderRadius: 4, backgroundColor: lab.panelHi, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: lab.cyan },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  section: { color: lab.subtle, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  level: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: lab.panel, borderWidth: 1, borderColor: lab.line },
  badge: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: lab.bg, fontSize: 20, fontWeight: '900' },
  levelTitle: { color: lab.text, fontSize: 17, fontWeight: '800' },
  levelSub: { color: lab.muted, fontSize: 13 },
  best: { color: lab.subtle, fontSize: 12, fontWeight: '600' },
});
