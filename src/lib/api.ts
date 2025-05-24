import { httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { functions } from "./firebase";
import { getDeviceId } from "./deviceId";

// Types
export interface CreateSnippetRequest {
  code: string;
  language: string;
  title?: string;
  expiration: string;
  isConfidential?: boolean;
}

export interface CreateSnippetResponse {
  success: boolean;
  shortUrl: string;
  fullUrl: string;
  snippetId: string;
  expiresAt?: string;
  remainingLinks: number;
}

export interface GetSnippetResponse {
  success: boolean;
  snippet: {
    id: string;
    title: string;
    content: string;
    language: string;
    createdAt: any;
    expiresAt?: any;
    viewCount: number;
    isConfidential: boolean;
    createdBy: string;
  };
}

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
          deviceId: deviceIdToUse,
        },
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

// Snippet API functions
export const createSnippet = async (
  snippetData: CreateSnippetRequest
): Promise<CreateSnippetResponse> => {
  try {
    const deviceId = getDeviceId();
    const createSnippetFn = httpsCallable(functions, "create_snippet");

    const auth = getAuth();
    const currentUser = auth.currentUser;

    const requestData = {
      ...snippetData,
      deviceId,
    };

    const result = await createSnippetFn(requestData);
    return result.data as CreateSnippetResponse;
  } catch (error: any) {
    console.error("Error creating snippet:", error);

    // Handle specific Firebase function errors
    if (error.code === "functions/resource-exhausted") {
      throw new Error(
        "You have reached your snippet limit. Please upgrade to premium for unlimited snippets."
      );
    } else if (error.code === "functions/permission-denied") {
      throw new Error(
        "Confidential snippets are only available for premium users."
      );
    } else if (error.code === "functions/invalid-argument") {
      throw new Error("Invalid snippet data provided.");
    }

    throw new Error(error.message || "Failed to create snippet");
  }
};

export const getSnippet = async (
  shortUrl: string
): Promise<GetSnippetResponse> => {
  try {
    const deviceId = getDeviceId();
    const getSnippetFn = httpsCallable(functions, "get_snippet");

    const result = await getSnippetFn({
      shortUrl,
      deviceId,
    });

    return result.data as GetSnippetResponse;
  } catch (error: any) {
    console.error("Error getting snippet:", error);

    // Handle specific Firebase function errors
    if (error.code === "functions/not-found") {
      throw new Error("Snippet not found or has expired.");
    } else if (error.code === "functions/permission-denied") {
      throw new Error(
        "This snippet is confidential and can only be accessed by its creator."
      );
    }

    throw new Error(error.message || "Failed to retrieve snippet");
  }
};

export const cleanupExpiredSnippets = async () => {
  try {
    const cleanupFn = httpsCallable(functions, "cleanup_expired_snippets");
    const result = await cleanupFn({});
    return result.data;
  } catch (error: any) {
    console.error("Error cleaning up snippets:", error);
    throw new Error(error.message || "Failed to cleanup expired snippets");
  }
};
