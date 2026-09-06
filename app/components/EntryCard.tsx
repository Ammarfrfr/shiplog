import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { TagPill } from './TagPill';
import { CheerButton } from './CheerButton';
import { GitCommit } from 'lucide-react-native';

export interface EntryItem {
  id: string;
  text: string;
  tag: string;
  source: string;
  commitHash?: string;
  commitUrl?: string;
  cheerCount: number;
  isCheered: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
    githubUsername?: string;
  } | null;
  isOwner?: boolean;
}

interface EntryCardProps {
  entry: EntryItem;
  onCheer: () => Promise<void> | void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onCheer }) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  const userInitials = entry.user?.initials || '??';
  const userName = entry.user?.name || 'Anonymous';
  const avatarColor = entry.user?.avatarColor || Colors.brass;
  const isGitCommit = entry.source === 'github_commit';

  return (
    <View style={styles.card}>
      {/* Top row: Avatar + Name + Tag + Time */}
      <View style={styles.headerRow}>
        <View style={styles.userSection}>
          <View style={[styles.avatar, { borderColor: avatarColor }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>{userInitials}</Text>
          </View>
          <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
        </View>

        <View style={styles.metaSection}>
          <TagPill tag={entry.tag} />
          <Text style={styles.timeText}>{formatTime(entry.createdAt)}</Text>
        </View>
      </View>

      {/* Entry text body */}
      <Text style={styles.entryText}>{entry.text}</Text>

      {/* Footer: Git Commit info (if any) + Cheer button */}
      <View style={styles.footerRow}>
        {isGitCommit ? (
          <View style={styles.gitBadge}>
            <GitCommit size={12} color={Colors.textMuted} />
            <Text style={styles.gitHash}>{entry.commitHash || 'commit'}</Text>
          </View>
        ) : (
          <View />
        )}

        <CheerButton
          initialCount={entry.cheerCount}
          initialCheered={entry.isCheered}
          onPress={onCheer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
    borderRadius: 2, // spec: flat hairline surfaces, no heavy card rounds
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#0F1319',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 10,
  },
  userName: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 13,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
  },
  entryText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gitHash: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
});
