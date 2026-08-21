import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/index';
import {
  feedPet,
  playPet,
  startSleep,
  wakePet,
} from '../store/petSlice';
import { PetCharacter, PetCharacterRef } from './PetCharacter';
import { ActionButton } from './ActionButton';
import { ParticleEffect } from './ParticleEffect';
import { MOOD, PROGRESSION } from '../store/constants';
import { usePetDecay } from '../store/usePetDecay';
import { useHaptics } from '../store/useHaptics';
import { MoodBubble } from './Moodbubble';
import { StatBar } from './StatBar';
import { SafeAreaView } from 'react-native-safe-area-context';


export const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pet = useSelector((s: RootState) => s.pet);
  const haptics = useHaptics();
  const petRef = useRef<PetCharacterRef>(null);

  // Start decay loop
  usePetDecay();

  // Particle trigger state
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleEmojis, setParticleEmojis] = useState(['✨']);
  const [showMood, setShowMood] = useState(false);

  // Toast
  const [toast, setToast] = useState('');
  const toastOpacity = useSharedValue(0);
  const toastY = useSharedValue(-8);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // XP bar animation
  const xpInLevel = pet.xp % (pet.level * PROGRESSION.XP_PER_LEVEL);
  const xpMax = pet.level * PROGRESSION.XP_PER_LEVEL;
  const xpFillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${(xpInLevel / xpMax) * 100}%` as any, { duration: 500 }),
  }));

  const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
  const moodEmoji =
    avg >= MOOD.HAPPY_THRESHOLD ? '😊' : avg >= MOOD.NEUTRAL_THRESHOLD ? '😐' : '😢';

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    toastOpacity.value = withSpring(1);
    toastY.value = withSpring(0);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      toastY.value = withTiming(-8, { duration: 300 });
    }, 1800);
  }, []);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastY.value }],
  }));

  const fireParticles = (emojis: string[]) => {
    setParticleEmojis(emojis);
    setParticleTrigger(t => t + 1);
  };

  const prevLevel = useRef(pet.level);
  useEffect(() => {
    if (pet.level > prevLevel.current) {
      showToast(`🎉 Level up! You're Lv.${pet.level}!`);
      fireParticles(['⭐', '✨', '💫', '🌟']);
      haptics.levelUp();
    }
    prevLevel.current = pet.level;
  }, [pet.level]);

  const handleFeed = () => {
    if (pet.isSleeping) { showToast('Shhh… pet is sleeping 💤'); return; }
    if (pet.hunger >= 100) { showToast('Already full! 🍎'); return; }
    dispatch(feedPet());
    petRef.current?.bounce();
    fireParticles(['🍎', '🍓', '🍊', '✨']);
    showToast('+20 Hunger 🍎');
    setShowMood(true);
    haptics.medium();
    setTimeout(() => setShowMood(false), 2000);
  };

  const handlePlay = () => {
    if (pet.isSleeping) { showToast('Wake up first! ☀️'); return; }
    if (pet.happiness >= 100) { showToast('Already super happy! ✨'); return; }
    dispatch(playPet());
    petRef.current?.bounce();
    fireParticles(['💕', '🎉', '💖', '✨']);
    showToast('+20 Happiness 🎮');
    setShowMood(true);
    haptics.medium();
    setTimeout(() => setShowMood(false), 2000);
  };

  const handleSleep = () => {
    if (pet.isSleeping) {
      dispatch(wakePet());
      showToast('Good morning! ☀️');
      haptics.light();
    } else {
      dispatch(startSleep());
      fireParticles(['💤', '🌙', '⭐']);
      showToast('Zzz… sleeping 💤');
      haptics.light();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0533" />
      <View style={styles.screen}>

        {/* Toast */}
        <Animated.View style={[styles.toast, toastStyle]} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>

        {/* Top bar: coins + level */}
        <View style={styles.topBar}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinIcon}>✦</Text>
            <Text style={styles.coinText}>{pet.coins}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{pet.level}</Text>
          </View>
        </View>

        {/* XP bar */}
        <View style={styles.xpWrap}>
          <Text style={styles.xpLabel}>
            XP: {xpInLevel} / {xpMax}
          </Text>
          <View style={styles.xpTrack}>
            <Animated.View style={[styles.xpFill, xpFillStyle]} />
          </View>
        </View>

        {/* Actions streak */}
        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>
            🔥 Actions today: {pet.actionsToday}
          </Text>
        </View>

        {/* Pet stage */}
        <View style={styles.petStage}>
          <View style={styles.petWrap}>
            <ParticleEffect
              trigger={particleTrigger}
              emojis={particleEmojis}
              originX={55}
              originY={55}
              count={8}
            />
            <PetCharacter
              ref={petRef}
              hunger={pet.hunger}
              happiness={pet.happiness}
              energy={pet.energy}
              isSleeping={pet.isSleeping}
            />
            <MoodBubble emoji={moodEmoji} visible={showMood} />
            {pet.isSleeping && (
              <Text style={styles.zzzText}>💤</Text>
            )}
          </View>
          <View style={styles.petShadow} />
        </View>

        {/* Stat bars */}
        <View style={styles.stats}>
          <StatBar            label="Hunger"
            icon="🍎"
            value={pet.hunger}
            fillColor="#f97316"
          />
          <StatBar
            label="Happiness"
            icon="✨"
            value={pet.happiness}
            fillColor="#ec4899"
          />
          <StatBar
            label="Energy"
            icon="⚡"
            value={pet.energy}
            fillColor="#3b82f6"
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <ActionButton
            emoji="🍎"
            label="Feed"
            reward="+5✦ +10XP"
            accentColor="#f97316"
            onPress={handleFeed}
            disabled={pet.isSleeping}
          />
          <ActionButton
            emoji="🎮"
            label="Play"
            reward="+5✦ +10XP"
            accentColor="#ec4899"
            onPress={handlePlay}
            disabled={pet.isSleeping}
          />
          <ActionButton
            emoji={pet.isSleeping ? '☀️' : '💤'}
            label={pet.isSleeping ? 'Wake' : 'Sleep'}
            reward="+5✦ +10XP"
            accentColor="#3b82f6"
            onPress={handleSleep}
            disabled={false}
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a0533',
  },
  screen: {
    flex: 1,
    backgroundColor: '#1a0533',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  toast: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    zIndex: 100,
  },
  toastText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,200,50,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,200,50,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  coinIcon: {
    color: '#FFD700',
    fontSize: 13,
  },
  coinText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  levelBadge: {
    backgroundColor: 'rgba(160,100,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(160,100,255,0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  levelText: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: '600',
  },
  xpWrap: {
    marginBottom: 10,
  },
  xpLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginBottom: 4,
  },
  xpTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 3,
  },
  streakBanner: {
    backgroundColor: 'rgba(255,200,50,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,200,50,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  streakText: {
    color: 'rgba(255,200,50,0.85)',
    fontSize: 12,
  },
  petStage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 180,
  },
  petWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petShadow: {
    width: 80,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 40,
    marginTop: -6,
  },
  zzzText: {
    position: 'absolute',
    top: -20,
    right: -20,
    fontSize: 20,
  },
  stats: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});