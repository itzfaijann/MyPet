import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export interface PetCharacterRef {
  bounce: () => void;
}

interface Props {
  hunger: number;
  happiness: number;
  energy: number;
  isSleeping: boolean;
}

export const PetCharacter = forwardRef<PetCharacterRef, Props>(
  ({ hunger, happiness, energy, isSleeping }, ref) => {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      bounce() {
        scale.value = withSequence(
          withSpring(1.15),
          withSpring(0.95),
          withSpring(1),
        );
        translateY.value = withSequence(
          withTiming(-12, { duration: 150 }),
          withTiming(0, { duration: 150 }),
        );
      },
    }));

    const avg = (hunger + happiness + energy) / 3;
    const bodyColor = avg >= 65 ? '#a78bfa' : avg >= 35 ? '#818cf8' : '#6366f1';
    const mouthPath =
      avg >= 65
        ? 'M 38 62 Q 50 72 62 62'
        : avg >= 35
        ? 'M 38 65 Q 50 65 62 65'
        : 'M 38 68 Q 50 58 62 68';

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    }));

    return (
      <Animated.View style={[styles.container, animStyle]}>
        <Svg width={110} height={110} viewBox="0 0 100 100">
          {/* Body */}
          <Circle cx="50" cy="55" r="32" fill={bodyColor} />
          {/* Belly */}
          <Ellipse cx="50" cy="62" rx="16" ry="12" fill="rgba(255,255,255,0.2)" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <Path d="M 33 42 Q 38 38 43 42" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <Path d="M 57 42 Q 62 38 67 42" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <Circle cx="38" cy="43" r="5" fill="white" />
              <Circle cx="62" cy="43" r="5" fill="white" />
              <Circle cx="39" cy="43" r="2.5" fill="#1e1b4b" />
              <Circle cx="63" cy="43" r="2.5" fill="#1e1b4b" />
              <Circle cx="40" cy="42" r="1" fill="white" />
              <Circle cx="64" cy="42" r="1" fill="white" />
            </>
          )}
          {/* Cheeks */}
          <Ellipse cx="30" cy="54" rx="7" ry="5" fill="rgba(255,150,180,0.35)" />
          <Ellipse cx="70" cy="54" rx="7" ry="5" fill="rgba(255,150,180,0.35)" />
          {/* Mouth */}
          <Path d={mouthPath} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Ears */}
          <Ellipse cx="25" cy="28" rx="9" ry="13" fill={bodyColor} />
          <Ellipse cx="75" cy="28" rx="9" ry="13" fill={bodyColor} />
          <Ellipse cx="25" cy="28" rx="5" ry="8" fill="rgba(255,200,220,0.5)" />
          <Ellipse cx="75" cy="28" rx="5" ry="8" fill="rgba(255,200,220,0.5)" />
        </Svg>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});