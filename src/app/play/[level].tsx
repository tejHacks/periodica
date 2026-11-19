import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBest, useDiscovered, useStars } from '@/data/progress';
import { FAMILY_INFO, type Element, type Family } from '@/game/elements';
import { familyLabel, LEVELS, LIVES, makeRound, points, prompt, SECONDS_PER_QUESTION, starsFor, type Question } from '@/game/levels';
import { lab } from '@/game/look';
import { PeriodicTable } from '@/game/table';

type Choice = Element | Family | null;
const FEEDBACK_MS = 950;
const toLevels = () => (router.canGoBack() ? router.back() : router.replace('/'));

const keyOf = (c: Choice) => (c === null ? 'none' : typeof c === 'string' ? c : String(c.z));
const isRight = (q: Question, c: Choice) => (q.kind === 'family' ? c === q.answer.family : c !== null && typeof c !== 'string' && c.z === q.answer.z);

export default function Play() {
  const { level: param } = useLocalSearchParams<{ level: string }>();
  const level = LEVELS.find((l) => String(l.id) === param) ?? LEVELS[0];
  const { width } = useWindowDimensions();
  const [, setStars] = useStars();
  const [, setBest] = useBest();
  const [, setDiscovered] = useDiscovered();

  const [round, setRound] = useState(() => makeRound(level));
  const [i, setI] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS_PER_QUESTION);
  const [picked, setPicked] = useState<Choice | undefined>(undefined);
  const [gain, setGain] = useState(0);
  const [over, setOver] = useState<null | { finished: boolean }>(null);
  const newlyFound = useRef(new Set<number>());

  const q = round[i];
  const answered = picked !== undefined;

  // Countdown; running out of time counts as a wrong answer.
  useEffect(() => {
    if (answered || over) return;
    if (left <= 0) {
      answer(null);
      return;
    }
    const t = setTimeout(() => setLeft((s) => Math.max(0, +(s - 0.1).toFixed(1))), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, answered, over]);

  function finish(finished: boolean, finalScore: number, finalMistakes: number) {
    const stars = starsFor(finalMistakes, finished);
    setOver({ finished });
    setStars((s) => ({ ...s, [level.id]: Math.max(s[level.id] ?? 0, stars) }));
    setBest((b) => ({ ...b, [level.id]: Math.max(b[level.id] ?? 0, finalScore) }));
    Haptics.notificationAsync(finished ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  }

  function answer(c: Choice) {
    if (answered || over) return;
    setPicked(c);
    const right = isRight(q, c);
    const nextLives = right ? lives : lives - 1;
    const nextMistakes = right ? mistakes : mistakes + 1;
    const earned = right ? points(left, streak) : 0;
    const nextScore = score + earned;
    setGain(earned);
    setScore(nextScore);
    setStreak(right ? streak + 1 : 0);
    setLives(nextLives);
    setMistakes(nextMistakes);
    if (right) {
      newlyFound.current.add(q.answer.z);
      setDiscovered((d) => (d.includes(q.answer.z) ? d : [...d, q.answer.z]));
    }
    Haptics.impactAsync(right ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setTimeout(() => {
      if (nextLives === 0) return finish(false, nextScore, nextMistakes);
      if (i + 1 >= round.length) return finish(true, nextScore, nextMistakes);
      setI(i + 1);
      setPicked(undefined);
      setLeft(SECONDS_PER_QUESTION);
    }, FEEDBACK_MS);
  }

  const again = () => {
    newlyFound.current = new Set();
    setRound(makeRound(level));
    setI(0);
    setLives(LIVES);
    setMistakes(0);
    setStreak(0);
    setScore(0);
    setLeft(SECONDS_PER_QUESTION);
    setPicked(undefined);
    setOver(null);
  };

  if (over) {
    const stars = starsFor(mistakes, over.finished);
    const next = LEVELS.find((l) => l.id === level.id + 1);
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.result}>
          <Text style={styles.kicker}>{`LEVEL ${level.id} · ${level.title.toUpperCase()}`}</Text>
          <Text style={styles.resultTitle}>{over.finished ? (stars === 3 ? 'Perfect!' : 'Level complete') : 'Out of lives'}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }} accessibilityLabel={`${stars} of 3 stars`}>
            {[1, 2, 3].map((n) => (
              <Ionicons key={n} name={n <= stars ? 'star' : 'star-outline'} size={44} color={n <= stars ? lab.gold : lab.line} />
            ))}
          </View>
          <Text style={styles.resultScore}>{score}</Text>
          <Text style={styles.resultSub}>
            {newlyFound.current.size} element{newlyFound.current.size === 1 ? '' : 's'} added to your collection
          </Text>
          <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 12 }}>
            {over.finished && next ? (
              <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/play/[level]', params: { level: String(next.id) } })} style={[styles.cta, { backgroundColor: lab.cyan }]}>
                <Text style={[styles.ctaText, { color: lab.bg }]}>Next level</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" onPress={again} style={[styles.cta, !(over.finished && next) && { backgroundColor: lab.cyan }]}>
              <Text style={[styles.ctaText, !(over.finished && next) && { color: lab.bg }]}>Play again</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={toLevels} style={styles.cta}>
              <Text style={styles.ctaText}>Levels</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const p = prompt(q);
  const cell = Math.floor((width - 32 - 17 * 2) / 18);
  const options: Choice[] = q.kind === 'place' ? [] : q.options;
  const label = (c: Choice) => (c === null ? '' : typeof c === 'string' ? familyLabel(c) : q.kind === 'name-of-symbol' || q.kind === 'number' ? c.name : c.symbol);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quit to levels" onPress={toLevels} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={lab.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 4 }} accessibilityLabel={`${lives} lives left`}>
          {Array.from({ length: LIVES }, (_, n) => (
            <Ionicons key={n} name={n < lives ? 'heart' : 'heart-outline'} size={22} color={n < lives ? lab.bad : lab.line} />
          ))}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.score} accessibilityLabel={`Score ${score}`}>{score}</Text>
          {streak >= 2 ? <Text style={styles.streak}>{`🔥 ${streak} in a row`}</Text> : null}
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.qnum}>{`${i + 1} / ${round.length}`}</Text>
        <View style={styles.timeTrack}>
          <View style={[styles.timeFill, { width: `${(left / SECONDS_PER_QUESTION) * 100}%`, backgroundColor: left < 4 ? lab.bad : lab.cyan }]} />
        </View>
      </View>

      <View style={styles.prompt}>
        <Text style={styles.promptLabel}>{p.label}</Text>
        <Text style={[styles.promptBig, p.big.length > 6 && { fontSize: 40 }]} adjustsFontSizeToFit numberOfLines={1}>{p.big}</Text>
        {q.kind === 'place' ? <Text style={styles.promptHint}>{q.answer.name}</Text> : null}
        {answered ? (
          <Text style={[styles.feedback, { color: isRight(q, picked) ? lab.good : lab.bad }]}>
            {isRight(q, picked) ? `Correct! +${gain}` : picked === null ? `Time's up: ${q.answer.name} (${q.answer.symbol})` : `It's ${q.kind === 'family' ? familyLabel(q.answer.family) : `${q.answer.name} (${q.answer.symbol})`}`}
          </Text>
        ) : null}
      </View>

      {q.kind === 'place' ? (
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <PeriodicTable
            cell={cell}
            maxZ={level.maxZ}
            showSymbols={answered}
            look={(e) => (!answered ? 'blank' : e.z === q.answer.z ? 'good' : picked && typeof picked !== 'string' && e.z === picked.z ? 'bad' : 'blank')}
            onPress={answered ? undefined : (e) => answer(e)}
          />
        </View>
      ) : (
        <View style={styles.options}>
          {options.map((c) => {
            const k = keyOf(c);
            const isAnswer = isRight(q, c);
            const chosen = answered && keyOf(picked ?? null) === k;
            const bg = !answered ? lab.panel : isAnswer ? lab.good : chosen ? lab.bad : lab.panel;
            const dot = typeof c === 'string' ? FAMILY_INFO[c].color : c ? FAMILY_INFO[c.family].color : lab.line;
            return (
              <Pressable key={k} accessibilityRole="button" accessibilityLabel={label(c)} disabled={answered} onPress={() => answer(c)} style={({ pressed }) => [styles.option, { backgroundColor: bg, opacity: answered && !isAnswer && !chosen ? 0.5 : 1 }, pressed && { transform: [{ scale: 0.97 }] }]}>
                {q.kind === 'family' ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
                <Text style={[styles.optionText, answered && (isAnswer || chosen) && { color: lab.bg }]}>{label(c)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: lab.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: lab.panel, alignItems: 'center', justifyContent: 'center' },
  score: { color: lab.text, fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  streak: { color: lab.gold, fontSize: 12, fontWeight: '800' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginTop: 14 },
  qnum: { color: lab.muted, fontWeight: '800', width: 52 },
  timeTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: lab.panel, overflow: 'hidden' },
  timeFill: { height: 8, borderRadius: 4 },
  prompt: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 26, gap: 6, minHeight: 200, justifyContent: 'center' },
  promptLabel: { color: lab.muted, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  promptBig: { color: lab.text, fontSize: 72, fontWeight: '900', letterSpacing: -1 },
  promptHint: { color: lab.subtle, fontSize: 15, fontWeight: '600' },
  feedback: { fontSize: 17, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  options: { paddingHorizontal: 16, gap: 10 },
  option: { minHeight: 60, borderRadius: 18, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: lab.line },
  optionText: { color: lab.text, fontSize: 19, fontWeight: '800', flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  kicker: { color: lab.cyan, fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  resultTitle: { color: lab.text, fontSize: 36, fontWeight: '900', letterSpacing: -0.5 },
  resultScore: { color: lab.text, fontSize: 56, fontWeight: '900', fontVariant: ['tabular-nums'] },
  resultSub: { color: lab.muted, fontSize: 15 },
  cta: { minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: lab.line, backgroundColor: lab.panel },
  ctaText: { color: lab.text, fontSize: 17, fontWeight: '800' },
});
