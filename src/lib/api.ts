import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { getDeviceId } from "./deviceId";

// Authentication API functions
export const getUserProfile = async (deviceId?: string) => {
  try {
    const getUserProfileFn = httpsCallable(functions, "get_user_profile");
    const deviceIdToUse = deviceId || getDeviceId();
    const result = await getUserProfileFn({ deviceId: deviceIdToUse });
    return result.data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const trackAnonymousUser = async () => {
  try {
    const trackAnonymousUserFn = httpsCallable(
      functions,
      "track_anonymous_user"
    );
    const deviceId = getDeviceId();
    const result = await trackAnonymousUserFn({ deviceId });
    return result.data;
  } catch (error) {
    console.error("Error tracking anonymous user:", error);
    throw error;
  }
};

export const migrateAnonymousUser = async () => {
  try {
    const migrateAnonymousUserFn = httpsCallable(
      functions,
      "migrate_anonymous_user"
    );
    const deviceId = getDeviceId();
    const result = await migrateAnonymousUserFn({ deviceId });
    return result.data;
  } catch (error) {
    console.error("Error migrating anonymous user:", error);
    throw error;
  }
};
