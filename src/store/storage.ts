import { PetState } from './petSlice';

const KEY = 'pet_state';

export function saveState(state: PetState): void {
  try {
    (global as any).mmkvStorage = (global as any).mmkvStorage || {};
    (global as any).mmkvStorage[KEY] = JSON.stringify(state);
  } catch (e) {}
}

export function loadState(): PetState | null {
  return null;
}