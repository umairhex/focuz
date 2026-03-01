/**
 * Utility functions for time formatting, HTML escaping, and file operations
 */

/**
 * Formats milliseconds into HH:MM:SS format
 */
export const formatTime = (ms: number, short = false): string => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (short) return (h ? pad(h) + ":" : "") + pad(m) + ":" + pad(sc);
  return pad(h) + ":" + pad(m) + ":" + pad(sc);
};

/**
 * Formats milliseconds into human readable duration (e.g., "2h 30m")
 */
export const formatDuration = (ms: number | null | undefined): string => {
  if (!ms) return "0m";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
};

/**
 * Formats ISO date string to localized format with time
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Formats Date object to locale time string
 */
export const formatTimestamp = (d: Date): string =>
  d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/**
 * Returns current date as YYYY-MM-DD string
 */
export const getDateString = (): string =>
  new Date().toISOString().slice(0, 10);

/**
 * Escapes HTML special characters to prevent XSS
 */
export const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Downloads content as a file with specified name and type
 */
export const downloadFile = (
  content: string,
  name: string,
  type: string,
): void => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
};

/**
 * Extracts keywords from text, filtering out common stop words
 */
export const extractKeywords = (text: string): string[] => {
  if (!text.trim()) return [];
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "in",
    "on",
    "at",
    "to",
    "for",
    "and",
    "or",
    "but",
    "is",
    "was",
    "it",
    "of",
    "with",
    "this",
    "that",
    "i",
    "my",
    "me",
    "we",
  ]);
  return [...new Set(text.toLowerCase().match(/\b\w{4,}\b/g) || [])]
    .filter((w) => !stopWords.has(w))
    .slice(0, 6);
};

/**
 * Checks if target is used in a form field
 */
export const isInFormField = (element: Element | null): boolean => {
  if (!element) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(
    (element as HTMLElement).tagName,
  );
};
