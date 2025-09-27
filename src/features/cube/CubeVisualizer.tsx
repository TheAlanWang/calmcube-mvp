"use client";

import { motion } from "framer-motion";
import type { RelaxationMode } from "@/features/heart-rate/analyzeHeartRate";

const modeCopy: Record<RelaxationMode, { label: string; description: string; colorClass: string }> = {
  breathing: {
    label: "High Pressure",
    description: "Guided breathing recommended",
    colorClass: "from-calm-high/90 to-calm-high/70"
  },
  music: {
    label: "Medium Pressure",
    description: "Calming music suggested",
    colorClass: "from-calm-medium/90 to-calm-medium/70"
  },
  chat: {
    label: "Stable",
    description: "Connect through a gentle chat",
    colorClass: "from-calm-low/90 to-calm-low/70"
  }
};

interface CubeVisualizerProps {
  mode: RelaxationMode;
  heartRate?: number | null;
}

export function CubeVisualizer({ mode, heartRate }: CubeVisualizerProps) {
  const copy = modeCopy[mode];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="h-48 w-48 perspective">
        <motion.div
          key={mode}
          className={`relative h-full w-full rounded-3xl bg-gradient-to-br ${copy.colorClass} shadow-[0_25px_50px_-12px_rgb(0,0,0,0.45)]`}
          initial={{ rotateX: -15, rotateY: 0, scale: 0.9, opacity: 0 }}
          animate={{ rotateX: -15, rotateY: 360, scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 grid place-items-center text-center text-xl font-semibold tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-base uppercase tracking-widest text-slate-200/80">
                {copy.label}
              </span>
              <span className="text-4xl font-bold text-white drop-shadow-lg">
                {heartRate ? `${heartRate} bpm` : "-- bpm"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <motion.p
        key={`${mode}-description`}
        className="max-w-sm text-center text-sm text-slate-300"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {copy.description}
      </motion.p>
    </div>
  );
}
