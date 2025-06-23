import { useState, useEffect, useCallback } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  getUserProfile,
  trackAnonymousUser,
  migrateAnonymousUser,
} from "@/lib/api";
import { getDeviceId } from "@/lib/deviceId";

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
  dailyGamePoints?: number;
  availableLinks: number;
  dailyLimit?: number;
  totalLinksCreated: number;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track anonymous user on initial load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // This will initialize a device ID and create an anonymous user if needed
        await trackAnonymousUser();
      } catch (err) {
        console.error("Error tracking anonymous user:", err);
      }
    };

    initializeUser();
  }, []);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Set loading true while fetching profile
      setUser(currentUser);

      try {
        // Get the user profile (works for both anonymous and authenticated users)
        const userProfileData = await getUserProfile();
        setProfile(userProfileData as UserProfile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // After successful authentication, migrate any anonymous content
      try {
        await migrateAnonymousUser();
      } catch (migrateErr) {
        console.error("Error migrating anonymous user:", migrateErr);
      }

      // Get updated profile
      const userProfileData = await getUserProfile();
      setProfile(userProfileData as UserProfile);

      return result.user;
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);

      // After signing out, switch to anonymous profile
      try {
        const anonymousProfileData = await getUserProfile();
        setProfile(anonymousProfileData as UserProfile);
      } catch (profileErr) {
        console.error("Error getting anonymous profile:", profileErr);
      }
    } catch (err) {
      console.error("Error signing out:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign out"
      );
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const userProfileData = await getUserProfile();
      setProfile(userProfileData as UserProfile);
      return userProfileData;
    } catch (err) {
      console.error("Error refreshing user profile:", err);
      throw err;
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshProfile,
    deviceId: getDeviceId(), // Provide deviceId for use in components
  };
}
