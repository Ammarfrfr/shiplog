import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface TagPillProps {
  tag: 'feature' | 'fix' | 'design' | 'research' | 'blocker' | string;
  size?: 'sm' | 'md';
}

export const TagPill: React.FC<TagPillProps> = ({ tag, size = 'sm' }) => {
  const safeTag = (tag || 'feature').toLowerCase();
  const tagColor = (Colors.tags as Record<string, string>)[safeTag] || Colors.tags.feature;

  return (
    <View style={[styles.pill, { borderColor: tagColor }, size === 'md' && styles.pillMd]}>
      <View style={[styles.dot, { backgroundColor: tagColor }]} />
      <Text style={[styles.text, { color: tagColor }, size === 'md' && styles.textMd]}>
        {safeTag}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#12171F',
    alignSelf: 'flex-start',
  },
  pillMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  text: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 10,
    textTransform: 'lowercase',
  },
  textMd: {
    fontSize: 12,
  },
});
