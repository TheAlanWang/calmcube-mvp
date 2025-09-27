"use client";

import { FormEvent, useState } from "react";

interface FeedbackFormProps {
  onSubmit: (score: number) => void;
  disabled?: boolean;
}

export function FeedbackForm({ onSubmit, disabled }: FeedbackFormProps) {
  const [score, setScore] = useState(5);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(score);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5"
    >
      <div>
        <h4 className="text-lg font-semibold text-white">How calm do you feel now?</h4>
        <p className="text-sm text-slate-200/70">0 = still tense, 10 = fully relaxed</p>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={10}
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
          className="flex-1"
          disabled={disabled}
        />
        <span className="w-8 text-right text-lg font-semibold text-emerald-200">{score}</span>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:bg-white/10"
      >
        Save feedback
      </button>
    </form>
  );
}
