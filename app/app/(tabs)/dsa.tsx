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
  Linking,
} from 'react-native';
import { api } from '../../services/api';
import { Colors } from '../../constants/colors';
import { Check, ChevronDown, ChevronRight, GitCommit, ExternalLink, Code2 } from 'lucide-react-native';

interface Problem {
  id: string;
  title: string;
  slug: string;
  category: string;
  step: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  link: string;
  status: 'todo' | 'done';
  completedVia: 'manual' | 'commit_match' | null;
}

interface CategoryGroup {
  name: string;
  step: string;
  total: number;
  done: number;
  problems: Problem[];
}

export default function DsaScreen() {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    '1. Basics': true,
    '3. Arrays': true,
  });

  const fetchDsa = useCallback(async () => {
    try {
      const res = await api.getDsaProblems();
      setCategories(res.data.categories || []);
      setTotalProblems(res.data.totalProblems || 0);
      setCompletedCount(res.data.completedCount || 0);
      setCompletionPercentage(res.data.completionPercentage || 0);
    } catch (err) {
      console.log('Error fetching DSA data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDsa();
  }, [fetchDsa]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDsa();
  };

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const handleToggleProblem = async (problemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';

    // Optimistic update
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        done: cat.problems.some(p => p.id === problemId)
          ? nextStatus === 'done' ? cat.done + 1 : Math.max(0, cat.done - 1)
          : cat.done,
        problems: cat.problems.map(p =>
          p.id === problemId
            ? { ...p, status: nextStatus, completedVia: nextStatus === 'done' ? 'manual' : null }
            : p
        ),
      }))
    );

    setCompletedCount(prev => (nextStatus === 'done' ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await api.updateDsaProgress(problemId, nextStatus);
    } catch (err) {
      // Revert on error
      fetchDsa();
    }
  };

  const openLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DSA PRACTICE TRACKER</Text>
          <Text style={styles.headerSub}>Striver's A2Z Sheet</Text>
        </View>

        {/* Overall Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>PROGRESS OVERALL</Text>
              <Text style={styles.progressCount}>
                {completedCount} <Text style={styles.progressTotal}>/ {totalProblems} solved</Text>
              </Text>
            </View>
            <Text style={styles.progressPercent}>{completionPercentage}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, completionPercentage)}%` },
              ]}
            />
          </View>
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
            {categories.map((cat) => {
              const isExpanded = !!expandedCategories[cat.name];
              const isCatComplete = cat.done === cat.total && cat.total > 0;

              return (
                <View key={cat.name} style={styles.categorySection}>
                  {/* Category Header Row */}
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(cat.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryTitleRow}>
                      {isExpanded ? (
                        <ChevronDown size={16} color={Colors.brass} />
                      ) : (
                        <ChevronRight size={16} color={Colors.textMuted} />
                      )}
                      <Text style={styles.categoryName}>{cat.name}</Text>
                    </View>

                    <View style={styles.categoryRatioBadge}>
                      <Text style={[styles.categoryRatioText, isCatComplete && { color: Colors.tealBright }]}>
                        {cat.done}/{cat.total}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Problems in Category */}
                  {isExpanded && (
                    <View style={styles.problemsList}>
                      {cat.problems.map((prob) => {
                        const isDone = prob.status === 'done';
                        const isCommitMatch = prob.completedVia === 'commit_match';

                        return (
                          <View key={prob.id} style={styles.problemRow}>
                            {/* Checkbox */}
                            <TouchableOpacity
                              style={[
                                styles.checkbox,
                                isDone && styles.checkboxDone,
                              ]}
                              onPress={() => handleToggleProblem(prob.id, prob.status)}
                            >
                              {isDone && <Check size={12} color="#0F1319" strokeWidth={3} />}
                            </TouchableOpacity>

                            {/* Title + Link */}
                            <TouchableOpacity
                              style={styles.problemTitleWrap}
                              onPress={() => openLink(prob.link)}
                            >
                              <Text
                                style={[
                                  styles.problemTitle,
                                  isDone && styles.problemTitleDone,
                                ]}
                                numberOfLines={2}
                              >
                                {prob.title}
                              </Text>
                              {prob.link ? (
                                <ExternalLink size={10} color={Colors.textFaint} style={{ marginLeft: 4 }} />
                              ) : null}
                            </TouchableOpacity>

                            {/* Commit Match indicator vs Difficulty */}
                            <View style={styles.problemMeta}>
                              {isCommitMatch && (
                                <View style={styles.commitBadge}>
                                  <GitCommit size={11} color={Colors.brass} />
                                  <Text style={styles.commitBadgeText}>git</Text>
                                </View>
                              )}

                              <View
                                style={[
                                  styles.difficultyBadge,
                                  prob.difficulty === 'Easy' && styles.diffEasy,
                                  prob.difficulty === 'Medium' && styles.diffMedium,
                                  prob.difficulty === 'Hard' && styles.diffHard,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.difficultyText,
                                    prob.difficulty === 'Easy' && { color: '#6E8B6B' },
                                    prob.difficulty === 'Medium' && { color: Colors.brass },
                                    prob.difficulty === 'Hard' && { color: Colors.tags.blocker },
                                  ]}
                                >
                                  {prob.difficulty[0]}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
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
  headerSub: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
    marginTop: 1,
  },
  progressCard: {
    backgroundColor: Colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  progressCount: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  progressTotal: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },
  progressPercent: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: Colors.tealBright,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#0F1319',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.teal,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  categorySection: {
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#151A22',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryName: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  categoryRatioBadge: {
    backgroundColor: '#0F1319',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  categoryRatioText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
  },
  problemsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  problemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A212B',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#0F1319',
  },
  checkboxDone: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  problemTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  problemTitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  problemTitleDone: {
    color: Colors.textFaint,
    textDecorationLine: 'line-through',
  },
  problemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#261F12',
    borderWidth: 1,
    borderColor: Colors.brassDim,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  commitBadgeText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 9,
    color: Colors.brass,
  },
  difficultyBadge: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffEasy: {
    borderColor: '#3E503E',
    backgroundColor: '#121A12',
  },
  diffMedium: {
    borderColor: Colors.brassDim,
    backgroundColor: '#241B0D',
  },
  diffHard: {
    borderColor: '#542828',
    backgroundColor: '#241010',
  },
  difficultyText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 9,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
