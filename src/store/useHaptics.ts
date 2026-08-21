import { Vibration, Platform } from 'react-native';

export const useHaptics = () => {
  const trigger = (duration: number | number[]) => {
    try {
      Vibration.vibrate(duration);
    } catch (_) {}
  };

  return {
    light: () => trigger(10),
    medium: () => trigger(20),
    heavy: () => trigger(40),
    success: () => trigger([0, 20, 50, 20]),
    levelUp: () => trigger([0, 30, 100, 30, 100, 30]),
  };
};