import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { ELEMENTS, FAMILY_INFO } from '@/game/elements';
import { resetStoredStateCache } from '@/lib/storage';

const APP = './src/app';
async function open(url: string) {
  await renderRouter(APP, { initialUrl: url });
  jest.useRealTimers();
}

/** Read the question on screen and tap the right (or a wrong) answer, like a player would. */
async function answer(correct: boolean) {
  const prompts = ['Which element is this?', 'What is the symbol for', 'Which element has atomic number', 'Which family is', 'Tap where this element goes'] as const;
  const label = prompts.find((p) => screen.queryByText(p));
  if (!label) throw new Error('no question on screen');
  const shown = (s: string) => screen.queryByText(s) !== null;
  const e =
    label === 'Which element has atomic number'
      ? ELEMENTS.find((x) => shown(String(x.z)) && !shown(`${x.z} / 10`))!
      : label === 'What is the symbol for' || label === 'Which family is'
        ? ELEMENTS.find((x) => shown(x.name))!
        : ELEMENTS.find((x) => shown(x.symbol))!;

  if (label === 'Tap where this element goes') {
    const target = correct ? e : ELEMENTS.find((x) => x.z !== e.z && x.z <= 10)!;
    await fireEvent.press(screen.getByLabelText(`Period ${target.period}, column ${target.col}`));
    return;
  }
  const right = label === 'Which family is' ? FAMILY_INFO[e.family].label : label === 'What is the symbol for' ? e.symbol : e.name;
  if (correct) {
    await fireEvent.press(screen.getByLabelText(right));
  } else {
    const buttons = screen.getAllByRole('button').filter((b) => b.props.accessibilityLabel && b.props.accessibilityLabel !== right && b.props.accessibilityLabel !== 'Quit to levels');
    await fireEvent.press(buttons[0]);
  }
}

beforeEach(async () => {
  await AsyncStorage.clear();
  resetStoredStateCache();
});

it('first launch shows the intro, then the levels with only level 1 open', async () => {
  await open('/');
  expect(await screen.findByText('Learn the elements by playing')).toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Skip'));
  expect(await screen.findByText('Periodica')).toBeOnTheScreen();
  expect(screen.getByLabelText('Level 1, First Light')).toBeOnTheScreen();
  expect(screen.getByLabelText('Level 2, locked')).toBeOnTheScreen();
  expect(screen.getByText('0 / 118 discovered')).toBeOnTheScreen();
});

it('a perfect round earns 3 stars, discovers 10 elements and unlocks level 2', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  await open('/play/1');
  for (let q = 0; q < 10; q++) {
    await waitFor(() => expect(screen.getByText(`${q + 1} / 10`)).toBeOnTheScreen(), { timeout: 3000 });
    await answer(true);
  }
  expect(await screen.findByText('Perfect!', {}, { timeout: 3000 })).toBeOnTheScreen();
  expect(screen.getByLabelText('3 of 3 stars')).toBeOnTheScreen();
  expect(JSON.parse((await AsyncStorage.getItem('stars'))!)).toEqual({ 1: 3 });
  expect(JSON.parse((await AsyncStorage.getItem('discovered'))!)).toHaveLength(10);
  await fireEvent.press(screen.getByText('Levels'));
  expect(await screen.findByLabelText('Level 2, Salt & Sand')).toBeOnTheScreen();
}, 40000);

it('three wrong answers end the round with no stars', async () => {
  await AsyncStorage.setItem('onboarded', 'true');
  await open('/play/1');
  for (let q = 0; q < 3; q++) {
    await waitFor(() => expect(screen.getByText(`${q + 1} / 10`)).toBeOnTheScreen(), { timeout: 3000 });
    await answer(false);
  }
  expect(await screen.findByText('Out of lives', {}, { timeout: 3000 })).toBeOnTheScreen();
  expect(screen.getByLabelText('0 of 3 stars')).toBeOnTheScreen();
  expect(await AsyncStorage.getItem('discovered')).toBeNull();
}, 20000);

it('the explorer only reveals discovered elements', async () => {
  await AsyncStorage.multiSet([
    ['onboarded', 'true'],
    ['discovered', JSON.stringify([1, 8, 79])],
  ]);
  await open('/explorer');
  expect(await screen.findByLabelText('Gold, 79')).toBeOnTheScreen();
  expect(screen.getByLabelText('Undiscovered element 26')).toBeOnTheScreen();
  await fireEvent.press(screen.getByLabelText('Gold, 79'));
  expect(await screen.findByText('Transition metal')).toBeOnTheScreen();
});
