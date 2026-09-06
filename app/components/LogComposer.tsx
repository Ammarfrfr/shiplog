import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { X } from 'lucide-react-native';

interface LogComposerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; tag: string }) => Promise<void>;
}

const TAGS = [
  { key: 'feature', label: 'feature', color: Colors.tags.feature },
  { key: 'fix', label: 'fix', color: Colors.tags.fix },
  { key: 'design', label: 'design', color: Colors.tags.design },
  { key: 'research', label: 'research', color: Colors.tags.research },
  { key: 'blocker', label: 'blocker', color: Colors.tags.blocker },
];

export const LogComposer: React.FC<LogComposerProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState('feature');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    try {
      setSubmitting(true);
      await onSubmit({ text: text.trim(), tag: selectedTag });
      setText('');
      setSelectedTag('feature');
      onClose();
    } catch (e) {
      console.log('Error creating entry:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheet}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Log Progress</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Tag Picker */}
              <View style={styles.tagRow}>
                {TAGS.map(t => {
                  const isSelected = selectedTag === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => setSelectedTag(t.key)}
                      style={[
                        styles.tagOption,
                        isSelected && { borderColor: t.color, backgroundColor: '#212833' },
                      ]}
                    >
                      <View style={[styles.tagDot, { backgroundColor: t.color }]} />
                      <Text
                        style={[
                          styles.tagText,
                          isSelected && { color: t.color, fontFamily: 'IBMPlexMono_600SemiBold' },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Text Area */}
              <TextInput
                style={styles.input}
                placeholder="What did you ship or work on today?"
                placeholderTextColor={Colors.textFaint}
                multiline
                numberOfLines={4}
                value={text}
                onChangeText={setText}
                autoFocus
                textAlignVertical="top"
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!text.trim() || submitting) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!text.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#0F1319" />
                ) : (
                  <Text style={styles.submitBtnText}>Log it</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.panel,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#12171F',
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tagText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: '#0F1319',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: 12,
    color: Colors.textPrimary,
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    minHeight: 110,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: Colors.brass,
    paddingVertical: 13,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 14,
    color: '#0F1319',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
