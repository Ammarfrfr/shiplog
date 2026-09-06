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
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors } from '../../constants/colors';
import { Flame, BellRing, Share2, GitBranch, LogOut, CheckCircle2, Link2 } from 'lucide-react-native';

interface MemberItem {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  githubUsername?: string;
  lastActive?: string;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  isCurrentUser: boolean;
}

export default function CrewScreen() {
  const { team, logout, refreshProfile, user } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nudgedUserIds, setNudgedUserIds] = useState<Record<string, boolean>>({});
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [syncingCommits, setSyncingCommits] = useState(false);

  const fetchCrew = useCallback(async () => {
    try {
      const res = await api.getCrew();
      setMembers(res.data.members || []);
    } catch (err) {
      console.log('Error fetching crew:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchCrew();
    refreshProfile();
    if (user?.githubUsername) {
      try {
        await api.syncGithubCommits();
      } catch (e) {}
    }
  };

  const handleSyncCommits = async () => {
    try {
      setSyncingCommits(true);
      const res = await api.syncGithubCommits();
      Alert.alert('⚡ GitHub Sync', res.data.message || 'Commits synced successfully!');
      fetchCrew();
    } catch (err: any) {
      Alert.alert('GitHub Sync', err.response?.data?.message || 'Could not sync commits');
    } finally {
      setSyncingCommits(false);
    }
  };

  const handleConnectGithub = async () => {
    try {
      setConnectingGithub(true);
      const res = await api.getGithubAuthUrl();
      if (res.data?.authUrl) {
        Linking.openURL(res.data.authUrl);
      }
    } catch (err: any) {
      Alert.alert(
        'GitHub Auth',
        err.response?.data?.message || 'Could not initiate GitHub connection. Check backend .env.'
      );
    } finally {
      setConnectingGithub(false);
    }
  };

  const handleNudge = async (member: MemberItem) => {
    try {
      setNudgedUserIds(prev => ({ ...prev, [member.id]: true }));
      const res = await api.sendNudge(member.id);
      Alert.alert('⚡ Nudge Sent!', res.data.message || `Nudged ${member.name}`);

      setTimeout(() => {
        setNudgedUserIds(prev => ({ ...prev, [member.id]: false }));
      }, 5000);
    } catch (err: any) {
      setNudgedUserIds(prev => ({ ...prev, [member.id]: false }));
      Alert.alert('Nudge', err.response?.data?.message || 'Could not send nudge');
    }
  };

  const handleShareInvite = async () => {
    if (!team) return;
    try {
      await Share.share({
        message: `Join our dev crew on Shiplog! Use team invite code: ${team.code}`,
      });
    } catch (e) {}
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return 'offline';
    const diffMin = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
    if (diffMin < 5) return 'online now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CREW & ACCOUNTS</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Team Invite Banner */}
        <View style={styles.inviteBanner}>
          <View>
            <Text style={styles.inviteTitle}>TEAM CODE</Text>
            <Text style={styles.inviteCode}>{team?.code || '------'}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareInvite}>
            <Share2 size={14} color="#0F1319" />
            <Text style={styles.shareBtnText}>INVITE CREW</Text>
          </TouchableOpacity>
        </View>

        {/* GitHub Connection Banner */}
        <View style={styles.githubBanner}>
          <View style={styles.githubBannerLeft}>
            <GitBranch size={16} color={user?.githubUsername ? Colors.tealBright : Colors.brass} />
            <View>
              <Text style={styles.githubBannerTitle}>
                {user?.githubUsername ? `Connected @${user.githubUsername}` : 'Connect GitHub Account'}
              </Text>
              <Text style={styles.githubBannerSub}>
                {user?.githubUsername ? 'Commits auto-logged & auto-ticked in DSA' : 'Auto-log commits & auto-tick DSA problems'}
              </Text>
            </View>
          </View>

          <View style={styles.githubActionGroup}>
            {user?.githubUsername && (
              <TouchableOpacity
                style={styles.syncBtn}
                onPress={handleSyncCommits}
                disabled={syncingCommits}
              >
                {syncingCommits ? (
                  <ActivityIndicator size="small" color={Colors.brass} />
                ) : (
                  <Text style={styles.syncBtnText}>SYNC COMMITS</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.githubBtn, user?.githubUsername && styles.githubBtnConnected]}
              onPress={handleConnectGithub}
              disabled={connectingGithub}
            >
              {connectingGithub ? (
                <ActivityIndicator size="small" color="#0F1319" />
              ) : (
                <Text style={[styles.githubBtnText, user?.githubUsername && styles.githubBtnTextConnected]}>
                  {user?.githubUsername ? 'RECONNECT' : 'CONNECT'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.brass} />
          </View>
        ) : (
          <FlatList
            data={members}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.brass}
              />
            }
            renderItem={({ item }) => {
              const isNudged = !!nudgedUserIds[item.id];
              return (
                <View style={styles.memberCard}>
                  {/* Avatar + Info */}
                  <View style={styles.memberLeft}>
                    <View style={[styles.avatar, { borderColor: item.avatarColor || Colors.brass }]}>
                      <Text style={[styles.avatarText, { color: item.avatarColor || Colors.brass }]}>
                        {item.initials}
                      </Text>
                    </View>

                    <View style={styles.infoCol}>
                      <View style={styles.nameRow}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        {item.isCurrentUser && <Text style={styles.youBadge}>(you)</Text>}
                      </View>

                      <View style={styles.metaRow}>
                        <View style={styles.streakBadge}>
                          <Flame size={12} color={Colors.brass} />
                          <Text style={styles.streakText}>{item.currentStreak}d streak</Text>
                        </View>
                        <Text style={styles.activeDot}>•</Text>
                        <Text style={styles.lastActiveText}>{formatLastActive(item.lastActive)}</Text>
                      </View>

                      {item.githubUsername && (
                        <View style={styles.githubTag}>
                          <GitBranch size={10} color={Colors.textMuted} />
                          <Text style={styles.githubText}>@{item.githubUsername}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Nudge Button */}
                  {!item.isCurrentUser && (
                    <TouchableOpacity
                      style={[
                        styles.nudgeBtn,
                        isNudged && styles.nudgeBtnSuccess,
                      ]}
                      onPress={() => handleNudge(item)}
                      disabled={isNudged}
                    >
                      {isNudged ? (
                        <>
                          <CheckCircle2 size={13} color={Colors.tealBright} />
                          <Text style={styles.nudgeSuccessText}>Nudged!</Text>
                        </>
                      ) : (
                        <>
                          <BellRing size={13} color={Colors.brass} />
                          <Text style={styles.nudgeBtnText}>NUDGE</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
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
  logoutBtn: {
    padding: 6,
  },
  inviteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inviteTitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 9,
    color: Colors.textFaint,
    letterSpacing: 1,
  },
  inviteCode: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 16,
    color: Colors.brass,
    letterSpacing: 2,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.brass,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
  },
  shareBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: '#0F1319',
    letterSpacing: 0.5,
  },
  githubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121720',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  githubBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  githubBannerTitle: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 12,
    color: Colors.textPrimary,
  },
  githubBannerSub: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: Colors.textFaint,
    marginTop: 1,
  },
  githubActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncBtn: {
    borderWidth: 1,
    borderColor: Colors.brass,
    backgroundColor: '#261F12',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 2,
  },
  syncBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 9,
    color: Colors.brass,
  },
  githubBtn: {
    backgroundColor: Colors.brass,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
  },
  githubBtnConnected: {
    backgroundColor: '#122621',
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  githubBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 10,
    color: '#0F1319',
  },
  githubBtnTextConnected: {
    color: Colors.tealBright,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 2,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    backgroundColor: '#0F1319',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 13,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  youBadge: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 11,
    color: Colors.brass,
  },
  activeDot: {
    color: Colors.textFaint,
    fontSize: 10,
  },
  lastActiveText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
  },
  githubTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  githubText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 10,
    color: Colors.textMuted,
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.brass,
    backgroundColor: '#261F12',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 2,
  },
  nudgeBtnSuccess: {
    borderColor: Colors.teal,
    backgroundColor: '#122621',
  },
  nudgeBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: Colors.brass,
    letterSpacing: 0.5,
  },
  nudgeSuccessText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 11,
    color: Colors.tealBright,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
