import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarded } from '@/data/progress';
import { FAMILY_INFO, byZ } from '@/game/elements';
import { lab } from '@/game/look';

const slides = [
  { tiles: [1, 2, 6], title: 'Learn the elements by playing', body: 'Quick rounds of 10 questions: names, symbols, atomic numbers and families.' },
  { tiles: [11, 17, 26], title: 'Put them in their place', body: 'Tap where each element sits on a blank periodic table. Your memory of the table grows fast.' },
  { tiles: [79, 92, 118], title: 'Discover all 118', body: 'Six levels open the table row by row. Every right answer adds an element to your collection.' },
];

function Tile({ z, size }: { z: number; size: number }) {
  const e = byZ(z);
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: FAMILY_INFO[e.family].color }]}>
      <Text style={styles.tileNum}>{e.z}</Text>
      <Text style={[styles.tileSym, { fontSize: size * 0.42 }]}>{e.symbol}</Text>
      <Text style={styles.tileName} numberOfLines={1}>{e.name}</Text>
    </View>
  );
}

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const [, setOnboarded] = useOnboarded();
  const [page, setPage] = useState(0);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const done = () => {
    setOnboarded(true);
    router.replace('/');
  };
  const next = () => {
    if (page === slides.length - 1) return done();
    scroller.current?.scrollTo({ x: (page + 1) * width, animated: true });
    setPage(page + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Pressable accessibilityRole="button" onPress={done} style={styles.skip} hitSlop={10}>
        <Text style={{ color: lab.muted, fontWeight: '700' }}>Skip</Text>
      </Pressable>
      <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {slides.map((s) => (
          <View key={s.title} style={{ width, paddingHorizontal: 28, justifyContent: 'center', gap: 22 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              {s.tiles.map((z, i) => (
                <View key={z} style={{ transform: [{ rotate: `${(i - 1) * 6}deg` }, { translateY: i === 1 ? -14 : 0 }] }}>
                  <Tile z={z} size={92} />
                </View>
              ))}
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          {slides.map((s, i) => (
            <View key={s.title} style={{ width: i === page ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === page ? lab.cyan : lab.line }} />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={next} style={styles.cta}>
          <Text style={styles.ctaText}>{page === slides.length - 1 ? 'Start playing' : 'Next'}</Text>
          <Ionicons name={page === slides.length - 1 ? 'flask' : 'arrow-forward'} size={20} color={lab.bg} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: lab.bg },
  skip: { alignSelf: 'flex-end', padding: 16 },
  tile: { borderRadius: 18, padding: 8, justifyContent: 'space-between' },
  tileNum: { color: '#0A0E1F', fontWeight: '800', fontSize: 12 },
  tileSym: { color: '#0A0E1F', fontWeight: '900', textAlign: 'center' },
  tileName: { color: '#0A0E1F', fontWeight: '700', fontSize: 10, textAlign: 'center' },
  title: { color: lab.text, fontSize: 30, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  body: { color: lab.muted, fontSize: 17, lineHeight: 25, textAlign: 'center' },
  cta: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', minHeight: 58, borderRadius: 29, backgroundColor: lab.cyan },
  ctaText: { color: lab.bg, fontSize: 18, fontWeight: '900' },
});
