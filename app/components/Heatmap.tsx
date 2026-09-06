import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export interface HeatmapDay {
  date: string;
  count: number;
  intensity: number; // 0 to 4
  dayOfWeek: number;
  isFuture: boolean;
}

interface HeatmapProps {
  weeks: HeatmapDay[][];
  totalEntries?: number;
}

const CELL_SIZE = 14;
const CELL_GAP = 3;

export const Heatmap: React.FC<HeatmapProps> = ({ weeks, totalEntries }) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Ledger</Text>
        {totalEntries !== undefined && (
          <Text style={styles.subtitle}>{totalEntries} contributions</Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.gridContainer}>
          {/* Day of week labels */}
          <View style={styles.dayLabels}>
            {daysOfWeek.map((day, idx) => (
              <Text key={idx} style={styles.dayLabelText}>
                {idx % 2 === 1 ? day : ''}
              </Text>
            ))}
          </View>

          {/* Weeks columns */}
          <View style={styles.weeksContainer}>
            {weeks.map((week, wIndex) => (
              <View key={wIndex} style={styles.weekColumn}>
                {week.map((day, dIndex) => {
                  const color = day.isFuture
                    ? '#0B0E13'
                    : Colors.heatmap[day.intensity] || Colors.heatmap[0];
                  return (
                    <View
                      key={dIndex}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: color,
                          borderColor: day.isFuture ? '#151921' : Colors.borderSubtle,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={styles.legendBoxes}>
          {Colors.heatmap.map((color, idx) => (
            <View
              key={idx}
              style={[
                styles.legendCell,
                { backgroundColor: color, borderColor: Colors.borderSubtle },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    borderRadius: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  scroll: {
    paddingVertical: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabels: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 6,
    paddingTop: 1,
    height: 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP,
  },
  dayLabelText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    color: Colors.textFaint,
    height: CELL_SIZE,
    lineHeight: CELL_SIZE,
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    borderWidth: 0.5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 12,
  },
  legendText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: Colors.textFaint,
  },
  legendBoxes: {
    flexDirection: 'row',
    gap: 3,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 1,
    borderWidth: 0.5,
  },
});
