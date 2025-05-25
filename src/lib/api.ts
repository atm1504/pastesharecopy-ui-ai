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

// Type for handling various timestamp formats from Firestore
export type TimestampType = Date | { seconds: number } | string | number | null;

export interface GetSnippetResponse {
  success: boolean;
  snippet: {
    id: string;
    title: string;
    content: string;
    language: string;
    createdAt: TimestampType;
    expiresAt?: TimestampType;
    viewCount: number;
    isConfidential: boolean;
    createdBy: string;
  };
}

export interface UpdateSnippetRequest {
  snippetId: string;
  code: string;
  language?: string;
  title?: string;
}

// Type for Firebase function errors
interface FirebaseError extends Error {
  code?: string;
  details?: unknown;
}

// Type guard to check if error is a Firebase error
function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    error instanceof Error &&
    typeof (error as FirebaseError).code !== "undefined"
  );
}

// Authentication API functions
export const getUserProfile = async (deviceId?: string) => {
  try {
    const deviceIdToUse = deviceId || getDeviceId();
    const getUserProfileFn = httpsCallable(functions, "get_user_profile");

    const result = await getUserProfileFn({
      deviceId: deviceIdToUse,
    });

    return result.data;
  } catch (error: unknown) {
    console.error("Error getting user profile:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("Authentication or device identification is required.");
      } else if (error.code === "functions/not-found") {
        throw new Error(
          "User profile not found. Please register device first."
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to get user profile";
    throw new Error(errorMessage);
  }
};

export const trackAnonymousUser = async () => {
  try {
    const deviceId = getDeviceId();
    const trackAnonymousUserFn = httpsCallable(
      functions,
      "track_anonymous_user"
    );

    const result = await trackAnonymousUserFn({
      deviceId,
    });

    return result.data;
  } catch (error: unknown) {
    console.error("Error tracking anonymous user:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/invalid-argument") {
        throw new Error("Device ID is required to track anonymous user.");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to track anonymous user";
    throw new Error(errorMessage);
  }
};

export const migrateAnonymousUser = async () => {
  try {
    const deviceId = getDeviceId();
    const migrateAnonymousUserFn = httpsCallable(
      functions,
      "migrate_anonymous_user"
    );

    const result = await migrateAnonymousUserFn({
      deviceId,
    });

    return result.data;
  } catch (error: unknown) {
    console.error("Error migrating anonymous user:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/invalid-argument") {
        throw new Error("Device ID is required to migrate anonymous user.");
      } else if (error.code === "functions/unauthenticated") {
        throw new Error(
          "Authentication is required to migrate anonymous user."
        );
      }
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to migrate anonymous user";
    throw new Error(errorMessage);
  }
};

// Snippet API functions
export const createSnippet = async (
  snippetData: CreateSnippetRequest
): Promise<CreateSnippetResponse> => {
  try {
    const deviceId = getDeviceId();
    const createSnippetFn = httpsCallable(functions, "create_snippet");

    const requestData = {
      ...snippetData,
      deviceId,
    };

    const result = await createSnippetFn(requestData);
    return result.data as CreateSnippetResponse;
  } catch (error: unknown) {
    console.error("Error creating snippet:", error);

    // Handle specific Firebase function errors
    if (isFirebaseError(error)) {
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
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create snippet";
    throw new Error(errorMessage);
  }
};

export const getSnippet = async (
  shortUrl: string
): Promise<GetSnippetResponse> => {
  try {
    const deviceId = getDeviceId();
    const getSnippetFn = httpsCallable(functions, "get_snippet");

    console.log("Calling get_snippet function with:", { shortUrl, deviceId });

    const result = await getSnippetFn({
      shortUrl,
      deviceId,
    });

    console.log("Raw function result:", result);
    console.log("Result data:", result.data);

    // Validate the response structure
    if (!result.data) {
      throw new Error("No data received from server");
    }

    const response = result.data as GetSnippetResponse;

    if (!response.success) {
      throw new Error("Server returned unsuccessful response");
    }

    if (!response.snippet) {
      throw new Error("No snippet data in response");
    }

    console.log("Parsed snippet:", response.snippet);
    return response;
  } catch (error: unknown) {
    console.error("Error getting snippet:", error);

    if (isFirebaseError(error)) {
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // Handle specific Firebase function errors
      if (error.code === "functions/not-found") {
        throw new Error("Snippet not found or has expired.");
      } else if (error.code === "functions/permission-denied") {
        throw new Error(
          "This snippet is confidential and can only be accessed by its creator."
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve snippet";
    throw new Error(errorMessage);
  }
};

export const cleanupExpiredSnippets = async () => {
  try {
    const cleanupFn = httpsCallable(functions, "cleanup_expired_snippets");
    const result = await cleanupFn({});
    return result.data;
  } catch (error: unknown) {
    console.error("Error cleaning up snippets:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to cleanup expired snippets";
    throw new Error(errorMessage);
  }
};

// Types for user snippets
export interface UserSnippet {
  id: string;
  shortUrl: string;
  title: string;
  language: string;
  createdAt: string;
  expiresAt?: string;
  lastViewed?: string;
  viewCount: number;
  isConfidential: boolean;
  contentPreview: string;
}

export interface GetUserSnippetsResponse {
  success: boolean;
  snippets: UserSnippet[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

// Types for daily usage
export interface DailyUsageResponse {
  success: boolean;
  userType: "anonymous" | "free" | "premium";
  isLimitedUser: boolean;
  dailyLimit: number; // -1 for unlimited
  usedToday: number;
  remainingToday: number; // -1 for unlimited
  availableLinks: number;
  totalLinksCreated: number;
}

// Get user's snippets with pagination
export const getUserSnippets = async (
  page: number = 1,
  limit: number = 20
): Promise<GetUserSnippetsResponse> => {
  try {
    const deviceId = getDeviceId();
    const getUserSnippetsFn = httpsCallable(functions, "get_user_snippets");

    const result = await getUserSnippetsFn({
      deviceId,
      page,
      limit,
    });

    return result.data as GetUserSnippetsResponse;
  } catch (error: unknown) {
    console.error("Error getting user snippets:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/invalid-argument") {
        throw new Error("Invalid request parameters.");
      } else if (error.code === "functions/unauthenticated") {
        throw new Error("Authentication required to view snippets.");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve snippets";
    throw new Error(errorMessage);
  }
};

// Get daily usage statistics
export const getDailyUsage = async (): Promise<DailyUsageResponse> => {
  try {
    const deviceId = getDeviceId();
    const getDailyUsageFn = httpsCallable(functions, "get_daily_usage");

    const result = await getDailyUsageFn({
      deviceId,
    });

    return result.data as DailyUsageResponse;
  } catch (error: unknown) {
    console.error("Error getting daily usage:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/invalid-argument") {
        throw new Error("Invalid request parameters.");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve daily usage";
    throw new Error(errorMessage);
  }
};

export const updateSnippet = async (data: UpdateSnippetRequest) => {
  try {
    const updateSnippetFn = httpsCallable(functions, "update_snippet");

    const result = await updateSnippetFn(data);
    return result.data as { success: boolean; message: string };
  } catch (error: unknown) {
    console.error("Error updating snippet:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("You must be signed in to edit snippets");
      } else if (error.code === "functions/permission-denied") {
        throw new Error("You can only edit your own snippets");
      } else if (error.code === "functions/not-found") {
        throw new Error("Snippet not found");
      } else if (error.code === "functions/invalid-argument") {
        throw new Error("Invalid snippet data provided.");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update snippet";
    throw new Error(errorMessage);
  }
};
