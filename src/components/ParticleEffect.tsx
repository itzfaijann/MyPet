import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  delay: number;
}

interface Props {
  trigger: number;           // increment this to fire
  emojis: string[];
  originX: number;           // center X of pet on screen
  originY: number;           // center Y of pet on screen
  count?: number;
}

export const ParticleEffect: React.FC<Props> = ({
  trigger,
  emojis,
  originX,
  originY,
  count = 7,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const p: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: originX + (Math.random() - 0.5) * 100,
      y: originY + (Math.random() - 0.5) * 60,
      delay: Math.random() * 250,
    }));
    setParticles(p);
    const timer = setTimeout(() => setParticles([]), 1600);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <>
      {particles.map(p => (
        <SingleParticle key={p.id} particle={p} />
      ))}
    </>
  );
};

const SingleParticle = ({ particle }: { particle: Particle }) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const cfg = { duration: 1000, easing: Easing.out(Easing.quad) };
    opacity.value = withDelay(particle.delay, withTiming(0, cfg));
    translateY.value = withDelay(particle.delay, withTiming(-90, cfg));
    scale.value = withDelay(particle.delay, withTiming(0.3, cfg));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: particle.x,
    top: particle.y,
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    pointerEvents: 'none',
  }));

  return (
    <Animated.Text style={[styles.particle, style]}>
      {particle.emoji}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  particle: {
    fontSize: 22,
    zIndex: 999,
  },
});