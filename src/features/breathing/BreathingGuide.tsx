"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const SESSION_LENGTH = 60; // seconds
const CYCLE_DURATION = 8; // inhale 4s + exhale 4s

const easeInOut = (value: number) => 0.5 - 0.5 * Math.cos(Math.PI * value);

type Phase = "inhale" | "exhale";

const phaseCopy: Record<Phase, { title: string; hint: string }> = {
  inhale: {
    title: "Inhale gently",
    hint: "Let the light fill your chest"
  },
  exhale: {
    title: "Exhale slowly",
    hint: "Release the tension with the glow"
  }
};

export function BreathingGuide() {
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      return;
    }

    startRef.current = performance.now();

    const loop = (timestamp: number) => {
      const progress = (timestamp - startRef.current) / 1000;
      if (progress >= SESSION_LENGTH) {
        setElapsed(SESSION_LENGTH);
        setIsActive(false);
        return;
      }

      setElapsed(progress);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const progress = Math.min(elapsed / SESSION_LENGTH, 1);
  const cycle = elapsed % CYCLE_DURATION;
  const cycleProgress = cycle / CYCLE_DURATION;
  const phase: Phase = cycleProgress < 0.5 ? "inhale" : "exhale";
  const phaseProgress = cycleProgress < 0.5 ? cycleProgress / 0.5 : (cycleProgress - 0.5) / 0.5;
  const eased = easeInOut(Math.min(Math.max(phaseProgress, 0), 1));

  const currentScale = useMemo(() => {
    if (!isActive) {
      return 0.85;
    }
    const inhaleScale = 0.9 + 0.28 * eased;
    const exhaleScale = 1.18 - 0.25 * eased;
    return phase === "inhale" ? inhaleScale : exhaleScale;
  }, [isActive, eased, phase]);

  const glowOpacity = isActive ? 0.55 + 0.35 * eased : 0.25;
  const subGlowOpacity = isActive ? 0.25 + 0.25 * (1 - eased) : 0.15;

  const remainingSeconds = Math.max(0, Math.ceil(SESSION_LENGTH - elapsed));
  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(1, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  const startSession = () => {
    setElapsed(0);
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setElapsed(0);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300/20 via-teal-400/10 to-sky-500/20 blur-3xl"
          animate={{ opacity: glowOpacity }}
          transition={{ type: "tween", duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-white/10"
          style={{
            background: `conic-gradient(rgba(45,212,191,0.65) ${progress * 360}deg, rgba(15,23,42,0.35) ${
              progress * 360
            }deg)`
          }}
          animate={{ opacity: isActive ? 1 : 0.5 }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/30 via-emerald-400/20 to-sky-600/30"
          animate={{
            scale: currentScale,
            opacity: glowOpacity,
            rotate: isActive ? 15 : 0
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-12 rounded-full bg-slate-950/60 backdrop-blur-xl"
          animate={{ opacity: 0.8 + subGlowOpacity * 0.5 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 18, ease: "linear", repeat: isActive ? Infinity : 0 }}
        >
          <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-200/70 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          <div className="absolute bottom-4 left-1/4 h-1.5 w-1.5 rounded-full bg-sky-300/60 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
          <div className="absolute right-6 top-1/3 h-2.5 w-2.5 rounded-full bg-teal-300/70 shadow-[0_0_14px_rgba(94,234,212,0.6)]" />
        </motion.div>
        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Calm Session</span>
          <p className="text-4xl font-semibold text-white">{phaseCopy[phase].title}</p>
          <p className="text-sm text-emerald-100/80">{phaseCopy[phase].hint}</p>
          <p className="mt-2 text-lg font-bold text-emerald-100">{minutes}:{seconds}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="max-w-md text-sm text-slate-200/80">
          Follow the glowing orb. Expand with the light as you inhale, soften as it retreats while you
          exhale. Complete the full minute to reset your nervous system.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isActive ? resetSession : startSession}
            className={`rounded-2xl px-6 py-3 text-sm font-semibold transition ${
              isActive
                ? "bg-white/10 text-emerald-200 hover:bg-white/15"
                : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            }`}
          >
            {isActive ? "End session" : "Start 1-minute session"}
          </button>
          {!isActive && progress === 1 && (
            <span className="text-xs text-emerald-200/80">Great job! Restart anytime.</span>
          )}
        </div>
      </div>
    </div>
  );
}
