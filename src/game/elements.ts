/**
 * The 118 elements: number, symbol, name, family and state at room temperature.
 * Table position (period, group, grid cell) is derived from the atomic number,
 * using the common layout with the lanthanides and actinides in two rows below.
 */
export type Family =
  | 'alkali'
  | 'alkaline-earth'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export type State = 'solid' | 'liquid' | 'gas' | 'unknown';

export interface Element {
  z: number;
  symbol: string;
  name: string;
  family: Family;
  state: State;
  period: number;
  /** 1–18, or null for the lanthanide/actinide rows. */
  group: number | null;
  /** Position on the display grid: row 1–7 main table, 9–10 f-block rows; col 1–18. */
  row: number;
  col: number;
}

// prettier-ignore
const SYMBOLS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
  'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
  'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
  'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
  'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og',
];

// prettier-ignore
const NAMES = [
  'Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon',
  'Sodium', 'Magnesium', 'Aluminium', 'Silicon', 'Phosphorus', 'Sulfur', 'Chlorine', 'Argon', 'Potassium', 'Calcium',
  'Scandium', 'Titanium', 'Vanadium', 'Chromium', 'Manganese', 'Iron', 'Cobalt', 'Nickel', 'Copper', 'Zinc',
  'Gallium', 'Germanium', 'Arsenic', 'Selenium', 'Bromine', 'Krypton', 'Rubidium', 'Strontium', 'Yttrium', 'Zirconium',
  'Niobium', 'Molybdenum', 'Technetium', 'Ruthenium', 'Rhodium', 'Palladium', 'Silver', 'Cadmium', 'Indium', 'Tin',
  'Antimony', 'Tellurium', 'Iodine', 'Xenon', 'Caesium', 'Barium', 'Lanthanum', 'Cerium', 'Praseodymium', 'Neodymium',
  'Promethium', 'Samarium', 'Europium', 'Gadolinium', 'Terbium', 'Dysprosium', 'Holmium', 'Erbium', 'Thulium', 'Ytterbium',
  'Lutetium', 'Hafnium', 'Tantalum', 'Tungsten', 'Rhenium', 'Osmium', 'Iridium', 'Platinum', 'Gold', 'Mercury',
  'Thallium', 'Lead', 'Bismuth', 'Polonium', 'Astatine', 'Radon', 'Francium', 'Radium', 'Actinium', 'Thorium',
  'Protactinium', 'Uranium', 'Neptunium', 'Plutonium', 'Americium', 'Curium', 'Berkelium', 'Californium', 'Einsteinium', 'Fermium',
  'Mendelevium', 'Nobelium', 'Lawrencium', 'Rutherfordium', 'Dubnium', 'Seaborgium', 'Bohrium', 'Hassium', 'Meitnerium', 'Darmstadtium',
  'Roentgenium', 'Copernicium', 'Nihonium', 'Flerovium', 'Moscovium', 'Livermorium', 'Tennessine', 'Oganesson',
];

const FAMILY_MEMBERS: Partial<Record<Family, number[]>> = {
  alkali: [3, 11, 19, 37, 55, 87],
  'alkaline-earth': [4, 12, 20, 38, 56, 88],
  halogen: [9, 17, 35, 53, 85, 117],
  'noble-gas': [2, 10, 18, 36, 54, 86, 118],
  metalloid: [5, 14, 32, 33, 51, 52],
  nonmetal: [1, 6, 7, 8, 15, 16, 34],
  'post-transition': [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116],
};

function familyOf(z: number): Family {
  if (z >= 57 && z <= 71) return 'lanthanide';
  if (z >= 89 && z <= 103) return 'actinide';
  for (const [f, list] of Object.entries(FAMILY_MEMBERS)) if (list!.includes(z)) return f as Family;
  return 'transition';
}

const GASES = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86];
const LIQUIDS = [35, 80];
function stateOf(z: number): State {
  if (GASES.includes(z)) return 'gas';
  if (LIQUIDS.includes(z)) return 'liquid';
  return z >= 100 ? 'unknown' : 'solid';
}

/** Period, group and grid cell for an atomic number. */
export function positionOf(z: number): Pick<Element, 'period' | 'group' | 'row' | 'col'> {
  if (z === 1) return { period: 1, group: 1, row: 1, col: 1 };
  if (z === 2) return { period: 1, group: 18, row: 1, col: 18 };
  if (z <= 18) {
    const period = z <= 10 ? 2 : 3;
    const i = z - (period === 2 ? 3 : 11); // 0..7 within the period
    const group = i < 2 ? i + 1 : i + 11;
    return { period, group, row: period, col: group };
  }
  if (z <= 54) {
    const period = z <= 36 ? 4 : 5;
    const group = z - (period === 4 ? 18 : 36);
    return { period, group, row: period, col: group };
  }
  const period = z <= 86 ? 6 : 7;
  const first = period === 6 ? 55 : 87;
  const i = z - first;
  if (i < 2) return { period, group: i + 1, row: period, col: i + 1 };
  if (i < 17) return { period, group: null, row: period === 6 ? 9 : 10, col: i + 1 }; // f-block: cols 3–17
  return { period, group: i - 13, row: period, col: i - 13 }; // Hf–Rn and Rf–Og: groups 4–18
}

export const ELEMENTS: Element[] = SYMBOLS.map((symbol, i) => {
  const z = i + 1;
  return { z, symbol, name: NAMES[i], family: familyOf(z), state: stateOf(z), ...positionOf(z) };
});

export const byZ = (z: number) => ELEMENTS[z - 1];

export const FAMILY_INFO: Record<Family, { label: string; color: string }> = {
  alkali: { label: 'Alkali metal', color: '#FF6B6B' },
  'alkaline-earth': { label: 'Alkaline earth metal', color: '#FFA94D' },
  transition: { label: 'Transition metal', color: '#FFD43B' },
  'post-transition': { label: 'Post-transition metal', color: '#94D82D' },
  metalloid: { label: 'Metalloid', color: '#38D9A9' },
  nonmetal: { label: 'Reactive nonmetal', color: '#4DABF7' },
  halogen: { label: 'Halogen', color: '#748FFC' },
  'noble-gas': { label: 'Noble gas', color: '#DA77F2' },
  lanthanide: { label: 'Lanthanide', color: '#F783AC' },
  actinide: { label: 'Actinide', color: '#E599F7' },
};
