import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';  // ← type-only import breaks circular ref
import {
  tickDecay,
  tickSleep,
  applyOfflineDecay,
  stampSaveTime,
} from './petSlice';
import { saveState } from './storage';
import { DECAY } from './constants';

export const usePetDecay = () => {
  const dispatch = useDispatch<AppDispatch>();
  const petState = useSelector((s: RootState) => s.pet);
  const petRef = useRef(petState);
  const bgTimestamp = useRef<number | null>(null);

  useEffect(() => {
    petRef.current = petState;
  }, [petState]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(tickDecay());
      dispatch(tickSleep());
      saveState(petRef.current);
    }, DECAY.TICK_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        bgTimestamp.current = Date.now();
        dispatch(stampSaveTime());
        saveState(petRef.current);
      } else if (nextState === 'active' && bgTimestamp.current !== null) {
        const elapsedMs = Date.now() - bgTimestamp.current;
        const elapsedMinutes = elapsedMs / 1000 / 60;
        if (elapsedMinutes >= 0.5) {
          dispatch(applyOfflineDecay(elapsedMinutes));
        }
        bgTimestamp.current = null;
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [dispatch]);
};