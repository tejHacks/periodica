/**
 * Levels, questions and scoring. Pure functions so the whole game is testable.
 */
import { ELEMENTS, FAMILY_INFO, byZ, type Element, type Family } from './elements';

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  maxZ: number;
}

/** Each level opens more of the table, ending with all 118. */
export const LEVELS: Level[] = [
  { id: 1, title: 'First Light', subtitle: 'Hydrogen to Neon', maxZ: 10 },
  { id: 2, title: 'Salt & Sand', subtitle: 'Up to Argon', maxZ: 18 },
  { id: 3, title: 'The Metals', subtitle: 'Up to Krypton', maxZ: 36 },
  { id: 4, title: 'Silver Row', subtitle: 'Up to Xenon', maxZ: 54 },
  { id: 5, title: 'Heavy Gold', subtitle: 'Up to Radon', maxZ: 86 },
  { id: 6, title: 'The Whole Table', subtitle: 'All 118 elements', maxZ: 118 },
];

export const QUESTIONS_PER_ROUND = 10;
export const LIVES = 3;
export const SECONDS_PER_QUESTION = 12;

export type Question =
  | { kind: 'name-of-symbol'; answer: Element; options: Element[] }
  | { kind: 'symbol-of-name'; answer: Element; options: Element[] }
  | { kind: 'number'; answer: Element; options: Element[] }
  | { kind: 'family'; answer: Element; options: Family[] }
  | { kind: 'place'; answer: Element };

export type Rng = () => number;

/** Small seeded generator (mulberry32) so rounds can be replayed in tests. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rng: Rng): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Three wrong answers, preferring look-alikes (same family or close number) to keep it honest. */
function distractors(answer: Element, pool: Element[], rng: Rng): Element[] {
  const others = pool.filter((e) => e.z !== answer.z);
  const close = shuffle(others.filter((e) => e.family === answer.family || Math.abs(e.z - answer.z) <= 3), rng);
  const rest = shuffle(others.filter((e) => !close.includes(e)), rng);
  return [...close, ...rest].slice(0, 3);
}

export function poolFor(level: Level) {
  return ELEMENTS.filter((e) => e.z <= level.maxZ);
}

/** A round of questions. Mixes every kind, and never asks about the same element twice. */
export function makeRound(level: Level, rng: Rng = Math.random, count = QUESTIONS_PER_ROUND): Question[] {
  const pool = poolFor(level);
  const families = [...new Set(pool.map((e) => e.family))];
  const picks = shuffle(pool, rng).slice(0, count);
  const kinds: Question['kind'][] = ['name-of-symbol', 'symbol-of-name', 'place', 'number', 'family'];
  return picks.map((answer, i) => {
    let kind = kinds[i % kinds.length];
    if (kind === 'family' && families.length < 4) kind = 'place';
    switch (kind) {
      case 'family': {
        const wrong = shuffle(families.filter((f) => f !== answer.family), rng).slice(0, 3);
        return { kind, answer, options: shuffle([answer.family, ...wrong], rng) };
      }
      case 'place':
        return { kind, answer };
      default:
        return { kind, answer, options: shuffle([answer, ...distractors(answer, pool, rng)], rng) };
    }
  });
}

export function prompt(q: Question) {
  switch (q.kind) {
    case 'name-of-symbol':
      return { label: 'Which element is this?', big: q.answer.symbol };
    case 'symbol-of-name':
      return { label: 'What is the symbol for', big: q.answer.name };
    case 'number':
      return { label: 'Which element has atomic number', big: String(q.answer.z) };
    case 'family':
      return { label: 'Which family is', big: q.answer.name };
    case 'place':
      return { label: 'Tap where this element goes', big: q.answer.symbol };
  }
}

export const familyLabel = (f: Family) => FAMILY_INFO[f].label;

/** Points for a correct answer: base + speed bonus, times the streak multiplier (up to ×2). */
export function points(secondsLeft: number, streak: number) {
  const multiplier = Math.min(2, 1 + streak * 0.1);
  return Math.round((100 + Math.max(0, Math.ceil(secondsLeft)) * 10) * multiplier);
}

/** Finishing the round is a pass; stars depend on mistakes. */
export function starsFor(mistakes: number, finished: boolean) {
  if (!finished) return 0;
  return mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
}

/** A level is open when the one before it has at least one star. */
export const isUnlocked = (id: number, stars: Record<number, number>) => id === 1 || (stars[id - 1] ?? 0) > 0;

export { byZ };
