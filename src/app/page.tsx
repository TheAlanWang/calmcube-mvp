"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  HR_MAX,
  HR_MIN,
  analyzeHeartRate,
  clampHeartRate,
  type RelaxationMode
} from "@/features/heart-rate/analyzeHeartRate";
import { CubeVisualizer } from "@/features/cube/CubeVisualizer";
import { BreathingGuide } from "@/features/breathing/BreathingGuide";
import { MusicPlayer } from "@/features/music/MusicPlayer";
import { ChatWindow } from "@/features/chat/ChatWindow";
import { FeedbackForm } from "@/features/feedback/FeedbackForm";
import { SessionHistory } from "@/features/history/SessionHistory";
import { AmbientToggle } from "@/features/ambient/AmbientToggle";
import { useSessionLog } from "@/features/history/useSessionLog";
import { WelcomeOverlay } from "@/features/onboarding/WelcomeOverlay";

const modeHeadlines: Record<RelaxationMode, { title: string; subtitle: string }> = {
  breathing: {
    title: "Guided Breathing",
    subtitle: "Let’s release the pressure together. Follow the animation."
  },
  music: {
    title: "Calming Music",
    subtitle: "Soft pulses that ease your nerves within minutes."
  },
  chat: {
    title: "Gentle Check-In",
    subtitle: "Share what’s on your mind. A calm voice is listening."
  }
};

export default function Home() {
  const { sessions, addSession, updateSession } = useSessionLog();
  const [heartRateInput, setHeartRateInput] = useState("");
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [mode, setMode] = useState<RelaxationMode>("music");
  const [status, setStatus] = useState("Awaiting heart-rate input");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const headline = modeHeadlines[mode];

  useEffect(() => {
    if (!welcomeVisible) {
      inputRef.current?.focus();
    }
  }, [welcomeVisible]);

  const averageScore = useMemo(() => {
    const rated = sessions.filter((entry) => typeof entry.stressScore === "number");
    if (!rated.length) {
      return null;
    }
    const total = rated.reduce((sum, entry) => sum + (entry.stressScore ?? 0), 0);
    return (total / rated.length).toFixed(1);
  }, [sessions]);

  const handleAnalyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(heartRateInput);

    if (!Number.isFinite(parsed)) {
      setStatus("Enter a valid heart-rate between 40 and 180 bpm");
      return;
    }

    if (parsed < HR_MIN || parsed > HR_MAX) {
      setStatus(`Input auto-adjusted to demo range ${HR_MIN}-${HR_MAX} bpm.`);
    } else {
      setStatus("Mode updated");
    }

    const safeHeartRate = clampHeartRate(parsed);
    const nextMode = analyzeHeartRate(safeHeartRate);

    setCurrentHeartRate(safeHeartRate);
    setMode(nextMode);
    const sessionId = addSession({ heartRate: safeHeartRate, mode: nextMode });
    setActiveSessionId(sessionId);
    setFeedbackVisible(false);
  };

  const handleFeedback = (score: number) => {
    if (!activeSessionId) {
      return;
    }
    updateSession(activeSessionId, { stressScore: score });
    setFeedbackVisible(false);
    setStatus(`Feedback saved at ${score}/10`);
  };

  return (
    <>
      {welcomeVisible && <WelcomeOverlay onDismiss={() => setWelcomeVisible(false)} />}
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
        <div className="mx-auto w-full max-w-6xl px-6 pt-8">
          <div className="flex justify-end">
            <div className="lg:sticky lg:top-8 lg:z-30">
              <AmbientToggle />
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pt-6 lg:flex-row lg:items-start">
          <section className="flex flex-1 flex-col items-center gap-10 text-center">
            <header className="flex flex-col items-center gap-3">
              <h1 className="text-4xl font-bold text-white sm:text-5xl">CalmCube MVP</h1>
              <p className="max-w-xl text-balance text-sm text-slate-200/80 sm:text-base">
                Input your simulated heart rate and let CalmCube guide you through breathing,
                soundscapes, or a gentle chat in under 60 seconds.
              </p>
            </header>

            <CubeVisualizer mode={mode} heartRate={currentHeartRate} />

            <form
              onSubmit={handleAnalyze}
              className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-xl"
            >
              <label className="text-sm font-semibold text-slate-200" htmlFor="heartRate">
                Enter heart rate (bpm)
              </label>
              <input
                id="heartRate"
                inputMode="numeric"
                ref={inputRef}
                value={heartRateInput}
                onChange={(event) => setHeartRateInput(event.target.value)}
                placeholder="Try 115 / 90 / 70"
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-lg font-semibold text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
              >
                Analyze heart rate
              </button>
              <p className="text-xs text-slate-300/80">{status}</p>
              {averageScore && (
                <p className="text-xs text-emerald-200/90">
                  Avg. calm score from recent sessions: {averageScore}/10
                </p>
              )}
            </form>

            <SessionHistory sessions={sessions} />
          </section>

          <section className="flex flex-1 flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-200/60">Active Mode</p>
              <h2 className="text-3xl font-bold text-white">{headline.title}</h2>
              <p className="text-sm text-slate-200/80">{headline.subtitle}</p>
            </div>

            {mode === "breathing" && <BreathingGuide />}
            {mode === "music" && <MusicPlayer active={mode === "music"} />}
            {mode === "chat" && <ChatWindow />}

            <div className="flex flex-col gap-3 pt-6 text-center">
              <p className="text-xs text-slate-300">
                Run the scripted demo: 115 bpm → breathing, 90 bpm → music, 70 bpm → chat.
              </p>
              <button
                type="button"
                onClick={() => setFeedbackVisible((prev) => !prev)}
                className="self-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/20"
              >
                {feedbackVisible ? "Hide Calm Score" : "Log Calm Score"}
              </button>
            </div>

            {feedbackVisible && <FeedbackForm onSubmit={handleFeedback} disabled={!activeSessionId} />}
          </section>
        </div>
      </main>
    </>
  );
}
