'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { User } from 'firebase/auth';

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
  ensureAuthInitialized: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

/**
 * Lazy-loaded AuthProvider:
 * Avoids eagerly importing Firebase Auth (~93 KiB + iframe.js) on public landing page load,
 * dramatically improving mobile FCP/LCP and preventing unnecessary third-party network chains.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbUserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const syncUserWithBackend = useCallback(async (user: User, token: string) => {
    if (IS_STATIC_EXPORT) return;
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
    } catch {
      // Gracefully skip profile sync on static deployments
    }
  }, []);

  const ensureAuthInitialized = useCallback(async () => {
    if (initializedRef.current || IS_STATIC_EXPORT) return;
    initializedRef.current = true;
    setLoading(true);
    try {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/src/lib/firebase'),
      ]);
      unsubscribeRef.current = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          try {
            const token = await user.getIdToken();
            setIdToken(token);
            await syncUserWithBackend(user, token);
          } catch {
            // Token fetch skipped
          }
        } else {
          setIdToken(null);
          setProfile(null);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }, [syncUserWithBackend]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (IS_STATIC_EXPORT) {
      setAuthError('Online sign-in is unavailable on static preview. Please book directly via WhatsApp.');
      return;
    }
    try {
      await ensureAuthInitialized();
      const [{ signInWithPopup }, { auth, googleAuthProvider }] = await Promise.all([
        import('firebase/auth'),
        import('@/src/lib/firebase'),
      ]);
      const credential = await signInWithPopup(auth, googleAuthProvider);
      setFirebaseUser(credential.user);
      const token = await credential.user.getIdToken();
      setIdToken(token);
      await syncUserWithBackend(credential.user, token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in was cancelled or failed.';
      setAuthError(message);
    }
  };

  const signOut = async () => {
    if (IS_STATIC_EXPORT) {
      setFirebaseUser(null);
      setIdToken(null);
      setProfile(null);
      return;
    }
    try {
      const [{ signOut: firebaseSignOut }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/src/lib/firebase'),
      ]);
      await firebaseSignOut(auth);
    } finally {
      setFirebaseUser(null);
      setIdToken(null);
      setProfile(null);
    }
  };

  const getFreshToken = async (): Promise<string | null> => {
    if (IS_STATIC_EXPORT) return idToken;
    try {
      const { auth } = await import('@/src/lib/firebase');
      if (!auth.currentUser) return idToken;
      const token = await auth.currentUser.getIdToken();
      setIdToken(token);
      return token;
    } catch {
      return idToken;
    }
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
        ensureAuthInitialized,
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
