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
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { Server } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional backend server URL config modal/field for easy local vs Render switching
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  React.useEffect(() => {
    getApiBaseUrl().then(url => setServerUrl(url));
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const saveServerUrl = async () => {
    if (serverUrl) {
      await setApiBaseUrl(serverUrl);
      setShowServerConfig(false);
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
          <Text style={styles.brandSubtitle}>Team progress ledger & accountability</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F1319" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>ENTER LEDGER</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>New here?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.switchLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backend server config toggle (for switching localhost / render) */}
        <TouchableOpacity
          style={styles.serverToggle}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Server size={14} color={Colors.textFaint} />
          <Text style={styles.serverToggleText}>
            Backend: {serverUrl || 'Default'}
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverConfigCard}>
            <Text style={styles.serverConfigTitle}>API Server URL</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="e.g. https://your-app.onrender.com"
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.secondaryBtn} onPress={saveServerUrl}>
              <Text style={styles.secondaryBtnText}>Save Server URL</Text>
            </TouchableOpacity>
          </View>
        )}
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
    textAlign: 'center',
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
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  serverToggleText: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: Colors.textFaint,
  },
  serverConfigCard: {
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 12,
    borderRadius: 2,
  },
  serverConfigTitle: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  secondaryBtn: {
    backgroundColor: '#202734',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'IBMPlexMono_500Medium',
    fontSize: 12,
    color: Colors.textPrimary,
  },
});
