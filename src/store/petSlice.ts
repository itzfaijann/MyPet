import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ACTION, DECAY, PROGRESSION, SLEEP } from "./constants";

export interface PetState {
  hunger: number;
  happiness: number;
  energy: number;
  coins: number;
  xp: number;
  level: number;
  actionsToday: number;
  isSleeping: boolean;
  lastSavedAt: number;
}

const initialState: PetState = {
  hunger: 80,
  happiness: 70,
  energy: 60,
  coins: 0,
  xp: 0,
  level: 1,
  actionsToday: 0,
  isSleeping: false,
  lastSavedAt: Date.now(),
};

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

const addReward = (state: PetState) => {
  state.coins += ACTION.COINS_PER_ACTION;
  state.xp += ACTION.XP_PER_ACTION;
  state.actionsToday += 1;
  const xpNeeded = state.level * PROGRESSION.XP_PER_LEVEL;
  if (state.xp >= xpNeeded) {
    state.level += 1;
  }
};

const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    feedPet(state) {
      state.hunger = clamp(state.hunger + ACTION.FEED_HUNGER);
      addReward(state);
    },
    playPet(state) {
      state.happiness = clamp(state.happiness + ACTION.PLAY_HAPPY);
      state.energy = clamp(state.energy - ACTION.PLAY_ENERGY_COST);
      addReward(state);
    },
    startSleep(state) {
      state.isSleeping = true;
      addReward(state);
    },
    wakePet(state) {
      state.isSleeping = false;
    },
    tickDecay(state) {
      if (!state.isSleeping) {
        state.hunger = clamp(state.hunger - DECAY.HUNGER_PER_TICK);
        state.happiness = clamp(state.happiness - DECAY.HAPPY_PER_TICK);
        state.energy = clamp(state.energy - DECAY.ENERGY_PER_TICK);
      }
    },
    tickSleep(state) {
      if (state.isSleeping) {
        state.energy = clamp(state.energy + SLEEP.ENERGY_RESTORE_PER_TICK);
      }
    },
    applyOfflineDecay(state, action: PayloadAction<number>) {
      const minutes = action.payload;
      const decay = Math.min(minutes * DECAY.OFFLINE_PER_MINUTE, DECAY.OFFLINE_CAP);
      state.hunger = clamp(state.hunger - decay);
      state.happiness = clamp(state.happiness - decay);
      state.energy = clamp(state.energy - decay);
      state.lastSavedAt = Date.now();
    },
    // ← renamed from loadPersistedState/restoreFromOffline in old snippet
    hydrate(state, action: PayloadAction<PetState>) {
      return { ...action.payload };
    },
    stampSaveTime(state) {
      state.lastSavedAt = Date.now();
    },
  },
});

export const {
  feedPet,
  playPet,
  startSleep,
  wakePet,
  tickDecay,
  tickSleep,
  applyOfflineDecay,
  hydrate,
  stampSaveTime,
} = petSlice.actions;

export default petSlice.reducer;