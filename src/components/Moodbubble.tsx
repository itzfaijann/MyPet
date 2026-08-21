import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  emoji: string;
  visible: boolean;
}

export const MoodBubble: React.FC<Props> = ({ emoji, visible }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1);
      translateY.value = withSpring(0);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(6, { duration: 200 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.bubble, animStyle]}>
      <Animated.Text style={styles.emoji}>{emoji}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    top: -36,
    right: -16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 2,
  },
  emoji: {
    fontSize: 18,
  },
});