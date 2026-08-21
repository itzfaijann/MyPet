import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  label: string;
  icon: string;
  value: number;
  fillColor: string;
  lowColor?: string;
}

export const StatBar: React.FC<Props> = ({
  label,
  icon,
  value,
  fillColor,
  lowColor = '#ef4444',
}) => {
  const isLow = value < 25;
  const displayColor = isLow ? lowColor : fillColor;

  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(`${value}%` as any, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    }),
    backgroundColor: displayColor,
  }));

  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, isLow && styles.labelLow]}>{label}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
      <Text style={[styles.value, isLow && styles.valueLow]}>
        {Math.round(value)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 18,
    width: 28,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    width: 80,
  },
  labelLow: {
    color: '#fca5a5',
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  value: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  valueLow: {
    color: '#fca5a5',
  },
});