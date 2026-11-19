import { byZ, ELEMENTS, positionOf } from '@/game/elements';

describe('the periodic table data', () => {
  it('has all 118 elements with unique symbols and names', () => {
    expect(ELEMENTS).toHaveLength(118);
    expect(new Set(ELEMENTS.map((e) => e.symbol)).size).toBe(118);
    expect(new Set(ELEMENTS.map((e) => e.name)).size).toBe(118);
    ELEMENTS.forEach((e, i) => expect(e.z).toBe(i + 1));
  });

  it('spot-checks well-known elements', () => {
    expect(byZ(6)).toMatchObject({ symbol: 'C', name: 'Carbon', period: 2, group: 14, family: 'nonmetal' });
    expect(byZ(26)).toMatchObject({ symbol: 'Fe', name: 'Iron', period: 4, group: 8, family: 'transition' });
    expect(byZ(79)).toMatchObject({ symbol: 'Au', name: 'Gold', period: 6, group: 11 });
    expect(byZ(80)).toMatchObject({ symbol: 'Hg', state: 'liquid' });
    expect(byZ(92)).toMatchObject({ symbol: 'U', name: 'Uranium', family: 'actinide', group: null });
    expect(byZ(118)).toMatchObject({ symbol: 'Og', period: 7, group: 18, family: 'noble-gas' });
  });

  it('puts every element in the right period', () => {
    const starts = [1, 3, 11, 19, 37, 55, 87, 119];
    for (const e of ELEMENTS) {
      const period = starts.findIndex((s, i) => e.z >= s && e.z < starts[i + 1]) + 1;
      expect(e.period).toBe(period);
    }
  });

  it('lines up the groups: alkali metals in 1, halogens in 17, noble gases in 18', () => {
    for (const z of [3, 11, 19, 37, 55, 87]) expect(byZ(z).group).toBe(1);
    for (const z of [9, 17, 35, 53, 85, 117]) expect(byZ(z).group).toBe(17);
    for (const z of [2, 10, 18, 36, 54, 86, 118]) expect(byZ(z).group).toBe(18);
    expect(positionOf(72).group).toBe(4); // Hafnium, right after the lanthanides
    expect(positionOf(104).group).toBe(4); // Rutherfordium, after the actinides
  });

  it('places the lanthanides and actinides in their own rows, 15 each', () => {
    expect(ELEMENTS.filter((e) => e.group === null)).toHaveLength(30);
    expect(byZ(57)).toMatchObject({ row: 9, col: 3 });
    expect(byZ(71)).toMatchObject({ row: 9, col: 17 });
    expect(byZ(89)).toMatchObject({ row: 10, col: 3 });
  });

  it('never puts two elements in the same cell', () => {
    expect(new Set(ELEMENTS.map((e) => `${e.row}:${e.col}`)).size).toBe(118);
  });

  it('knows which elements are gases and liquids at room temperature', () => {
    expect(ELEMENTS.filter((e) => e.state === 'gas').map((e) => e.symbol)).toEqual(['H', 'He', 'N', 'O', 'F', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe', 'Rn']);
    expect(ELEMENTS.filter((e) => e.state === 'liquid').map((e) => e.symbol)).toEqual(['Br', 'Hg']);
  });
});
