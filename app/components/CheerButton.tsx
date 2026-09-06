import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Flame } from 'lucide-react-native';

interface CheerButtonProps {
  initialCount: number;
  initialCheered: boolean;
  onPress: () => Promise<void> | void;
}

export const CheerButton: React.FC<CheerButtonProps> = ({
  initialCount,
  initialCheered,
  onPress,
}) => {
  const [cheered, setCheered] = useState(initialCheered);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const nextCheered = !cheered;
    setCheered(nextCheered);
    setCount(prev => (nextCheered ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await onPress();
    } catch (e) {
      // Revert on error
      setCheered(!nextCheered);
      setCount(prev => (!nextCheered ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.button,
        cheered && styles.buttonCheered,
      ]}
    >
      <Flame
        size={14}
        color={cheered ? Colors.brass : Colors.textMuted}
        fill={cheered ? Colors.brass : 'transparent'}
      />
      {count > 0 && (
        <Text style={[styles.count, cheered && styles.countCheered]}>
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.panel,
  },
  buttonCheered: {
    borderColor: Colors.brass,
    backgroundColor: '#2A2012',
  },
  count: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
  },
  countCheered: {
    color: Colors.brass,
  },
});
