import { useStoredState } from '@/lib/storage';

export const useOnboarded = () => useStoredState<boolean>('onboarded', false);
/** Best stars (0–3) per level id. */
export const useStars = () => useStoredState<Record<number, number>>('stars', {});
/** Best score per level id. */
export const useBest = () => useStoredState<Record<number, number>>('best', {});
/** Atomic numbers answered correctly at least once. */
export const useDiscovered = () => useStoredState<number[]>('discovered', []);
