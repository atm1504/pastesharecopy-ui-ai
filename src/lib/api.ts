import { httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { functions } from "./firebase";
import { getDeviceId } from "./deviceId";

// Authentication API functions
export const getUserProfile = async (deviceId?: string) => {
  try {
    const deviceIdToUse = deviceId || getDeviceId();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();

    const response = await fetch("/api/getUserProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // Required for auth-protected Cloud Functions
      },
      body: JSON.stringify({
        data: {
          deviceId: deviceIdToUse
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const trackAnonymousUser = async () => {
  try {
    const deviceId = getDeviceId();

    // Optional: get Firebase Auth token if your Cloud Function requires it
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken() : undefined;

    const response = await fetch("/api/trackAnonymousUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify({
        data: {
          deviceId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to track anonymous user");
    }

    const result = await response.json();
    return result.result || result; // Firebase wraps the return under `result`
  } catch (error) {
    console.error("Error tracking anonymous user:", error);
    throw error;
  }
};


export const migrateAnonymousUser = async () => {
  try {
    const deviceId = getDeviceId();

    const auth = getAuth();
    // Optional: Get ID token if auth is required
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken() : undefined;

    const response = await fetch("/api/migrateAnonymousUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify({
        data: {
          deviceId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to migrate anonymous user");
    }

    const result = await response.json();
    return result.result || result; // Firebase may wrap result under `result`
  } catch (error) {
    console.error("Error migrating anonymous user:", error);
    throw error;
  }
};
