/**
 * Custom hook for state persistence with localStorage
 */
import { useCallback } from "react";

const DB_KEY = "interval_v4";

export interface Settings {
  volume: number;
  soundOn: boolean;
  beepCount: number;
  dark: boolean;
  sndType: string;
  sndFreq: number;
  sndDur: number;
}

export interface LogEntry {
  status: "productive" | "distracted";
  notes: string;
}

export interface NoteEntry {
  id: string;
  content: string;
  timestamp: string;
  sessId?: string;
  iv: number;
}

export interface TodoEntry {
  id: string;
  content: string;
  timestamp: string;
  sessId?: string;
  done: boolean;
  iv: number;
}

export interface Session {
  id: string;
  startTime: string;
  endTime: string | null;
  intervalDuration: number;
  intervalCount: number;
  notes: NoteEntry[];
  todos: TodoEntry[];
  logs: LogEntry[];
  partial: boolean;
  totalDuration?: number;
  avgRating?: number;
}

export interface AppState {
  sessions: Session[];
  active: Session | null;
  settings: Settings;
}

const defaultSettings: Settings = {
  volume: 0.5,
  soundOn: true,
  beepCount: 3,
  dark: false,
  sndType: "sine",
  sndFreq: 880,
  sndDur: 0.45,
};

export const defaultState: AppState = {
  sessions: [],
  active: null,
  settings: defaultSettings,
};

/**
 * Custom hook for managing app state persistence
 */
export const usePersistence = (onStorageError: (msg: string) => void) => {
  /**
   * Loads app state from localStorage
   */
  const loadState = useCallback((): AppState => {
    if (typeof window === "undefined") return defaultState;
    try {
      const d = JSON.parse(localStorage.getItem(DB_KEY) || "");
      if (d && Array.isArray(d.sessions)) return d;
    } catch {}
    return defaultState;
  }, []);

  /**
   * Saves app state to localStorage with error handling
   */
  const saveState = useCallback(
    (newState: AppState) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(newState));
      } catch (e: unknown) {
        const error = e as { name: string };
        if (error.name === "QuotaExceededError") {
          onStorageError("Storage full! Export data first.");
        }
      }
    },
    [onStorageError],
  );

  return { loadState, saveState, DB_KEY };
};
