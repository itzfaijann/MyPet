import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface Props {
  emoji: string;
  label: string;
  reward: string;
  accentColor: string;
  onPress: () => void;
  disabled: boolean;
}

export const ActionButton: React.FC<Props> = ({
  emoji, label, reward, accentColor, onPress, disabled,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { borderColor: accentColor + '55', opacity: disabled ? 0.4 : 1 },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      <Text style={styles.reward}>{reward}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 4,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  reward: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
  },
});