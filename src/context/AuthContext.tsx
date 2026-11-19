'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '@/src/lib/firebase';

export interface DbUserProfile {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
}

interface AuthContextValue {
  firebaseUser: User | null;
  profile: DbUserProfile | null;
  idToken: string | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getFreshToken: () => Promise<string | null>;
  updateProfile: (updates: { name?: string; phone?: string; role?: 'customer' | 'admin' }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbUserProfile | null>(null);
  // Store token strictly in memory (never in localStorage)
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncUserWithBackend = useCallback(async (user: User, token: string) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Failed to sync user profile with PostgreSQL:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          await syncUserWithBackend(user, token);
        } catch (err) {
          console.error('Error retrieving Firebase ID token:', err);
        }
      } else {
        setIdToken(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserWithBackend]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const token = await credential.user.getIdToken();
      setIdToken(token);
      await syncUserWithBackend(credential.user, token);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err.message || 'Sign-in was cancelled or failed.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIdToken(null);
    setProfile(null);
  };

  const getFreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return idToken;
    const token = await auth.currentUser.getIdToken();
    setIdToken(token);
    return token;
  };

  const updateProfile = async (updates: { name?: string; phone?: string; role?: 'customer' | 'admin' }) => {
    const token = await getFreshToken();
    if (!token) throw new Error('You must be signed in to update your profile.');
    const res = await fetch('/api/auth/sync', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to update profile.');
    }
    const data = await res.json();
    setProfile(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        idToken,
        loading,
        authError,
        signInWithGoogle,
        signOut,
        getFreshToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
