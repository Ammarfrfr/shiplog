import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { api } from '../../services/api';
import { Colors } from '../../constants/colors';
import { Heatmap } from '../../components/Heatmap';
import { StatCard } from '../../components/StatCard';
import { Flame, Award, Calendar, Layers } from 'lucide-react-native';

interface CrewMember {
  id: string;
  name: string;
  initials: string;
}

export default function TrackScreen() {
  const [target, setTarget] = useState<string>('team');
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrackData = useCallback(async () => {
    try {
      const [crewRes, statsRes] = await Promise.all([
        api.getCrew(),
        api.getStats(target),
      ]);

      setCrew(crewRes.data.members || []);
      setStats(statsRes.data.stats || {});
      setHeatmap(statsRes.data.heatmap || { weeks: [] });
    } catch (err) {
      console.log('Error fetching track data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [target]);

  useEffect(() => {
    fetchTrackData();
  }, [fetchTrackData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrackData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TRACK & STREAKS</Text>
        </View>

        {/* Segmented Control (Team / Crew Members) */}
        <View style={styles.segmentContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentList}>
            <TouchableOpacity
              onPress={() => setTarget('team')}
              style={[
                styles.segmentBtn,
                target === 'team' && styles.segmentBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  target === 'team' && styles.segmentBtnTextActive,
                ]}
              >
                Team Overview
              </Text>
            </TouchableOpacity>

            {crew.map((member) => {
              const isActive = target === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => setTarget(member.id)}
                  style={[
                    styles.segmentBtn,
                    isActive && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      isActive && styles.segmentBtnTextActive,
                    ]}
                  >
                    {member.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.brass} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.brass}
              />
            }
          >
            {/* Stat Cards Grid */}
            <View style={styles.statsRow}>
              <StatCard
                label="Current Streak"
                value={stats?.currentStreak ?? 0}
                unit="days"
                accent
              />
              <StatCard
                label="Best Streak"
                value={stats?.longestStreak ?? 0}
                unit="days"
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                label="This Month"
                value={stats?.entriesThisMonth ?? 0}
                unit="logs"
              />
              <StatCard
                label="Total Ships"
                value={stats?.totalEntries ?? 0}
                unit="logs"
              />
            </View>

            {/* 14-week Heatmap */}
            <Heatmap
              weeks={heatmap?.weeks || []}
              totalEntries={stats?.totalEntries}
            />

            {/* Motivation Section */}
            <View style={styles.noteCard}>
              <Flame size={18} color={Colors.brass} />
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Consistency Compound</Text>
                <Text style={styles.noteText}>
                  {stats?.currentStreak > 0
                    ? `You're on a ${stats.currentStreak}-day momentum roll! Keep the flame burning.`
                    : 'Ship one log today to spark your team streak.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  segmentContainer: {
    backgroundColor: Colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  segmentList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#0F1319',
  },
  segmentBtnActive: {
    borderColor: Colors.brass,
    backgroundColor: '#261E10',
  },
  segmentBtnText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
  },
  segmentBtnTextActive: {
    color: Colors.brass,
    fontFamily: 'IBMPlexMono_600SemiBold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 2,
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 12,
    color: Colors.brass,
    marginBottom: 2,
  },
  noteText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
