"use client";

import { useCallback, useEffect, useState } from "react";
import type { RelaxationMode } from "@/features/heart-rate/analyzeHeartRate";

export interface SessionEntry {
  id: string;
  heartRate: number;
  mode: RelaxationMode;
  timestamp: string;
  stressScore?: number;
}

const STORAGE_KEY = "calmcube.sessions.v1";

function readFromStorage(): SessionEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SessionEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read sessions", error);
    return [];
  }
}

function writeToStorage(entries: SessionEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to persist sessions", error);
  }
}

export function useSessionLog() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    setSessions(readFromStorage());
  }, []);

  const addSession = useCallback((entry: Omit<SessionEntry, "id" | "timestamp">) => {
    const newEntry: SessionEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    setSessions((prev) => {
      const next = [...prev, newEntry];
      writeToStorage(next);
      return next;
    });

    return newEntry.id;
  }, []);

  const updateSession = useCallback((id: string, update: Partial<SessionEntry>) => {
    setSessions((prev) => {
      const nextSessions = prev.map((session) =>
        session.id === id ? { ...session, ...update } : session
      );
      writeToStorage(nextSessions);
      return nextSessions;
    });
  }, []);

  return {
    sessions,
    addSession,
    updateSession
  };
}
