"use client";

import { motion } from "framer-motion";

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        className="mx-6 max-w-lg rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-center shadow-[0_25px_60px_-15px_rgba(15,23,42,0.8)]"
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl font-semibold text-white"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Feeling overwhelmed?
        </motion.h2>
        <motion.p
          className="mt-4 text-sm text-slate-200/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          CalmCube can guide you through a focused breathing exercise, soothing music, or a gentle
          chat. Share your heart rate to begin a personalized calm-down routine.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 sm:w-auto"
          >
            Yes, help me relax
          </button>
          <span className="text-xs text-slate-400">
            Need the scripted demo? Try 115 → 90 → 70 bpm.
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
