import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';
import { Users, Plus } from 'lucide-react-native';

export default function TeamSetupScreen() {
  const router = useRouter();
  const { createTeam, joinTeam, team, user } = useAuth();

  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user already has a team, go to tabs
  React.useEffect(() => {
    if (user?.teamId && team) {
      router.replace('/(tabs)');
    }
  }, [user, team]);

  const handleAction = async () => {
    setError(null);
    try {
      setLoading(true);
      if (mode === 'create') {
        if (!teamName.trim()) {
          setError('Please enter a team name');
          return;
        }
        await createTeam(teamName.trim());
      } else {
        if (!teamCode.trim()) {
          setError('Please enter a 6-character team invite code');
          return;
        }
        await joinTeam(teamCode.trim().toUpperCase());
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>TEAM SETUP</Text>
          <Text style={styles.brandSubtitle}>Collaborate and share progress in one ledger</Text>
        </View>

        {/* Mode Switcher */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'join' && styles.modeTabActive]}
            onPress={() => { setMode('join'); setError(null); }}
          >
            <Users size={14} color={mode === 'join' ? Colors.brass : Colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'join' && styles.modeTabTextActive]}>
              JOIN TEAM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'create' && styles.modeTabActive]}
            onPress={() => { setMode('create'); setError(null); }}
          >
            <Plus size={14} color={mode === 'create' ? Colors.brass : Colors.textMuted} />
            <Text style={[styles.modeTabText, mode === 'create' && styles.modeTabTextActive]}>
              CREATE TEAM
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {mode === 'join' ? (
            <>
              <Text style={styles.cardTitle}>Enter Team Invite Code</Text>
              <Text style={styles.cardDesc}>
                Enter the 6-character invite code shared by your teammate.
              </Text>

              <Text style={styles.inputLabel}>INVITE CODE</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="SHIP24"
                placeholderTextColor={Colors.textFaint}
                value={teamCode}
                onChangeText={(val) => setTeamCode(val.toUpperCase())}
                autoCapitalize="characters"
                maxLength={8}
              />
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Create New Team</Text>
              <Text style={styles.cardDesc}>
                Create a ledger room for your dev crew. An invite code will be generated for your team.
              </Text>

              <Text style={styles.inputLabel}>TEAM / PROJECT NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Core Engine Devs"
                placeholderTextColor={Colors.textFaint}
                value={teamName}
                onChangeText={setTeamName}
                autoCapitalize="words"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleAction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F1319" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'join' ? 'JOIN TEAM LEDGER' : 'CREATE TEAM & CODE'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: Colors.brass,
    letterSpacing: 2,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.brass,
    backgroundColor: '#1E242F',
  },
  modeTabText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
  },
  modeTabTextActive: {
    color: Colors.brass,
    fontFamily: 'IBMPlexMono_600SemiBold',
  },
  card: {
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    borderRadius: 2,
  },
  cardTitle: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#2A1212',
    borderWidth: 1,
    borderColor: Colors.tags.blocker,
    padding: 10,
    marginBottom: 16,
    borderRadius: 2,
  },
  errorText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: '#FF9E9E',
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
    fontSize: 14,
    padding: 12,
    borderRadius: 2,
    marginBottom: 16,
  },
  codeInput: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono_600SemiBold',
    letterSpacing: 4,
    textAlign: 'center',
    color: Colors.brass,
  },
  primaryBtn: {
    backgroundColor: Colors.brass,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
    marginTop: 8,
  },
  primaryBtnText: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 13,
    color: '#0F1319',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
