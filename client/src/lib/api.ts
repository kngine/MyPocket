/**
 * API base URL for requests. Empty string = same origin (e.g. local dev).
 * Set VITE_API_URL when backend is deployed elsewhere.
 */
const API_BASE = typeof import.meta.env?.VITE_API_URL === "string"
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

/**
 * True when in standalone mode (localStorage).
 * Auto-detects: if in production and no VITE_API_URL is set, assume standalone (Netlify).
 * Can also be forced with VITE_STANDALONE=true.
 */
export function isStandalone(): boolean {
  // Explicit standalone flag
  if (import.meta.env.VITE_STANDALONE === "true" || import.meta.env.VITE_STANDALONE === true) {
    return true;
  }
  // Auto-detect: production build with no API URL = standalone (Netlify)
  if (import.meta.env.PROD && API_BASE === "") {
    return true;
  }
  return false;
}
