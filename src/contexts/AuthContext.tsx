import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "firebase/auth";

interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  subscription?: {
    plan: string;
    validUntil?: string;
  };
  gamePoints: number;
  availableLinks: number;
  dailyLimit?: number;
  totalLinksCreated: number;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  deviceId: string;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
