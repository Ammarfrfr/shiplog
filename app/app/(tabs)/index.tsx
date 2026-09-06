import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors } from '../../constants/colors';
import { EntryCard, EntryItem } from '../../components/EntryCard';
import { LogComposer } from '../../components/LogComposer';
import { Plus, Hash, Filter } from 'lucide-react-native';

const TAG_FILTERS = ['all', 'feature', 'fix', 'design', 'research', 'blocker'];

export default function LogScreen() {
  const { team } = useAuth();
  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [composerVisible, setComposerVisible] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.getEntries({
        tag: selectedTag === 'all' ? undefined : selectedTag,
        limit: 100,
      });
      setEntries(res.data.entries || []);
    } catch (err) {
      console.log('Error fetching entries:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const handleCreateEntry = async (data: { text: string; tag: string }) => {
    const res = await api.createEntry(data);
    if (res.data?.entry) {
      setEntries(prev => [res.data.entry, ...prev]);
    }
  };

  const handleCheer = async (entryId: string) => {
    await api.toggleCheer(entryId);
  };

  // Group entries by day heading ("TODAY", "YESTERDAY", "AUG 24, 2026")
  const getDayHeading = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'TODAY';
    if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).toUpperCase();
  };

  // Grouping list with headers
  const groupedList: Array<{ type: 'header' | 'item'; key: string; data?: any; heading?: string }> = [];
  let currentHeading = '';

  entries.forEach((entry) => {
    const heading = getDayHeading(entry.createdAt);
    if (heading !== currentHeading) {
      currentHeading = heading;
      groupedList.push({ type: 'header', key: `header-${heading}`, heading });
    }
    groupedList.push({ type: 'item', key: entry.id, data: entry });
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.teamName}>{team?.name || 'Shiplog'}</Text>
            <View style={styles.codeBadge}>
              <Hash size={10} color={Colors.brass} />
              <Text style={styles.codeText}>{team?.code || 'ROOM'}</Text>
            </View>
          </View>
        </View>

        {/* Tag Filter Selector */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TAG_FILTERS}
            keyExtractor={item => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isSelected = selectedTag === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedTag(item)}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Feed List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.brass} />
          </View>
        ) : groupedList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to log what you worked on today!
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedList}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.feedContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.brass}
              />
            }
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayHeaderText}>{item.heading}</Text>
                    <View style={styles.dayHeaderLine} />
                  </View>
                );
              }
              return (
                <EntryCard
                  entry={item.data}
                  onCheer={() => handleCheer(item.data.id)}
                />
              );
            }}
          />
        )}

        {/* Floating Action Button (+) */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setComposerVisible(true)}
        >
          <Plus size={24} color="#0F1319" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Log Composer Modal */}
        <LogComposer
          visible={composerVisible}
          onClose={() => setComposerVisible(false)}
          onSubmit={handleCreateEntry}
        />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  teamName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  codeText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: Colors.brass,
    letterSpacing: 1,
  },
  filterRow: {
    backgroundColor: Colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#0F1319',
  },
  filterChipActive: {
    borderColor: Colors.brass,
    backgroundColor: '#271F11',
  },
  filterChipText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'lowercase',
  },
  filterChipTextActive: {
    color: Colors.brass,
  },
  feedContent: {
    padding: 16,
    paddingBottom: 90,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
    gap: 10,
  },
  dayHeaderText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  dayHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.brass,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
