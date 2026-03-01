/**
 * Custom hook for Web Audio API management
 */
import { useCallback, useRef } from "react";

export interface AudioSettings {
  volume: number;
  soundOn: boolean;
  beepCount: number;
  sndType: string;
  sndFreq: number;
  sndDur: number;
}

export const useAudio = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  /**
   * Gets or creates the Web Audio context
   */
  const getContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const audioContextType = (
        window as unknown as { webkitAudioContext: typeof AudioContext }
      ).webkitAudioContext;
      audioCtxRef.current = new (window.AudioContext || audioContextType)();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Plays a single beep tone with specified parameters
   */
  const playBeep = useCallback(
    (vol: number, type: string, freq: number, dur: number) => {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq || 880;
      osc.type = (type || "sine") as OscillatorType;

      const d = dur || 0.45;
      gain.gain.setValueAtTime(vol || 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + d);
    },
    [getContext],
  );

  /**
   * Plays multiple beep tones in sequence
   */
  const playBeeps = useCallback(
    (settings: AudioSettings) => {
      const gap = (parseFloat(String(settings.sndDur)) || 0.45) * 1000 + 150;
      const count = settings.beepCount || 3;

      for (let i = 0; i < count; i++) {
        setTimeout(
          () =>
            playBeep(
              settings.volume || 0.5,
              settings.sndType || "sine",
              settings.sndFreq || 880,
              parseFloat(String(settings.sndDur)) || 0.45,
            ),
          i * gap,
        );
      }
    },
    [playBeep],
  );

  return { playBeep, playBeeps, getContext, audioCtxRef };
};
