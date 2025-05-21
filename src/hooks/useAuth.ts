import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
      return null;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign out"
      );
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };
}
