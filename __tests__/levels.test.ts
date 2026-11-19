import { isUnlocked, LEVELS, makeRound, points, poolFor, prompt, seeded, starsFor } from '@/game/levels';

describe('rounds', () => {
  it('asks 10 different elements from inside the level only', () => {
    for (const level of LEVELS) {
      const round = makeRound(level, seeded(level.id));
      expect(round).toHaveLength(10);
      expect(new Set(round.map((q) => q.answer.z)).size).toBe(10);
      for (const q of round) expect(q.answer.z).toBeLessThanOrEqual(level.maxZ);
    }
  });

  it('mixes every kind of question', () => {
    const kinds = new Set(makeRound(LEVELS[2], seeded(7)).map((q) => q.kind));
    expect([...kinds].sort()).toEqual(['family', 'name-of-symbol', 'number', 'place', 'symbol-of-name']);
  });

  it('every multiple-choice question has 4 distinct options including the answer', () => {
    for (let s = 1; s <= 30; s++) {
      for (const q of makeRound(LEVELS[s % 6], seeded(s))) {
        if (q.kind === 'place') continue;
        expect(q.options).toHaveLength(4);
        const keys = q.options.map((o) => (typeof o === 'string' ? o : o.z));
        expect(new Set(keys).size).toBe(4);
        expect(keys).toContain(q.kind === 'family' ? q.answer.family : q.answer.z);
      }
    }
  });

  it('level 1 (only 10 elements, few families) still works', () => {
    expect(poolFor(LEVELS[0])).toHaveLength(10);
    expect(makeRound(LEVELS[0], seeded(3))).toHaveLength(10);
  });

  it('prompts read naturally', () => {
    const q = makeRound(LEVELS[5], seeded(9))[0];
    expect(prompt(q).big.length).toBeGreaterThan(0);
  });
});

describe('scoring', () => {
  it('rewards speed and streaks, capped at double', () => {
    expect(points(0, 0)).toBe(100);
    expect(points(10, 0)).toBe(200);
    expect(points(10, 5)).toBe(300);
    expect(points(10, 50)).toBe(400);
  });

  it('stars: 3 for perfect, 2 for one slip, 1 for two, none if you run out of lives', () => {
    expect([starsFor(0, true), starsFor(1, true), starsFor(2, true), starsFor(3, false)]).toEqual([3, 2, 1, 0]);
  });

  it('levels unlock in order', () => {
    expect(isUnlocked(1, {})).toBe(true);
    expect(isUnlocked(2, {})).toBe(false);
    expect(isUnlocked(2, { 1: 1 })).toBe(true);
  });
});
