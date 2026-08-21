import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 10 });
    textOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 });
      setTimeout(onFinish, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const petStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.pet, petStyle]}>🐱</Animated.Text>
      <Animated.View style={textStyle}>
        <Text style={styles.title}>My Pet</Text>
        <Text style={styles.sub}>Your virtual companion</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0533',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  pet: {
    fontSize: 100,
  },
  title: {
    color: '#c084fc',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});