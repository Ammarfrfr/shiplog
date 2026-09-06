import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  accent,
}) => {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, accent && styles.valueAccent]}>
          {value}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    borderRadius: 2,
  },
  cardAccent: {
    borderColor: Colors.brassDim,
  },
  label: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: Colors.textPrimary,
  },
  valueAccent: {
    color: Colors.brass,
  },
  unit: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
  },
});
