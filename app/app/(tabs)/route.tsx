import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { api } from '../../services/api';
import { Colors } from '../../constants/colors';
import { Plus, Check, Circle, Clock, Trash2, X } from 'lucide-react-native';

interface Milestone {
  _id: string;
  name: string;
  status: 'done' | 'current' | 'upcoming';
  subLabel: string;
  orderIndex: number;
}

export default function RouteScreen() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'done' | 'current' | 'upcoming'>('upcoming');
  const [subLabel, setSubLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await api.getMilestones();
      setMilestones(res.data.milestones || []);
    } catch (err) {
      console.log('Error fetching milestones:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMilestones();
  };

  const openAddModal = () => {
    setEditingMilestone(null);
    setName('');
    setStatus('upcoming');
    setSubLabel('not started');
    setModalVisible(true);
  };

  const openEditModal = (m: Milestone) => {
    setEditingMilestone(m);
    setName(m.name);
    setStatus(m.status);
    setSubLabel(m.subLabel);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    try {
      setSaving(true);
      if (editingMilestone) {
        await api.updateMilestone(editingMilestone._id, {
          name: name.trim(),
          status,
          subLabel: subLabel.trim() || (status === 'done' ? 'completed' : status === 'current' ? 'in progress' : 'not started'),
        });
      } else {
        await api.createMilestone({
          name: name.trim(),
          status,
          subLabel: subLabel.trim() || (status === 'done' ? 'completed' : status === 'current' ? 'in progress' : 'not started'),
        });
      }
      setModalVisible(false);
      fetchMilestones();
    } catch (err) {
      console.log('Error saving milestone:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMilestone(id);
      setModalVisible(false);
      fetchMilestones();
    } catch (err) {
      console.log('Error deleting milestone:', err);
    }
  };

  const cycleStatus = async (m: Milestone) => {
    const nextStatus: Record<string, 'done' | 'current' | 'upcoming'> = {
      upcoming: 'current',
      current: 'done',
      done: 'upcoming',
    };
    const newStatus = nextStatus[m.status] || 'upcoming';
    const newSubLabel =
      newStatus === 'done' ? 'completed' : newStatus === 'current' ? 'in progress' : 'not started';

    try {
      await api.updateMilestone(m._id, { status: newStatus, subLabel: newSubLabel });
      fetchMilestones();
    } catch (err) {
      console.log('Error updating status:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ROUTE TIMELINE</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Plus size={16} color="#0F1319" />
            <Text style={styles.addBtnText}>ADD STOP</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.brass} />
          </View>
        ) : milestones.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No milestones defined</Text>
            <Text style={styles.emptySubtitle}>
              Plot your team roadmap. Add target release stops, MVP launch, beta testing, etc.
            </Text>
            <TouchableOpacity style={styles.primaryAddBtn} onPress={openAddModal}>
              <Plus size={16} color="#0F1319" />
              <Text style={styles.primaryAddBtnText}>Add First Milestone</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={milestones}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.brass}
              />
            }
            renderItem={({ item, index }) => {
              const isLast = index === milestones.length - 1;
              const isDone = item.status === 'done';
              const isCurrent = item.status === 'current';

              return (
                <View style={styles.timelineRow}>
                  {/* Left: Dot & Connecting Vertical Line */}
                  <View style={styles.dotLineCol}>
                    <TouchableOpacity
                      onPress={() => cycleStatus(item)}
                      style={[
                        styles.dot,
                        isDone && styles.dotDone,
                        isCurrent && styles.dotCurrent,
                      ]}
                    >
                      {isDone && <Check size={10} color="#0F1319" strokeWidth={3} />}
                      {isCurrent && <View style={styles.currentInnerDot} />}
                    </TouchableOpacity>

                    {!isLast && (
                      <View
                        style={[
                          styles.line,
                          isDone && styles.lineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right: Milestone Content Card */}
                  <TouchableOpacity
                    style={[
                      styles.milestoneCard,
                      isCurrent && styles.milestoneCardCurrent,
                    ]}
                    onPress={() => openEditModal(item)}
                  >
                    <View style={styles.cardHeader}>
                      <Text
                        style={[
                          styles.milestoneName,
                          isDone && styles.milestoneNameDone,
                          isCurrent && styles.milestoneNameCurrent,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isDone && styles.statusBadgeDone,
                          isCurrent && styles.statusBadgeCurrent,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isDone && { color: Colors.tealBright },
                            isCurrent && { color: Colors.brass },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.subLabel}>{item.subLabel}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}

        {/* Add / Edit Milestone Modal */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMilestone ? 'Edit Milestone' : 'New Milestone'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>MILESTONE NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. v1.0 Public Beta Release"
                placeholderTextColor={Colors.textFaint}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>STATUS</Text>
              <View style={styles.statusSelectRow}>
                {(['upcoming', 'current', 'done'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[
                      styles.statusSelectBtn,
                      status === s && styles.statusSelectBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        status === s && styles.statusSelectTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>SUB-LABEL / NOTE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. in progress / target: Oct 15"
                placeholderTextColor={Colors.textFaint}
                value={subLabel}
                onChangeText={setSubLabel}
              />

              <View style={styles.modalActions}>
                {editingMilestone && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(editingMilestone._id)}
                  >
                    <Trash2 size={16} color={Colors.tags.blocker} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveBtnText}>Save Milestone</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brass,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  addBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 10,
    color: '#0F1319',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 60,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  dotLineCol: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotDone: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  dotCurrent: {
    borderColor: Colors.brass,
    backgroundColor: '#0F1319',
  },
  currentInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brass,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 44,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: Colors.teal,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 2,
    marginBottom: 16,
  },
  milestoneCardCurrent: {
    borderColor: Colors.brassDim,
    backgroundColor: '#1B212B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneName: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  milestoneNameDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  milestoneNameCurrent: {
    color: Colors.brass,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#0F1319',
  },
  statusBadgeDone: {
    borderColor: Colors.teal,
  },
  statusBadgeCurrent: {
    borderColor: Colors.brass,
  },
  statusBadgeText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 9,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  subLabel: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
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
    marginBottom: 20,
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.brass,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 2,
  },
  primaryAddBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 12,
    color: '#0F1319',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F1319',
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    padding: 10,
    borderRadius: 2,
    marginBottom: 14,
  },
  statusSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statusSelectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#0F1319',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 2,
  },
  statusSelectBtnActive: {
    borderColor: Colors.brass,
    backgroundColor: '#261E10',
  },
  statusSelectText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statusSelectTextActive: {
    color: Colors.brass,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.tags.blocker,
    padding: 12,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.brass,
    paddingVertical: 12,
    borderRadius: 2,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 13,
    color: '#0F1319',
  },
});
