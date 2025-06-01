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
  isPasswordProtected?: boolean;
  password?: string;
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
    isPasswordProtected: boolean;
    canEdit: boolean;
    createdBy: string;
  };
}

export interface UpdateSnippetRequest {
  snippetId: string;
  code: string;
  language?: string;
  title?: string;
  password?: string;
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
  shortUrl: string,
  password?: string
): Promise<GetSnippetResponse> => {
  try {
    const deviceId = getDeviceId();
    const getSnippetFn = httpsCallable(functions, "get_snippet");

    const requestData: any = {
      shortUrl,
      deviceId,
    };

    if (password) {
      requestData.password = password;
    }

    const result = await getSnippetFn(requestData);
    return result.data as GetSnippetResponse;
  } catch (error: unknown) {
    console.error("Error getting snippet:", error);

    // Handle specific Firebase function errors
    if (isFirebaseError(error)) {
      if (error.code === "functions/not-found") {
        throw new Error("Snippet not found or has expired");
      } else if (error.code === "functions/permission-denied") {
        // Check if it's a password-related error
        const errorMessage = error.message || "";
        if (errorMessage.includes("password")) {
          throw new Error(errorMessage);
        }
        throw new Error("Access denied to this snippet");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to get snippet";
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
  isPasswordProtected: boolean;
  hasPassword?: boolean;
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
    const deviceId = getDeviceId();
    const updateSnippetFn = httpsCallable(functions, "update_snippet");

    const requestData = {
      ...data,
      deviceId,
    };

    const result = await updateSnippetFn(requestData);
    return result.data;
  } catch (error: unknown) {
    console.error("Error updating snippet:", error);

    // Handle specific Firebase function errors
    if (isFirebaseError(error)) {
      if (error.code === "functions/not-found") {
        throw new Error("Snippet not found");
      } else if (error.code === "functions/permission-denied") {
        const errorMessage = error.message || "";
        if (errorMessage.includes("password")) {
          throw new Error(errorMessage);
        }
        throw new Error("You don't have permission to edit this snippet");
      } else if (error.code === "functions/unauthenticated") {
        throw new Error("Authentication required to edit snippets");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update snippet";
    throw new Error(errorMessage);
  }
};

// Game API functions
export interface SubmitGameScoreRequest {
  score: number;
  gameSessionId?: string;
  duration?: number;
  collectiblesFound?: number;
  maxComboMultiplier?: number;
}

export interface SubmitGameScoreResponse {
  success: boolean;
  gameSessionId: string;
  previousGamePoints: number;
  currentGamePoints: number;
  scoreAdded: number;
  previousDailyLimit: number;
  newDailyLimit: number;
  additionalLinksEarned: number;
  totalAvailableLinks: number;
  newlyUnlocked: Array<{
    tier: number;
    points: number;
    reward: string;
    psychologyType: string;
    extraLinks: number;
  }>;
  milestones: Array<{
    tier: number;
    points: number;
    extraLinks: number;
    reward: string;
    psychologyType: string;
    urgency: string;
    achieved: boolean;
  }>;
}

export interface GameStatsResponse {
  success: boolean;
  currentGamePoints: number;
  currentDailyLimit: number;
  totalSessions: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  totalCollectibles: number;
  bestComboMultiplier: number;
  recentSessions: Array<{
    sessionId: string;
    score: number;
    duration?: number;
    collectiblesFound: number;
    maxComboMultiplier: number;
    additionalLinksEarned: number;
    createdAt?: string;
  }>;
  nextMilestone?: {
    tier: number;
    points: number;
    extraLinks: number;
    reward: string;
    psychologyType: string;
    urgency: string;
    progress: number;
    remaining: number;
  };
  achievementsUnlocked: Array<{
    tier: number;
    points: number;
    reward: string;
    psychologyType: string;
    extraLinks: number;
  }>;
  totalAchievements: number;
  availableAchievements: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: Array<{
    rank: number;
    displayName: string;
    gamePoints: number;
    dailyLimit: number;
    isAuthenticated: boolean;
  }>;
  totalEntries: number;
}

export interface AchievementProgressResponse {
  success: boolean;
  currentGamePoints: number;
  currentDailyLimit: number;
  achievements: Array<{
    tier: number;
    points: number;
    extraLinks: number;
    reward: string;
    psychologyType: string;
    urgency: string;
    achieved: boolean;
    isNext: boolean;
    progress: number;
    remaining: number;
  }>;
  totalAchieved: number;
  totalAvailable: number;
}

export interface PlatformStatsResponse {
  success: boolean;
  pastesCreated: string;
  dailyUsers: string;
  languages: number;
  uptime: number;
  linksToday: number;
  viewsToday: string;
  totalShares: string;
  lastUpdated: string;
  error?: string;
}

export interface PlatformInsightsResponse {
  success: boolean;
  topLanguages: Array<{
    name: string;
    count: number;
  }>;
  weeklyTrend: Record<string, number>;
  totalLanguages: number;
  lastUpdated: string;
  error?: string;
}

export const submitGameScore = async (
  scoreData: SubmitGameScoreRequest
): Promise<SubmitGameScoreResponse> => {
  try {
    const deviceId = getDeviceId();
    const submitGameScoreFn = httpsCallable(functions, "submit_game_score");

    const requestData = {
      ...scoreData,
      deviceId,
    };

    const result = await submitGameScoreFn(requestData);
    return result.data as SubmitGameScoreResponse;
  } catch (error: unknown) {
    console.error("Error submitting game score:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/invalid-argument") {
        throw new Error("Invalid game session detected");
      } else if (error.code === "functions/unauthenticated") {
        throw new Error("Authentication or device ID is required");
      } else if (error.code === "functions/not-found") {
        throw new Error("User not found");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit game score";
    throw new Error(errorMessage);
  }
};

export const getGameStats = async (): Promise<GameStatsResponse> => {
  try {
    const deviceId = getDeviceId();
    const getGameStatsFn = httpsCallable(functions, "get_game_stats");

    const result = await getGameStatsFn({
      deviceId,
    });

    return result.data as GameStatsResponse;
  } catch (error: unknown) {
    console.error("Error getting game stats:", error);

    if (isFirebaseError(error)) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("Authentication or device ID is required");
      } else if (error.code === "functions/not-found") {
        throw new Error("User not found");
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve game stats";
    throw new Error(errorMessage);
  }
};

export const getLeaderboard = async (
  limit: number = 10
): Promise<LeaderboardResponse> => {
  try {
    const getLeaderboardFn = httpsCallable(functions, "get_leaderboard");

    const result = await getLeaderboardFn({
      limit,
    });

    return result.data as LeaderboardResponse;
  } catch (error: unknown) {
    console.error("Error getting leaderboard:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve leaderboard";
    throw new Error(errorMessage);
  }
};

export const getAchievementProgress =
  async (): Promise<AchievementProgressResponse> => {
    try {
      const deviceId = getDeviceId();
      const getAchievementProgressFn = httpsCallable(
        functions,
        "get_achievement_progress"
      );

      const result = await getAchievementProgressFn({
        deviceId,
      });

      return result.data as AchievementProgressResponse;
    } catch (error: unknown) {
      console.error("Error getting achievement progress:", error);

      if (isFirebaseError(error)) {
        if (error.code === "functions/unauthenticated") {
          throw new Error("Authentication or device ID is required");
        } else if (error.code === "functions/not-found") {
          throw new Error("User not found");
        }
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve achievement progress";
      throw new Error(errorMessage);
    }
  };

export const getPlatformStats = async (): Promise<PlatformStatsResponse> => {
  try {
    const getPlatformStatsFn = httpsCallable(functions, "get_platform_stats");
    const result = await getPlatformStatsFn({});
    return result.data as PlatformStatsResponse;
  } catch (error: unknown) {
    console.error("Error getting platform stats:", error);

    // Return fallback data if API fails
    return {
      success: false,
      pastesCreated: "1M+",
      dailyUsers: "50K+",
      languages: 100,
      uptime: 99.9,
      linksToday: 158,
      viewsToday: "12.3K",
      totalShares: "4.7M+",
      lastUpdated: new Date().toISOString(),
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch platform stats",
    };
  }
};

export const getPlatformInsights =
  async (): Promise<PlatformInsightsResponse> => {
    try {
      const getPlatformInsightsFn = httpsCallable(
        functions,
        "get_platform_insights"
      );
      const result = await getPlatformInsightsFn({});
      return result.data as PlatformInsightsResponse;
    } catch (error: unknown) {
      console.error("Error getting platform insights:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve platform insights";
      throw new Error(errorMessage);
    }
  };

export interface GetSnippetPasswordResponse {
  success: boolean;
  hasPassword: boolean;
  password?: string;
}

export const getSnippetPassword = async (
  snippetId: string
): Promise<GetSnippetPasswordResponse> => {
  try {
    const deviceId = getDeviceId();
    const getSnippetPasswordFn = httpsCallable(
      functions,
      "get_snippet_password"
    );

    const result = await getSnippetPasswordFn({
      snippetId,
      deviceId,
    });

    return result.data as GetSnippetPasswordResponse;
  } catch (error: unknown) {
    console.error("Error getting snippet password:", error);

    // Handle specific Firebase function errors
    if (isFirebaseError(error)) {
      if (error.code === "functions/not-found") {
        throw new Error("Snippet not found");
      } else if (error.code === "functions/permission-denied") {
        throw new Error(
          "Only the creator can view the password for this snippet"
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to get snippet password";
    throw new Error(errorMessage);
  }
};
