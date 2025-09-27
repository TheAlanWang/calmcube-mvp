"use client";

import { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  active: boolean;
}

const tracks = [
  {
    id: "lofi-1",
    title: "Aurora Breaths",
    description: "Soft pads at 432 Hz for calmer focus",
    src: "/audio/lofi-1.wav"
  },
  {
    id: "lofi-2",
    title: "Gentle Horizon",
    description: "Warm chimes to unwind mid-day",
    src: "/audio/lofi-2.wav"
  }
];

export function MusicPlayer({ active }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState(tracks[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (!active) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const playAudio = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
        setError(null);
      } catch (err) {
        setError("Tap play to start the soundtrack when you are ready.");
        setIsPlaying(false);
      }
    };

    playAudio();
  }, [active, currentTrack]);

  const handlePlayToggle = async () => {
    const element = audioRef.current;
    if (!element) {
      return;
    }

    if (isPlaying) {
      element.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await element.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setError("Playback blocked. Interact with the page and try again.");
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
        <h3 className="text-lg font-semibold text-white">{currentTrack.title}</h3>
        <p className="text-sm text-slate-200/70">{currentTrack.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlayToggle}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          {error ? (
            <span className="text-xs text-amber-300">{error}</span>
          ) : (
            <span className="text-xs text-emerald-200/80">
              {isPlaying ? "Playing" : "Ready"}
            </span>
          )}
        </div>
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="auto"
          loop
          className="hidden"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => setCurrentTrack(track)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              currentTrack.id === track.id
                ? "border-white/40 bg-white/15 text-white"
                : "border-white/5 bg-white/5 text-slate-200/80 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <p className="text-sm font-medium">{track.title}</p>
            <p className="text-xs text-slate-200/70">{track.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
