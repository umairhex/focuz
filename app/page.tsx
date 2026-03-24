"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Moon,
  Sun,
  Calendar,
  Settings,
  Volume2,
  Check,
  MessageCircle,
  Download,
  Upload,
  Trash2,
  Play,
  Clock,
  Pause,
  Square,
  X,
  AlertTriangle,
  Timer,
} from "lucide-react";
import {
  formatTime,
  formatDuration,
  formatDate,
  formatTimestamp,
  getDateString,
  escapeHtml,
  downloadFile,
  extractKeywords,
  isInFormField,
} from "@/lib/utils";
import { useAudio } from "@/lib/useAudio";
import {
  usePersistence,
  defaultState,
  type AppState,
  type Session,
} from "@/lib/usePersistence";
import { useTimerRefs } from "@/lib/useTimerRefs";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const CIRC = 2 * Math.PI * 118;

interface Note {
  id: string;
  content: string;
  timestamp: string;
  sessId?: string;
  iv: number;
}

interface Todo {
  id: string;
  content: string;
  timestamp: string;
  sessId?: string;
  done: boolean;
  iv: number;
}

const Page = () => {
  /* ═══════════════════════════════════════════════════════════════════════════
     STATE & HOOKS
  ═══════════════════════════════════════════════════════════════════════════ */
  const [state, setState] = useState<AppState>(defaultState);
  const [currentView, setCurrentView] = useState("dashboard");
  const [paused, setPaused] = useState(false);
  const [timerTrigger, setTimerTrigger] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [ivElapsed, setIvElapsed] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onAlt?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  } | null>(null);
  const [pendingRecovery, setPendingRecovery] = useState<AppState | null>(null);
  const [recoveryCanContinue, setRecoveryCanContinue] = useState(false);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  }, []);

  const { playBeep, playBeeps } = useAudio();
  const { loadState, saveState, DB_KEY } = usePersistence(toast);
  const {
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
  } = useTimerRefs();

  /**
   * Toggles theme and updates document state
   */
  const toggleTheme = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        settings: { ...prev.settings, dark: !prev.settings.dark },
      };
      if (typeof document !== "undefined") {
        document.body.classList.toggle("dark", !!newState.settings.dark);
      }
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  /**
   * Tests audio by playing from settings inputs
   */
  const testBeep = useCallback(() => {
    if (typeof document === "undefined") return;
    const v = parseFloat(
      (document.getElementById("vol-slider") as HTMLInputElement)?.value ||
        "0.5",
    );
    const t =
      (document.getElementById("snd-type") as HTMLSelectElement)?.value ||
      "sine";
    const f = parseInt(
      (document.getElementById("snd-freq") as HTMLSelectElement)?.value ||
        "880",
    );
    const d = parseFloat(
      (document.getElementById("snd-dur") as HTMLSelectElement)?.value ||
        "0.45",
    );
    const count = parseInt(
      (document.getElementById("snd-count") as HTMLSelectElement)?.value || "3",
    );
    const gap = d * 1000 + 150;
    for (let i = 0; i < count; i++)
      setTimeout(() => playBeep(v, t, f, d), i * gap);
  }, [playBeep]);

  const updateVolume = useCallback(
    (val: number) => {
      setState((prev) => {
        const newState = {
          ...prev,
          settings: { ...prev.settings, volume: val },
        };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const toggleSound = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        settings: { ...prev.settings, soundOn: !prev.settings.soundOn },
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const saveSoundSettings = useCallback(() => {
    if (typeof document === "undefined") return;
    setState((prev) => {
      const newState = {
        ...prev,
        settings: {
          ...prev.settings,
          sndType:
            (document.getElementById("snd-type") as HTMLSelectElement | null)
              ?.value || "sine",
          sndFreq: parseInt(
            (document.getElementById("snd-freq") as HTMLSelectElement | null)
              ?.value || "880",
          ),
          beepCount: parseInt(
            (document.getElementById("snd-count") as HTMLSelectElement | null)
              ?.value || "3",
          ),
          sndDur: parseFloat(
            (document.getElementById("snd-dur") as HTMLSelectElement | null)
              ?.value || "0.45",
          ),
        },
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  /* ═══════════════════════════════════════════════════════════════════════════
     NOTES & TODOS
  ═══════════════════════════════════════════════════════════════════════════ */
  const addNote = useCallback(() => {
    if (typeof document === "undefined") return;
    const inp = document.getElementById("note-inp") as HTMLTextAreaElement;
    const c = inp?.value?.trim();
    if (!c || !state.active) return;

    setState((prev) => {
      const newState = {
        ...prev,
        active: prev.active
          ? {
              ...prev.active,
              notes: [
                ...(prev.active.notes || []),
                {
                  id: "n" + Date.now(),
                  content: c,
                  timestamp: new Date().toISOString(),
                  sessId: prev.active.id,
                  iv: ivCountRef.current,
                },
              ],
            }
          : null,
      };
      if (inp) inp.value = "";
      saveState(newState);
      return newState;
    });
  }, [state.active, saveState, ivCountRef]);

  const addTodo = useCallback(() => {
    if (typeof document === "undefined") return;
    const inp = document.getElementById("todo-inp") as HTMLTextAreaElement;
    const c = inp?.value?.trim();
    if (!c || !state.active) return;

    setState((prev) => {
      const newState = {
        ...prev,
        active: prev.active
          ? {
              ...prev.active,
              todos: [
                ...(prev.active.todos || []),
                {
                  id: "t" + Date.now(),
                  content: c,
                  timestamp: new Date().toISOString(),
                  sessId: prev.active.id,
                  done: false,
                  iv: ivCountRef.current,
                },
              ],
            }
          : null,
      };
      if (inp) inp.value = "";
      saveState(newState);
      return newState;
    });
  }, [state.active, saveState, ivCountRef]);

  const delNote = useCallback(
    (id: string) => {
      setState((prev) => {
        const newState = {
          ...prev,
          active: prev.active
            ? {
                ...prev.active,
                notes: (prev.active.notes || []).filter((n) => n.id !== id),
              }
            : null,
        };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const delTodo = useCallback(
    (id: string) => {
      setState((prev) => {
        const newState = {
          ...prev,
          active: prev.active
            ? {
                ...prev.active,
                todos: (prev.active.todos || []).filter((t) => t.id !== id),
              }
            : null,
        };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setState((prev) => {
        const newState = {
          ...prev,
          active: prev.active
            ? {
                ...prev.active,
                todos: (prev.active.todos || []).map((t) =>
                  t.id === id ? { ...t, done: !t.done } : t,
                ),
              }
            : null,
        };
        saveState(newState);
        return newState;
      });
    },
    [saveState],
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     SESSIONS
  ═══════════════════════════════════════════════════════════════════════════ */
  const startSession = useCallback(() => {
    if (typeof document === "undefined") return;
    const min =
      parseInt(
        (document.getElementById("setup-min") as HTMLInputElement)?.value ||
          "25",
      ) || 25;
    const sec =
      parseInt(
        (document.getElementById("setup-sec") as HTMLInputElement)?.value ||
          "0",
      ) || 0;
    ivDurationRef.current = (min * 60 + sec) * 1000;
    if (ivDurationRef.current < 5000) {
      toast("Minimum interval is 5 seconds");
      return;
    }

    repeatingRef.current = !!(
      document.getElementById("repeat-toggle") as HTMLElement
    )?.classList.contains("on");
    const sessId = "sess_" + Date.now();
    sessStartRef.current = Date.now();
    ivStartRef.current = Date.now();
    setPaused(false);
    pauseAtRef.current = null;
    totalPausedRef.current = 0;
    ivPausedRef.current = 0;
    ivCountRef.current = 0;
    ivFiredRef.current = false;

    setState((prev) => {
      const newState = {
        ...prev,
        active: {
          id: sessId,
          startTime: new Date().toISOString(),
          endTime: null,
          intervalDuration: ivDurationRef.current,
          intervalCount: 0,
          notes: [],
          todos: [],
          logs: [],
          partial: true,
        },
      };
      saveState(newState);
      return newState;
    });

    setSetupOpen(false);
    setCurrentView("session");
    setTimerTrigger((c) => c + 1);
  }, [
    saveState,
    toast,
    ivDurationRef,
    repeatingRef,
    sessStartRef,
    ivStartRef,
    pauseAtRef,
    totalPausedRef,
    ivPausedRef,
    ivCountRef,
    ivFiredRef,
  ]);

  const endSession = useCallback(() => {
    if (!sessStartRef.current) {
      toast("No active session.");
      return;
    }

    setConfirmModal({
      title: "End Session",
      message: "Save this session and return to the dashboard?",
      confirmLabel: "End & Save",
      danger: false,
      onConfirm: () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        setPaused(false);

        const totalElapsed = sessStartRef.current
          ? Date.now() - sessStartRef.current - totalPausedRef.current
          : 0;

        setState((prev) => {
          const session = prev.active;
          if (!session) return prev;

          const logs = session.logs || [];
          let avgRating: number | undefined;
          if (logs.length) {
            const ok = logs.filter((l) => l.status === "productive").length;
            avgRating = Math.round((ok / logs.length) * 5);
          }

          const newState = {
            ...prev,
            sessions: [
              {
                ...session,
                endTime: new Date().toISOString(),
                totalDuration: totalElapsed,
                partial: false,
                intervalCount: ivCountRef.current,
                avgRating,
              },
              ...prev.sessions,
            ],
            active: null,
          };
          saveState(newState);
          return newState;
        });

        sessStartRef.current = null;
        ivStartRef.current = null;
        toast("Session saved!");
        setCurrentView("dashboard");
        setConfirmModal(null);
      },
    });
  }, [
    saveState,
    toast,
    sessStartRef,
    rafRef,
    totalPausedRef,
    ivCountRef,
    ivStartRef,
  ]);

  const togglePause = useCallback(() => {
    if (paused) {
      if (pauseAtRef.current) {
        const d = Date.now() - pauseAtRef.current;
        totalPausedRef.current += d;
        ivPausedRef.current += d;
      }
      pauseAtRef.current = null;
    } else {
      pauseAtRef.current = Date.now();
    }
    setPaused(!paused);
  }, [paused, pauseAtRef, totalPausedRef, ivPausedRef]);

  const logProd = useCallback(
    (status: "productive" | "distracted") => {
      if (typeof document === "undefined") return;
      const notes =
        (document.getElementById("prod-input") as HTMLTextAreaElement)?.value ||
        "";
      setState((prev) => {
        const newState = {
          ...prev,
          active: prev.active
            ? {
                ...prev.active,
                logs: [
                  ...(prev.active.logs || []),
                  {
                    status,
                    notes,
                    timestamp: new Date().toISOString(),
                    iv: ivCountRef.current,
                  },
                ],
              }
            : null,
        };
        saveState(newState);
        return newState;
      });

      const prodInput = document.getElementById(
        "prod-input",
      ) as HTMLTextAreaElement;
      if (prodInput) prodInput.value = "";

      toast(
        status === "productive"
          ? "Logged as productive!"
          : "Noted. Keep going!",
      );
    },
    [saveState, toast, ivCountRef],
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     EXPORT / IMPORT
  ═══════════════════════════════════════════════════════════════════════════ */
  /**
   * Exports full state as JSON file
   */
  const exportJSON = useCallback(() => {
    downloadFile(
      JSON.stringify({ ...state, exported: new Date().toISOString() }, null, 2),
      `interval-${getDateString()}.json`,
      "application/json",
    );
    toast("JSON exported!");
  }, [state, toast]);

  /**
   * Exports sessions as CSV file
   */
  const exportCSV = useCallback(() => {
    const rows: (string | number)[][] = [
      [
        "ID",
        "Start",
        "End",
        "Duration(min)",
        "Intervals",
        "AvgRating",
        "Notes",
        "Todos",
      ],
    ];
    state.sessions.forEach((s) =>
      rows.push([
        s.id,
        s.startTime,
        s.endTime || "",
        Math.round((s.totalDuration || 0) / 60000),
        s.intervalCount || 0,
        s.avgRating || "",
        (s.notes || []).length,
        (s.todos || []).length,
      ]),
    );
    downloadFile(
      rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n"),
      `interval-${getDateString()}.csv`,
      "text/csv",
    );
    toast("CSV exported!");
  }, [state.sessions, toast]);

  /**
   * Exports sessions as human-readable text file
   */
  const exportText = useCallback(() => {
    let t = `INTERVAL EXPORT — ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
    state.sessions.forEach((s, i) => {
      t += `Session ${i + 1}: ${s.startTime}\nDuration: ${formatDuration(s.totalDuration)} · Intervals: ${s.intervalCount}\n`;
      if (s.notes?.length) {
        t += "Notes:\n";
        s.notes.forEach((n) => {
          t += `  - ${n.content}\n`;
        });
      }
      if (s.todos?.length) {
        t += "Todos:\n";
        s.todos.forEach((n) => {
          t += `  [${n.done ? "x" : " "}] ${n.content}\n`;
        });
      }
      t += "\n";
    });
    downloadFile(t, `interval-${getDateString()}.txt`, "text/plain");
    toast("Text exported!");
  }, [state.sessions, toast]);

  const importData = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const f = ev.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const d = JSON.parse(e.target?.result as string);
          if (!d.sessions || !Array.isArray(d.sessions)) throw new Error("bad");
          const doImport = (merge: boolean) => {
            setState((prev) => {
              let newSessions: Session[];
              if (merge) {
                const ids = new Set(prev.sessions.map((s) => s.id));
                const ns = d.sessions.filter((s: Session) => !ids.has(s.id));
                newSessions = [...prev.sessions, ...ns];
                toast(`Merged ${ns.length} sessions!`);
              } else {
                newSessions = d.sessions;
                toast(`Imported ${d.sessions.length} sessions!`);
              }
              const newState = { ...prev, sessions: newSessions };
              saveState(newState);
              return newState;
            });
          };
          setConfirmModal({
            title: "Import Data",
            message:
              "Merge with your existing sessions, or replace everything?",
            confirmLabel: "Merge",
            cancelLabel: "Overwrite",
            danger: false,
            onConfirm: () => {
              doImport(true);
              setConfirmModal(null);
            },
            onAlt: () => {
              doImport(false);
              setConfirmModal(null);
            },
          });
        } catch {
          toast("Import failed: invalid file");
        }
        ev.target.value = "";
      };
      reader.readAsText(f);
    },
    [saveState, toast],
  );

  const clearAll = useCallback(() => {
    setConfirmModal({
      title: "Clear All Data",
      message:
        "This will permanently delete all sessions, notes, and todos. This cannot be undone.",
      confirmLabel: "Clear Everything",
      danger: true,
      onConfirm: () => {
        setState((prev) => {
          const newState = { ...prev, sessions: [], active: null };
          saveState(newState);
          return newState;
        });
        toast("All data cleared.");
        setConfirmModal(null);
      },
    });
  }, [saveState, toast]);

  /* ═══════════════════════════════════════════════════════════════════════════
     SESSION CRUD
  ═══════════════════════════════════════════════════════════════════════════ */
  const deleteSession = useCallback(
    (id: string) => {
      setConfirmModal({
        title: "Delete Session",
        message: "This session and all its data will be permanently removed.",
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setState((prev) => {
            const newState = {
              ...prev,
              sessions: prev.sessions.filter((s) => s.id !== id),
            };
            saveState(newState);
            return newState;
          });
          toast("Session deleted.");
          setConfirmModal(null);
        },
      });
    },
    [saveState, toast],
  );

  const toggleExpandSession = useCallback((id: string) => {
    setExpandedSession((prev) => (prev === id ? null : id));
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════════
     TIMER LOOP
  ═══════════════════════════════════════════════════════════════════════════ */
  /**
   * Handles interval completion: plays sound, shows done modal, enables repeat
   */
  const onIntervalEnd = useCallback(() => {
    ivCountRef.current++;
    setState((prev) => ({
      ...prev,
      active: prev.active
        ? { ...prev.active, intervalCount: ivCountRef.current }
        : null,
    }));

    if (state.settings.soundOn) {
      playBeeps(state.settings);
    }

    const bo = document.getElementById("beep-overlay");
    if (bo) {
      bo.classList.remove("fire");
      void bo.offsetWidth;
      bo.classList.add("fire");
    }

    const intervalDone = document.getElementById("interval-done");
    if (intervalDone) intervalDone.classList.add("show");

    const prodInput = document.getElementById(
      "prod-input",
    ) as HTMLTextAreaElement;
    if (prodInput) prodInput.value = "";

    if (repeatingRef.current) {
      ivStartRef.current = Date.now();
      ivPausedRef.current = 0;
      ivFiredRef.current = false;
    }
  }, [
    state.settings,
    playBeeps,
    ivCountRef,
    repeatingRef,
    ivStartRef,
    ivPausedRef,
    ivFiredRef,
  ]);

  useEffect(() => {
    if (!sessStartRef.current || paused) return;

    const tick = () => {
      const now = Date.now();
      const totalElapsed = sessStartRef.current
        ? now - sessStartRef.current - totalPausedRef.current
        : 0;
      const ivElapsedValue = ivStartRef.current
        ? now - ivStartRef.current - ivPausedRef.current
        : 0;

      setElapsed(totalElapsed);
      setIvElapsed(ivElapsedValue);

      const pct = Math.min(ivElapsedValue / ivDurationRef.current, 1);
      const offset = CIRC * (1 - pct);

      const ringProg = document.getElementById(
        "ring-prog",
      ) as unknown as SVGCircleElement;
      if (ringProg) ringProg.style.strokeDashoffset = String(offset);

      const nt = document.getElementById("note-ts");
      if (nt) nt.textContent = formatTimestamp(new Date());
      const tt = document.getElementById("todo-ts");
      if (tt) tt.textContent = formatTimestamp(new Date());

      if (!ivFiredRef.current && ivElapsedValue >= ivDurationRef.current) {
        ivFiredRef.current = true;
        onIntervalEnd();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    paused,
    onIntervalEnd,
    sessStartRef,
    totalPausedRef,
    ivStartRef,
    ivPausedRef,
    ivDurationRef,
    ivFiredRef,
    rafRef,
    timerTrigger,
  ]);

  /* ═══════════════════════════════════════════════════════════════════════════
     INITIALIZATION & SETUP
  ═══════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    setIsMounted(true);

    const loaded = loadState();
    setState(loaded);

    if (loaded.active && loaded.active.partial) {
      const age = Date.now() - new Date(loaded.active.startTime).getTime();
      const MAX_CONTINUE_AGE = 5 * 60 * 1000;
      const MAX_RECOVERY_AGE = 24 * 3600 * 1000;
      if (age < MAX_RECOVERY_AGE) {
        setPendingRecovery(loaded);
        setRecoveryCanContinue(age < MAX_CONTINUE_AGE);
      }
    }

    if (typeof document !== "undefined") {
      document.body.classList.toggle("dark", !!loaded.settings?.dark);
    }

    const h = new Date().getHours();
    const greetingEl = document.getElementById("greeting-time");
    if (greetingEl) {
      greetingEl.textContent =
        h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
    }

    const dateEl = document.getElementById("today-date");
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    const volQuick = document.getElementById("vol-quick") as HTMLInputElement;
    const volPct = document.getElementById("vol-pct");
    if (volQuick && volPct) {
      const vol = loaded.settings?.volume ?? 0.5;
      volQuick.value = String(vol);
      volPct.textContent = Math.round(vol * 100) + "%";
    }

    const handleKeydown = (e: KeyboardEvent) => {
      const inField = isInFormField(document.activeElement);
      if (e.code === "Space" && !inField && sessStartRef.current) {
        e.preventDefault();
        togglePause();
      }
      if (e.ctrlKey && e.key === "n" && sessStartRef.current) {
        e.preventDefault();
        switchTab("notes");
        (document.getElementById("note-inp") as HTMLTextAreaElement)?.focus();
      }
      if (e.ctrlKey && e.key === "e" && sessStartRef.current) {
        e.preventDefault();
        endSession();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Syncs settings state to uncontrolled form inputs
   */
  const syncSettings = useCallback(() => {
    const s = state.settings;

    const volSlider = document.getElementById("vol-slider") as HTMLInputElement;
    const volDisp = document.getElementById("vol-disp");
    if (volSlider && volDisp) {
      volSlider.value = String(s.volume ?? 0.5);
      volDisp.textContent = Math.round((s.volume ?? 0.5) * 100) + "%";
    }

    const sndToggle = document.getElementById("snd-toggle");
    if (sndToggle) sndToggle.classList.toggle("on", !!s.soundOn);

    const sndType = document.getElementById("snd-type") as HTMLSelectElement;
    if (sndType && s.sndType) sndType.value = s.sndType;

    const sndFreq = document.getElementById("snd-freq") as HTMLSelectElement;
    if (sndFreq && s.sndFreq) sndFreq.value = String(s.sndFreq);

    const sndCount = document.getElementById("snd-count") as HTMLSelectElement;
    if (sndCount && s.beepCount) sndCount.value = String(s.beepCount);

    const sndDur = document.getElementById("snd-dur") as HTMLSelectElement;
    if (sndDur && s.sndDur) sndDur.value = String(s.sndDur);

    const darkToggle = document.getElementById("dark-toggle");
    if (darkToggle) darkToggle.classList.toggle("on", !!s.dark);
  }, [state.settings]);

  /**
   * Updates storage usage display with current DB size and session count
   */
  const updateStorage = useCallback(() => {
    const el = document.getElementById("storage-usage");
    if (!el) return;
    const bytes = new Blob([localStorage.getItem("interval_v4") || ""]).size;
    const kb = (bytes / 1024).toFixed(1);
    el.textContent = `${kb} KB used · ${state.sessions.length} sessions`;
  }, [state.sessions.length]);

  /**
   * Switches between notes and todos tabs by toggling active class
   */
  const switchTab = (name: "notes" | "todos") => {
    ["notes", "todos"].forEach((tabName) => {
      const tabBtn = document.getElementById(`tab-btn-${tabName}`);
      const pane = document.getElementById(`pane-${tabName}`);
      const isActive = tabName === name;
      if (tabBtn) tabBtn.classList.toggle("active", isActive);
      if (pane) pane.classList.toggle("active", isActive);
    });
  };

  const showView = (name: string) => {
    setCurrentView(name);
    if (name === "settings") {
      updateStorage();
      syncSettings();
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER DATA
  ═══════════════════════════════════════════════════════════════════════════ */
  const renderDash = () => {
    const today = new Date().toDateString();
    const tod = state.sessions.filter(
      (s) => new Date(s.startTime).toDateString() === today,
    );
    const focMs = tod.reduce((a, s) => a + (s.totalDuration || 0), 0);
    const ivs = tod.reduce((a, s) => a + (s.intervalCount || 0), 0);
    const rats = tod
      .filter((s) => s.avgRating != null)
      .map((s) => s.avgRating!);
    const avgR = rats.length
      ? (rats.reduce((a, b) => a + b, 0) / rats.length).toFixed(1)
      : "—";

    return { focMs, ivs, avgR, sessionCount: state.sessions.length };
  };

  const dashData = renderDash();

  const renderNotesList = (notes: Note[]) => {
    if (!notes.length)
      return (
        <div
          style={{
            color: "var(--text3)",
            fontSize: ".84rem",
            padding: "16px 0",
            textAlign: "center",
          }}
        >
          No notes yet — start writing!
        </div>
      );

    return (
      <>
        {[...notes].reverse().map((n) => (
          <div key={n.id} className="item-card">
            <div className="item-body">
              <div className="item-content">{escapeHtml(n.content)}</div>
              <div className="item-meta">
                {formatTimestamp(new Date(n.timestamp))} · Interval {n.iv}
              </div>
            </div>
            <div className="item-acts">
              <button className="item-act del" onClick={() => delNote(n.id)}>
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderTodosList = (todos: Todo[]) => {
    if (!todos.length)
      return (
        <div
          style={{
            color: "var(--text3)",
            fontSize: ".84rem",
            padding: "16px 0",
            textAlign: "center",
          }}
        >
          No todos yet — add tasks here!
        </div>
      );

    return (
      <>
        {[...todos].reverse().map((t) => (
          <div key={t.id} className={`item-card ${t.done ? "done" : ""}`}>
            <div
              className={`item-check ${t.done ? "on" : ""}`}
              onClick={() => toggleTodo(t.id)}
            ></div>
            <div className="item-body">
              <div className="item-content">{escapeHtml(t.content)}</div>
              <div className="item-meta">
                {formatTimestamp(new Date(t.timestamp))} · Interval {t.iv}
              </div>
            </div>
            <div className="item-acts">
              <button className="item-act del" onClick={() => delTodo(t.id)}>
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </>
    );
  };

  const recentSessions = state.sessions.slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Interval",
            url: "https://interval.app",
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Any",
            description:
              "A distraction-free focus timer with interval tracking, productivity logging, notes and todos — all in one place.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <div id="app" role="application" aria-label="Interval Focus Timer">
        <nav aria-label="Main navigation">
          <div className="nav-logo" aria-label="Interval">
            Inter<span>val</span>
          </div>
          <div className="nav-acts">
            <button className="btn-ghost" onClick={() => showView("dashboard")}>
              Dashboard
            </button>
            <button className="btn-ghost" onClick={() => showView("history")}>
              History
            </button>
            <button className="btn-ghost" onClick={() => showView("settings")}>
              Settings
            </button>
            <button
              className="icon-btn"
              id="theme-btn"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {state.settings.dark ? (
                <Sun id="theme-icon" size={17} strokeWidth={2} />
              ) : (
                <Moon id="theme-icon" size={17} strokeWidth={2} />
              )}
            </button>
          </div>
        </nav>

        <main>
          <div
            id="view-dashboard"
            className={`view ${currentView === "dashboard" ? "active" : ""}`}
            role="region"
            aria-label="Dashboard"
          >
            <div className="dash-wrap">
              <div className="dash-hd">
                <div className="date-pill">
                  <div className="dot-live"></div>
                  <span id="today-date"></span>
                </div>
                <h1>
                  Good <span id="greeting-time"></span>,<br />
                  ready to focus?
                </h1>
                <p>
                  Track intervals, notes and productivity — all in one place.
                </p>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-lbl">Focus Time</div>
                  <div className="stat-val">
                    {formatDuration(dashData.focMs)}
                  </div>
                  <div className="stat-sub">Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Intervals Done</div>
                  <div className="stat-val">{dashData.ivs}</div>
                  <div className="stat-sub">Completed checks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Avg. Rating</div>
                  <div className="stat-val">
                    {dashData.avgR !== "—" ? "★ " + dashData.avgR : "—"}
                  </div>
                  <div className="stat-sub">Productivity</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">All Sessions</div>
                  <div className="stat-val">{dashData.sessionCount}</div>
                  <div className="stat-sub">Lifetime</div>
                </div>
              </div>
              <div className="action-bar">
                <button
                  className="btn-start"
                  onClick={() => setSetupOpen(true)}
                >
                  <Play size={16} strokeWidth={2} />
                  Start Work Session
                </button>
                <button
                  className="btn-outline"
                  onClick={() => showView("history")}
                >
                  <Calendar size={15} strokeWidth={2} />
                  History
                </button>
                <button
                  className="btn-outline"
                  onClick={() => showView("settings")}
                >
                  <Settings size={15} strokeWidth={2} />
                  Settings
                </button>
              </div>
              <div className="section-title">Recent Sessions</div>
              <div className="sessions-list" id="recent-sessions">
                {!recentSessions.length ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Clock size={44} strokeWidth={1.4} />
                    </div>
                    <p>No sessions yet. Start your first work session!</p>
                  </div>
                ) : (
                  recentSessions.map((s) => {
                    const ok = (s.logs || []).filter(
                      (l) => l.status === "productive",
                    ).length;
                    const tot = (s.logs || []).length;
                    const pct = tot
                      ? Math.round((ok / tot) * 100) + "% productive"
                      : "No ratings";
                    const stars = s.avgRating
                      ? "★".repeat(s.avgRating) + "☆".repeat(5 - s.avgRating)
                      : "—";
                    const good = !tot || ok >= tot / 2;
                    return (
                      <div key={s.id} className="sess-card-wrap">
                        <div
                          className="sess-card"
                          onClick={() => toggleExpandSession(s.id)}
                        >
                          <div className="sess-left">
                            <div className={`sess-ico ${good ? "ok" : "bad"}`}>
                              {good ? (
                                <Check
                                  size={20}
                                  strokeWidth={2}
                                  color="var(--accent)"
                                />
                              ) : (
                                <Clock
                                  size={20}
                                  strokeWidth={2}
                                  color="var(--accent2)"
                                />
                              )}
                            </div>
                            <div>
                              <div className="sess-name">
                                {formatDate(s.startTime)}
                              </div>
                              <div className="sess-meta">
                                {s.intervalCount} intervals ·{" "}
                                {(s.notes || []).length} notes ·{" "}
                                {(s.todos || []).length} todos
                              </div>
                            </div>
                          </div>
                          <div className="sess-right">
                            <div className="sess-stat">
                              <div className="sess-stat-val">
                                {formatDuration(s.totalDuration)}
                              </div>
                              <div className="sess-stat-lbl">Duration</div>
                            </div>
                            <div className="sess-stat">
                              <div className="sess-stat-val">{pct}</div>
                              <div className="sess-stat-lbl">
                                <span className="rating-stars">{stars}</span>
                              </div>
                            </div>
                            <button
                              className="sess-del-btn"
                              title="Delete session"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(s.id);
                              }}
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                        {expandedSession === s.id && (
                          <div className="sess-detail">
                            <div className="sess-detail-grid">
                              <div className="sess-detail-col">
                                <div className="sess-detail-title">
                                  Notes ({(s.notes || []).length})
                                </div>
                                {(s.notes || []).length ? (
                                  s.notes.map((n: Note) => (
                                    <div
                                      key={n.id}
                                      className="sess-detail-item"
                                    >
                                      {escapeHtml(n.content)}
                                      <span className="sess-detail-ts">
                                        {formatTimestamp(new Date(n.timestamp))}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="sess-detail-empty">
                                    No notes
                                  </div>
                                )}
                              </div>
                              <div className="sess-detail-col">
                                <div className="sess-detail-title">
                                  Todos ({(s.todos || []).length})
                                </div>
                                {(s.todos || []).length ? (
                                  s.todos.map((t: Todo) => (
                                    <div
                                      key={t.id}
                                      className={`sess-detail-item ${t.done ? "done" : ""}`}
                                    >
                                      <span className="sess-detail-check">
                                        {t.done ? "✓" : "○"}
                                      </span>
                                      {escapeHtml(t.content)}
                                    </div>
                                  ))
                                ) : (
                                  <div className="sess-detail-empty">
                                    No todos
                                  </div>
                                )}
                              </div>
                            </div>
                            {(s.logs || []).length > 0 && (
                              <div className="sess-detail-logs">
                                <div className="sess-detail-title">
                                  Productivity Logs
                                </div>
                                {s.logs.map((l, i) => (
                                  <div
                                    key={i}
                                    className={`sess-detail-log ${l.status}`}
                                  >
                                    <span className="sess-detail-log-badge">
                                      {l.status === "productive"
                                        ? "✓ Productive"
                                        : "✗ Distracted"}
                                    </span>
                                    {l.notes && (
                                      <span className="sess-detail-log-note">
                                        {l.notes}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div
            id="view-session"
            className={`view session-view ${currentView === "session" ? "active" : ""}`}
            role="region"
            aria-label="Active session"
          >
            <div className="timer-panel">
              <div className="timer-header">
                <div className="sess-badge">
                  <div className="badge-dot"></div>Live Session
                </div>
                {paused && <div className="paused-badge">Paused</div>}
              </div>

              <div className="timer-clock-area">
                <svg
                  className="arc-svg"
                  viewBox="0 0 260 260"
                  width="260"
                  height="260"
                >
                  <defs>
                    <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop
                        offset="0%"
                        style={{ stopColor: "var(--accent)" }}
                      />
                      <stop offset="100%" style={{ stopColor: "#8fb58a" }} />
                    </linearGradient>
                  </defs>
                  <circle className="arc-track" cx="130" cy="130" r="118" />
                  <circle
                    className="arc-progress"
                    id="ring-prog"
                    cx="130"
                    cy="130"
                    r="118"
                    strokeDasharray={2 * Math.PI * 118}
                    strokeDashoffset={2 * Math.PI * 118}
                  />
                  <circle className="arc-glow" cx="130" cy="130" r="118" />
                </svg>
                <div className="timer-time-block">
                  <div className="timer-elapsed" id="timer-display">
                    {(() => {
                      const t = formatTime(elapsed);
                      const [h, m, s] = t.split(":");
                      return (
                        <>
                          {h !== "00" && (
                            <>
                              <span className="timer-digit">{h}</span>
                              <span className="timer-sep">:</span>
                            </>
                          )}
                          <span className="timer-digit">{m}</span>
                          <span className="timer-sep">:</span>
                          <span className="timer-digit">{s}</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="timer-label">Session Elapsed</div>
                </div>
              </div>

              <div className="timer-interval-bar">
                <div className="interval-bar-track">
                  <div
                    className="interval-bar-fill"
                    style={{
                      width: `${Math.min((ivElapsed / ivDurationRef.current) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="interval-bar-meta">
                  <span className="interval-bar-label">Interval</span>
                  <span className="interval-bar-time">
                    {formatTime(
                      Math.max(0, ivDurationRef.current - ivElapsed),
                      true,
                    )}
                  </span>
                </div>
              </div>

              <div className="tinfo-grid">
                <div className="tinfo">
                  <div className="tinfo-val" id="si-intervals">
                    {ivCountRef.current}
                  </div>
                  <div className="tinfo-lbl">Intervals</div>
                </div>
                <div className="tinfo">
                  <div className="tinfo-val" id="si-duration">
                    {formatTime(ivDurationRef.current)
                      .split(":")
                      .slice(1)
                      .join(":")}
                  </div>
                  <div className="tinfo-lbl">Duration</div>
                </div>
                <div className="tinfo">
                  <div className="tinfo-val" id="si-notes">
                    {(state.active?.notes || []).length}
                  </div>
                  <div className="tinfo-lbl">Notes</div>
                </div>
                <div className="tinfo">
                  <div className="tinfo-val" id="si-todos">
                    {(state.active?.todos || []).length}
                  </div>
                  <div className="tinfo-lbl">Todos</div>
                </div>
              </div>

              <div className="vol-row">
                <Volume2 size={15} strokeWidth={2} />
                <input
                  type="range"
                  id="vol-quick"
                  min="0"
                  max="1"
                  step="0.05"
                  defaultValue="0.5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateVolume(parseFloat(e.target.value))
                  }
                />
                <span className="vol-pct" id="vol-pct">
                  {Math.round(state.settings.volume * 100)}%
                </span>
              </div>

              <div className="timer-controls">
                <button
                  className="btn-pause-ctrl"
                  id="pause-btn"
                  onClick={togglePause}
                >
                  {paused ? (
                    <Play size={15} strokeWidth={2.5} />
                  ) : (
                    <Pause size={15} strokeWidth={2.5} />
                  )}
                  <span id="pause-label">{paused ? "Resume" : "Pause"}</span>
                </button>
                <button
                  className="btn-end-ctrl"
                  id="end-btn"
                  onClick={endSession}
                >
                  <Square size={11} strokeWidth={2} fill="currentColor" />
                  End Session
                </button>
              </div>
            </div>

            <div className="notes-panel">
              <div className="interval-done" id="interval-done">
                <h3>
                  <Clock size={18} strokeWidth={2} />
                  Interval Complete!
                </h3>
                <p>How was your productivity this interval?</p>
                <textarea
                  className="prod-input"
                  id="prod-input"
                  placeholder="Any distractions or context notes..."
                  rows={2}
                ></textarea>
                <div className="prod-opts">
                  <button
                    className="prod-btn yes"
                    onClick={() => logProd("productive")}
                  >
                    <Check size={12} strokeWidth={2.5} />
                    Productive
                  </button>
                  <button
                    className="prod-btn no"
                    onClick={() => logProd("distracted")}
                  >
                    <MessageCircle size={12} strokeWidth={2} />
                    Distracted
                  </button>
                </div>
              </div>

              <div className="panel-tabs">
                <button
                  className="panel-tab active"
                  id="tab-btn-notes"
                  onClick={() => switchTab("notes")}
                >
                  Notes
                </button>
                <button
                  className="panel-tab"
                  id="tab-btn-todos"
                  onClick={() => switchTab("todos")}
                >
                  Todos
                </button>
              </div>

              <div className="tab-pane active" id="pane-notes">
                <div className="entry-box">
                  <textarea
                    id="note-inp"
                    placeholder="Add a note about your work, ideas, or context..."
                    rows={3}
                  ></textarea>
                  <div className="entry-foot">
                    <span className="entry-ts" id="note-ts"></span>
                    <button className="btn-add" onClick={addNote}>
                      Add Note
                    </button>
                  </div>
                </div>
                <div className="items-list" id="notes-list">
                  {renderNotesList(state.active?.notes || [])}
                </div>
              </div>

              <div className="tab-pane" id="pane-todos">
                <div className="entry-box">
                  <textarea
                    id="todo-inp"
                    placeholder="Add a task or todo..."
                    rows={2}
                  ></textarea>
                  <div className="entry-foot">
                    <span className="entry-ts" id="todo-ts"></span>
                    <button className="btn-add" onClick={addTodo}>
                      Add Todo
                    </button>
                  </div>
                </div>
                <div className="items-list" id="todos-list">
                  {renderTodosList(state.active?.todos || [])}
                </div>
              </div>
            </div>
          </div>

          <div
            id="view-history"
            className={`view ${currentView === "history" ? "active" : ""}`}
            role="region"
            aria-label="Session history"
          >
            <div className="hist-wrap">
              <div className="dash-hd" style={{ marginBottom: "28px" }}>
                <h1>Session History</h1>
                <p>All your past work sessions, notes and productivity logs.</p>
              </div>
              <div className="hist-grid" id="hist-grid">
                {!state.sessions.length ? (
                  <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                    <div className="empty-icon">
                      <Calendar size={44} strokeWidth={1.4} />
                    </div>
                    <p>No sessions yet.</p>
                  </div>
                ) : (
                  state.sessions.map((s) => {
                    const logs = s.logs || [];
                    const ok = logs.filter(
                      (l) => l.status === "productive",
                    ).length;
                    const kws = extractKeywords(
                      logs.map((l) => l.notes).join(" "),
                    );
                    const isExpanded = expandedSession === s.id;
                    return (
                      <div
                        key={s.id}
                        className={`hist-card ${isExpanded ? "expanded" : ""}`}
                      >
                        <div
                          className="hist-hd"
                          onClick={() => toggleExpandSession(s.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <div>
                            <div className="hist-dur">
                              {formatDuration(s.totalDuration)}
                            </div>
                            <div className="hist-meta">
                              {s.intervalCount} intervals · {logs.length} checks
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                            }}
                          >
                            <div className="hist-ts">
                              {formatTimestamp(new Date(s.startTime))}
                            </div>
                            <button
                              className="sess-del-btn"
                              title="Delete session"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(s.id);
                              }}
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: ".78rem",
                            color: "var(--text2)",
                            marginTop: "4px",
                          }}
                        >
                          {logs.length
                            ? Math.round((ok / logs.length) * 100) +
                              "% productive"
                            : "No productivity logs"}
                        </div>
                        <div className="hist-tags">
                          {(s.notes || []).length ? (
                            <span className="hist-tag">
                              {s.notes.length} notes
                            </span>
                          ) : (
                            ""
                          )}
                          {(s.todos || []).length ? (
                            <span className="hist-tag">
                              {s.todos.length} todos
                            </span>
                          ) : (
                            ""
                          )}
                          {kws.slice(0, 3).map((k) => (
                            <span key={k} className="hist-tag">
                              {k}
                            </span>
                          ))}
                        </div>
                        {isExpanded && (
                          <div
                            className="sess-detail"
                            style={{ marginTop: "14px" }}
                          >
                            <div className="sess-detail-grid">
                              <div className="sess-detail-col">
                                <div className="sess-detail-title">
                                  Notes ({(s.notes || []).length})
                                </div>
                                {(s.notes || []).length ? (
                                  s.notes.map((n: Note) => (
                                    <div
                                      key={n.id}
                                      className="sess-detail-item"
                                    >
                                      {escapeHtml(n.content)}
                                      <span className="sess-detail-ts">
                                        {formatTimestamp(new Date(n.timestamp))}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="sess-detail-empty">
                                    No notes
                                  </div>
                                )}
                              </div>
                              <div className="sess-detail-col">
                                <div className="sess-detail-title">
                                  Todos ({(s.todos || []).length})
                                </div>
                                {(s.todos || []).length ? (
                                  s.todos.map((t: Todo) => (
                                    <div
                                      key={t.id}
                                      className={`sess-detail-item ${t.done ? "done" : ""}`}
                                    >
                                      <span className="sess-detail-check">
                                        {t.done ? "✓" : "○"}
                                      </span>
                                      {escapeHtml(t.content)}
                                    </div>
                                  ))
                                ) : (
                                  <div className="sess-detail-empty">
                                    No todos
                                  </div>
                                )}
                              </div>
                            </div>
                            {logs.length > 0 && (
                              <div className="sess-detail-logs">
                                <div className="sess-detail-title">
                                  Productivity Logs
                                </div>
                                {logs.map((l, i) => (
                                  <div
                                    key={i}
                                    className={`sess-detail-log ${l.status}`}
                                  >
                                    <span className="sess-detail-log-badge">
                                      {l.status === "productive"
                                        ? "✓ Productive"
                                        : "✗ Distracted"}
                                    </span>
                                    {l.notes && (
                                      <span className="sess-detail-log-note">
                                        {l.notes}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div
            id="view-settings"
            className={`view ${currentView === "settings" ? "active" : ""}`}
            role="region"
            aria-label="Settings"
          >
            <div className="sett-wrap">
              <div className="dash-hd" style={{ marginBottom: "28px" }}>
                <h1>Settings</h1>
                <p>Customize your productivity environment.</p>
              </div>

              <div className="sett-section">
                <div className="sett-title">Sound</div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Enable beep</div>
                    <div className="sett-sub">
                      Play sound at interval completion
                    </div>
                  </div>
                  <div
                    className={`toggle ${state.settings.soundOn ? "on" : ""}`}
                    id="snd-toggle"
                    onClick={toggleSound}
                  ></div>
                </div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Sound type</div>
                    <div className="sett-sub">
                      Choose the beep waveform character
                    </div>
                  </div>
                  <select
                    className="sett-select"
                    id="snd-type"
                    onChange={saveSoundSettings}
                    defaultValue={state.settings.sndType}
                  >
                    <option value="sine">Sine — Soft &amp; smooth</option>
                    <option value="square">Square — Sharp &amp; digital</option>
                    <option value="triangle">
                      Triangle — Warm &amp; mellow
                    </option>
                    <option value="sawtooth">
                      Sawtooth — Rich &amp; buzzy
                    </option>
                  </select>
                </div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Pitch / Frequency</div>
                    <div className="sett-sub">Hz pitch of each beep tone</div>
                  </div>
                  <select
                    className="sett-select"
                    id="snd-freq"
                    onChange={saveSoundSettings}
                    defaultValue={state.settings.sndFreq}
                  >
                    <option value="330">330 Hz — Low E</option>
                    <option value="440">440 Hz — A4 (concert)</option>
                    <option value="528">528 Hz — Mid range</option>
                    <option value="660">660 Hz — E5</option>
                    <option value="880">880 Hz — A5 (default)</option>
                    <option value="1046">1046 Hz — High C</option>
                    <option value="1320">1320 Hz — Very high</option>
                  </select>
                </div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Beep count</div>
                    <div className="sett-sub">Number of beeps per interval</div>
                  </div>
                  <select
                    className="sett-select"
                    id="snd-count"
                    onChange={saveSoundSettings}
                    defaultValue={state.settings.beepCount}
                  >
                    <option value="1">1 beep</option>
                    <option value="2">2 beeps</option>
                    <option value="3">3 beeps</option>
                    <option value="4">4 beeps</option>
                    <option value="5">5 beeps</option>
                  </select>
                </div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Beep duration</div>
                    <div className="sett-sub">How long each beep lasts</div>
                  </div>
                  <select
                    className="sett-select"
                    id="snd-dur"
                    onChange={saveSoundSettings}
                    defaultValue={state.settings.sndDur}
                  >
                    <option value="0.2">Short (0.2s)</option>
                    <option value="0.45">Medium (0.45s)</option>
                    <option value="0.8">Long (0.8s)</option>
                    <option value="1.2">Very long (1.2s)</option>
                  </select>
                </div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Volume</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="range"
                      id="vol-slider"
                      min="0"
                      max="1"
                      step="0.05"
                      defaultValue={state.settings.volume}
                      onChange={(e) => updateVolume(parseFloat(e.target.value))}
                      style={{ width: "100px", background: "var(--border)" }}
                    />
                    <span
                      id="vol-disp"
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: ".78rem",
                        color: "var(--text2)",
                        minWidth: "34px",
                      }}
                    >
                      {Math.round(state.settings.volume * 100)}%
                    </span>
                    <button className="btn-test" onClick={testBeep}>
                      Test
                    </button>
                  </div>
                </div>
              </div>

              <div className="sett-section">
                <div className="sett-title">Appearance</div>
                <div className="sett-row">
                  <div>
                    <div className="sett-lbl">Dark mode</div>
                    <div className="sett-sub">
                      Switch to dark theme across all views
                    </div>
                  </div>
                  <div
                    className={`toggle ${state.settings.dark ? "on" : ""}`}
                    id="dark-toggle"
                    onClick={toggleTheme}
                  ></div>
                </div>
              </div>

              <div className="sett-section">
                <div className="sett-title">Data</div>
                <div className="sett-data-row">
                  <div className="sett-lbl">Storage usage</div>
                  <div
                    className="sett-sub"
                    id="storage-usage"
                    style={{ marginBottom: "4px" }}
                  >
                    {isMounted
                      ? `${(new Blob([localStorage.getItem(DB_KEY) || ""]).size / 1024).toFixed(1)} KB used · ${state.sessions.length} sessions`
                      : "Calculating…"}
                  </div>
                  <div className="sett-actions">
                    <button className="btn-sett" onClick={exportJSON}>
                      <Download size={13} strokeWidth={2} />
                      JSON
                    </button>
                    <button className="btn-sett" onClick={exportCSV}>
                      <Download size={13} strokeWidth={2} />
                      CSV
                    </button>
                    <button className="btn-sett" onClick={exportText}>
                      <Download size={13} strokeWidth={2} />
                      Text
                    </button>
                    <label className="btn-import-lbl">
                      <Upload size={13} strokeWidth={2} />
                      Import
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: "none" }}
                        onChange={importData}
                      />
                    </label>
                    <button className="btn-sett danger" onClick={clearAll}>
                      <Trash2 size={13} strokeWidth={2} />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              <div className="sett-section">
                <div className="sett-title">Keyboard Shortcuts</div>
                <div className="sett-row">
                  <div className="sett-lbl">Pause / Resume</div>
                  <kbd>Space</kbd>
                </div>
                <div className="sett-row">
                  <div className="sett-lbl">Focus Note Input</div>
                  <kbd>Ctrl + N</kbd>
                </div>
                <div className="sett-row">
                  <div className="sett-lbl">End Session</div>
                  <kbd>Ctrl + E</kbd>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className={`overlay ${setupOpen ? "open" : ""}`} id="setup-modal">
          <div className="modal">
            <h2>Start Work Session</h2>
            <p className="modal-sub">
              Set your interval and preferences to begin.
            </p>
            <div className="field">
              <label>Interval Duration</label>
              <div className="field-row">
                <input
                  type="number"
                  id="setup-min"
                  defaultValue="25"
                  min="0"
                  max="120"
                  placeholder="Min"
                />
                <input
                  type="number"
                  id="setup-sec"
                  defaultValue="0"
                  min="0"
                  max="59"
                  placeholder="Sec"
                />
              </div>
              <p className="field-hint">
                How long before your productivity is checked?
              </p>
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-lbl">Repeat intervals automatically</div>
                <div className="toggle-sub-lbl">
                  Keep going after each interval check
                </div>
              </div>
              <div className="toggle on" id="repeat-toggle"></div>
            </div>
            <div className="modal-foot">
              <button
                className="btn-cancel"
                onClick={() => setSetupOpen(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={startSession}>
                Start Timer
              </button>
            </div>
          </div>
        </div>

        <div className="beep-overlay" id="beep-overlay">
          <div className="beep-ring"></div>
        </div>
        {toastMsg && (
          <div className="toast show" id="toast">
            {toastMsg}
          </div>
        )}

        {state.active && currentView !== "session" && (
          <div
            className="floating-timer"
            onClick={() => setCurrentView("session")}
            title="Return to session"
          >
            <div className="floating-timer-dot"></div>
            <div className="floating-timer-time">{formatTime(elapsed)}</div>
            <div className="floating-timer-meta">
              {paused ? "Paused" : "In Progress"}
            </div>
            <button
              className="floating-timer-pause"
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          </div>
        )}

        <div className={`overlay ${confirmModal ? "open" : ""}`}>
          {confirmModal && (
            <div className="modal" style={{ maxWidth: 420 }}>
              <div className="confirm-modal-icon">
                {confirmModal.danger ? (
                  <AlertTriangle size={28} color="var(--accent2)" />
                ) : (
                  <Check size={28} color="var(--accent)" />
                )}
              </div>
              <h2>{confirmModal.title}</h2>
              <p className="modal-sub">{confirmModal.message}</p>
              <div className="modal-foot">
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmModal(null)}
                >
                  Cancel
                </button>
                {confirmModal.onAlt && (
                  <button
                    className={`btn-confirm ${confirmModal.danger ? "danger" : ""}`}
                    onClick={confirmModal.onAlt}
                  >
                    {confirmModal.cancelLabel || "Alternative"}
                  </button>
                )}
                <button
                  className={`btn-confirm ${confirmModal.danger ? "danger" : ""}`}
                  onClick={confirmModal.onConfirm}
                >
                  {confirmModal.confirmLabel || "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`overlay ${pendingRecovery ? "open" : ""}`}>
          {pendingRecovery && (
            <div className="modal" style={{ maxWidth: 440 }}>
              <div className="confirm-modal-icon">
                {recoveryCanContinue ? (
                  <Timer size={28} color="var(--accent)" />
                ) : (
                  <Clock size={28} color="var(--accent)" />
                )}
              </div>
              <h2>Session Recovery</h2>
              <p className="modal-sub">
                {recoveryCanContinue ? (
                  <>
                    Your session from{" "}
                    <strong>
                      {formatDate(pendingRecovery.active?.startTime || "")}
                    </strong>{" "}
                    was interrupted. You can pick up right where you left off.
                  </>
                ) : (
                  <>
                    Found an unfinished session from{" "}
                    <strong>
                      {formatDate(pendingRecovery.active?.startTime || "")}
                    </strong>
                    . It&apos;s too old to continue but you can save the data.
                  </>
                )}
              </p>
              <div className="modal-foot" style={{ gap: "8px" }}>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    const newState = {
                      ...pendingRecovery,
                      active: null,
                    };
                    setState(newState);
                    saveState(newState);
                    setPendingRecovery(null);
                  }}
                >
                  Discard
                </button>
                <button
                  className="btn-confirm"
                  onClick={() => {
                    const active = pendingRecovery.active!;
                    const age =
                      Date.now() - new Date(active.startTime).getTime();
                    const recovered = {
                      ...active,
                      endTime: new Date().toISOString(),
                      totalDuration: age,
                      partial: false,
                    };
                    const newState = {
                      ...pendingRecovery,
                      sessions: [recovered, ...pendingRecovery.sessions],
                      active: null,
                    };
                    setState(newState);
                    saveState(newState);
                    setPendingRecovery(null);
                    toast("Session recovered!");
                  }}
                >
                  Save Session
                </button>
                {recoveryCanContinue && (
                  <button
                    className="btn-confirm"
                    style={{ background: "var(--accent)", color: "#fff" }}
                    onClick={() => {
                      const active = pendingRecovery.active!;
                      const now = Date.now();
                      const sessionStart = new Date(active.startTime).getTime();
                      const ageMs = now - sessionStart;

                      sessStartRef.current = sessionStart;
                      ivDurationRef.current = active.intervalDuration;
                      ivCountRef.current = active.intervalCount || 0;
                      repeatingRef.current = true;

                      const ivDur = active.intervalDuration;
                      const completedIvTime =
                        (active.intervalCount || 0) * ivDur;
                      const currentIvElapsed = ageMs - completedIvTime;
                      if (currentIvElapsed >= 0 && currentIvElapsed < ivDur) {
                        ivStartRef.current = now - currentIvElapsed;
                      } else {
                        ivStartRef.current = now;
                      }

                      totalPausedRef.current = 0;
                      ivPausedRef.current = 0;
                      pauseAtRef.current = null;
                      ivFiredRef.current = false;

                      setState(pendingRecovery);
                      saveState(pendingRecovery);
                      setPaused(false);
                      setPendingRecovery(null);
                      setCurrentView("session");
                      setTimerTrigger((c) => c + 1);
                      toast("Session resumed!");
                    }}
                  >
                    Continue Session
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
