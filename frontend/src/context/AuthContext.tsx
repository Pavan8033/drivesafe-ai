import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import type { UserProfile } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (name?: string, email?: string) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'drivesafe_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Driver',
            photoURL: fbUser.photoURL,
            isDemoUser: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Check for saved demo user session in local storage
      const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Please use "Continue in Demo Mode" or configure .env credentials.',
      };
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, error: msg };
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Please use "Continue in Demo Mode" or configure .env credentials.',
      };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Google Sign-In requires active Firebase credentials.',
      };
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      return { success: false, error: msg };
    }
  };

  const loginAsDemoUser = (name = 'Lord Sterling', email = 'sterling@drivesafe.luxury') => {
    const demoProfile: UserProfile = {
      uid: 'demo_driver_001',
      displayName: name,
      email: email,
      isDemoUser: true,
      createdAt: new Date().toISOString(),
    };
    setUser(demoProfile);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoProfile));
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Password reset requires active Firebase service.',
      };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemoUser,
        resetPassword,
        signOut,
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
