import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, storeToken, getToken, removeToken } from '../services/api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  teamId?: string | null;
  githubUsername?: string | null;
  lastActive?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  memberCount: number;
}

interface AuthContextType {
  user: User | null;
  team: Team | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  joinTeam: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Register push notifications
  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      if (pushToken) {
        await api.updatePushToken(pushToken);
      }
    } catch (e) {
      console.log('Push notification registration skipped in simulator / development');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getMe();
      setUser(res.data.user);
      setTeam(res.data.team);
    } catch (e) {
      console.log('Error refreshing profile:', e);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        const res = await api.getMe();
        setUser(res.data.user);
        setTeam(res.data.team);
        registerForPushNotifications();
      }
    } catch (e) {
      await removeToken();
      setToken(null);
      setUser(null);
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    await storeToken(newToken);
    setToken(newToken);
    setUser(newUser);
    await refreshProfile();
    registerForPushNotifications();
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    const { token: newToken, user: newUser } = res.data;
    await storeToken(newToken);
    setToken(newToken);
    setUser(newUser);
    await refreshProfile();
    registerForPushNotifications();
  };

  const createTeam = async (name: string) => {
    await api.createTeam(name);
    await refreshProfile();
  };

  const joinTeam = async (code: string) => {
    await api.joinTeam(code);
    await refreshProfile();
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
    setTeam(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        team,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        createTeam,
        joinTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
