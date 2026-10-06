"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  /** ISO time the very first Start happened. */
  startedAt: string | null;
  /** Active milliseconds accumulated before the current run. */
  accumulatedMs: number;
  /** Epoch ms of the current run start, null while paused/stopped. */
  runningSince: number | null;
}

const DEFAULT_STORAGE_KEY = "revolutic:time-tracking:timer";
const EMPTY: TimerState = { startedAt: null, accumulatedMs: 0, runningSince: null };

const read = (STORAGE_KEY: string): TimerState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
};

/**
 * Stopwatch that survives page reloads (per-browser convenience only). The
 * resulting TimeEntry is still validated and priced on the server.
 */
const useTimer = (storageKey: string = DEFAULT_STORAGE_KEY) => {
  const [state, setState] = useState<TimerState>(EMPTY);
  const [now, setNow] = useState(() => Date.now());
  const loaded = useRef(false);

  useEffect(() => {
    setState(read(storageKey));
    loaded.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* storage unavailable: timer still works in-memory */
    }
  }, [state, storageKey]);

  useEffect(() => {
    if (state.runningSince === null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.runningSince]);

  const elapsedMs =
    state.accumulatedMs + (state.runningSince !== null ? Math.max(0, now - state.runningSince) : 0);

  const start = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setState((s) => ({
      startedAt: s.startedAt ?? new Date(t).toISOString(),
      accumulatedMs: s.accumulatedMs,
      runningSince: t,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((s) =>
      s.runningSince === null
        ? s
        : {
            ...s,
            accumulatedMs: s.accumulatedMs + (Date.now() - s.runningSince),
            runningSince: null,
          },
    );
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const format = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  };

  return {
    startedAt: state.startedAt,
    running: state.runningSince !== null,
    active: state.startedAt !== null,
    elapsedMs,
    display: format(elapsedMs),
    start,
    pause,
    reset,
  };
};

export default useTimer;
