"use client";

import type { SessionEntry } from "@/features/history/useSessionLog";

interface SessionHistoryProps {
  sessions: SessionEntry[];
}

const modeLabels: Record<SessionEntry["mode"], string> = {
  breathing: "Breathing",
  music: "Music",
  chat: "Chat"
};

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (!sessions.length) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/5 p-5 text-sm text-slate-300">
        Interact with CalmCube to build your personal relaxation log.
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5">
      <h4 className="text-base font-semibold text-white">Recent Sessions</h4>
      <ul className="flex flex-col gap-3 text-sm text-slate-200/80">
        {[...sessions].reverse().slice(0, 5).map((session) => (
          <li key={session.id} className="rounded-2xl bg-slate-900/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                {modeLabels[session.mode]}
              </span>
              <time dateTime={session.timestamp} className="text-xs text-slate-400">
                {new Date(session.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Heart rate: <span className="font-semibold text-white">{session.heartRate} bpm</span>
            </p>
            {typeof session.stressScore === "number" && (
              <p className="text-xs text-emerald-200">Calm score: {session.stressScore}/10</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
