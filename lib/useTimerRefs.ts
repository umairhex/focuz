/**
 * Custom hook for managing timer-related refs and state
 */
import { useRef } from "react";

/**
 * Consolidates all timer-related refs into a single hook
 */
export const useTimerRefs = () => {
  const rafRef = useRef<number | null>(null);
  const sessStartRef = useRef<number | null>(null);
  const ivStartRef = useRef<number | null>(null);
  const pauseAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);
  const ivPausedRef = useRef(0);
  const ivCountRef = useRef(0);
  const ivFiredRef = useRef(false);
  const repeatingRef = useRef(true);
  const ivDurationRef = useRef(25 * 60 * 1000);

  /**
   * Resets all timer refs to initial state
   */
  const resetRefs = () => {
    sessStartRef.current = null;
    ivStartRef.current = null;
    pauseAtRef.current = null;
    totalPausedRef.current = 0;
    ivPausedRef.current = 0;
    ivCountRef.current = 0;
    ivFiredRef.current = false;
    repeatingRef.current = true;
    ivDurationRef.current = 25 * 60 * 1000;
  };

  /**
   * Resets interval-specific timing refs
   */
  const resetIntervalTiming = () => {
    ivStartRef.current = null;
    ivPausedRef.current = 0;
    ivFiredRef.current = false;
  };

  return {
    rafRef,
    sessStartRef,
    ivStartRef,
    pauseAtRef,
    totalPausedRef,
    ivPausedRef,
    ivCountRef,
    ivFiredRef,
    repeatingRef,
    ivDurationRef,
    resetRefs,
    resetIntervalTiming,
  };
};
