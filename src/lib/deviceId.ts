import { generateUUID } from "./utils";

const DEVICE_ID_KEY = "psc_device_id";

/**
 * Gets the device ID from local storage or generates a new one
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Sets a device ID in local storage
 */
export function setDeviceId(deviceId: string): void {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

/**
 * Checks if the device has an ID already
 */
export function hasDeviceId(): boolean {
  return !!localStorage.getItem(DEVICE_ID_KEY);
}

/**
 * Generates a fingerprint based on available browser properties
 * This can be used as a backup or additional identifier
 */
export function generateBrowserFingerprint(): string {
  const navigator = window.navigator;
  const screen = window.screen;

  // Collect browser information that's reasonably stable
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
  ];

  // Use canvas fingerprinting technique
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;

      // Draw text with specific properties
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("PasteShareCopy", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("PasteShareCopy", 4, 17);

      const dataUrl = canvas.toDataURL();
      components.push(dataUrl);
    }
  } catch (e) {
    // Canvas fingerprinting might fail in some environments
    console.warn("Canvas fingerprinting failed", e);
  }

  // Create a string from all components and hash it
  const fingerprint = components.join("###");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to a readable string (base36)
  return Math.abs(hash).toString(36);
}
