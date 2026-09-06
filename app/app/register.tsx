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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      // Once registered, direct to Team Setup to create or join a room
      router.replace('/team-setup');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
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
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>SHIPLOG</Text>
          <Text style={styles.brandSubtitle}>Join the progress ledger</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>YOUR NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Ammar Shaikh"
            placeholderTextColor={Colors.textFaint}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@team.com"
            placeholderTextColor={Colors.textFaint}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F1319" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>JOIN & CONTINUE</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 32,
  },
  brandTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 32,
    color: Colors.brass,
    letterSpacing: 2,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
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
    fontSize: 20,
    color: Colors.textPrimary,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  switchText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12,
    color: Colors.textFaint,
  },
  switchLink: {
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 12,
    color: Colors.brass,
  },
});
