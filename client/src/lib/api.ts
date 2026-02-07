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
 * True only when explicitly standalone (e.g. Netlify with no backend).
 * Set VITE_STANDALONE=true on Netlify to use localStorage; otherwise we use the API
 * (same-origin when VITE_API_URL is unset, so content extraction works locally).
 */
export function isStandalone(): boolean {
  return import.meta.env.VITE_STANDALONE === "true" || import.meta.env.VITE_STANDALONE === true;
}
