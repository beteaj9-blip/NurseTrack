import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setSessionToken } from '../api/axiosConfig';
import { User, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { userId: string; password: string }, beforeCommit?: () => Promise<void>, keepSignedIn?: boolean) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (userToken) {
        setSessionToken(userToken);
        // Verify token by fetching me
        const response = await api.get<User>('/users/me');
        const restoredUser = response.data;
        setUser(restoredUser);
      }
    } catch (e) {
      console.log('Restoring token failed', e);
      setSessionToken(null);
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { userId: string; password: string }, beforeCommit?: () => Promise<void>, keepSignedIn = true) => {
    const response = await api.post<LoginResponse>('/users/login', credentials);
    const { token, user: loggedInUser } = response.data;
    setSessionToken(token);
    if (keepSignedIn) await SecureStore.setItemAsync('userToken', token);
    else await SecureStore.deleteItemAsync('userToken');
    if (beforeCommit) await beforeCommit();
    setUser(loggedInUser);
  };

  const register = async (payload: any) => {
    // The backend /users/register endpoint doesn't return a token natively in the snippet provided earlier,
    // but it creates the user. Wait, UserController.register returns the User object.
    const response = await api.post<User>('/users/register', payload);
    // After register, auto-login
    await login({ userId: payload.schoolId, password: payload.password });
  };

  const logout = async () => {
    setSessionToken(null);
    await SecureStore.deleteItemAsync('userToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
