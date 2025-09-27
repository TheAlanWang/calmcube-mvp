"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Track =
  | {
      id: string;
      type: "local";
      title: string;
      duration: string;
      src: string;
    }
  | {
      id: string;
      type: "youtube";
      title: string;
      duration: string;
      youtubeId: string;
    };

const tracks: Track[] = [
  {
    id: "lofi-1",
    type: "local",
    title: "Aurora Breaths",
    duration: "8m loop",
    src: "/audio/lofi-1.wav"
  },
  {
    id: "lofi-2",
    type: "local",
    title: "Gentle Horizon",
    duration: "8m loop",
    src: "/audio/lofi-2.wav"
  },
  {
    id: "yt-lofi",
    type: "youtube",
    title: "lofi hip hop radio",
    duration: "YouTube live stream",
    youtubeId: "jfKfPfyJRdk"
  }
];

export function AmbientToggle() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(tracks[0]?.id ?? "");
  const [volume, setVolume] = useState(0.4);
  const [youtubeAutoplayKey, setYoutubeAutoplayKey] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? tracks[0],
    [currentTrackId]
  );

  useEffect(() => {
    if (!audioRef.current || currentTrack?.type !== "local") {
      return;
    }
    audioRef.current.volume = volume;
  }, [volume, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (currentTrack?.type !== "local") {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }

    const play = async () => {
      try {
        await audioRef.current?.play();
      } catch (error) {
        setIsPlaying(false);
      }
    };

    play();
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const togglePlayback = async () => {
    if (currentTrack?.type === "youtube") {
      setIsPanelOpen(true);
      setYoutubeAutoplayKey((prev) => prev + 1);
      return;
    }

    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPanelOpen(true);
    }
  };

  const handleTrackChange = (trackId: string) => {
    setCurrentTrackId(trackId);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (trackId === "yt-lofi") {
      setIsPanelOpen(true);
      setYoutubeAutoplayKey((prev) => prev + 1);
    }
  };

  const primaryButtonLabel = currentTrack?.type === "youtube"
    ? "Play YouTube Stream"
    : isPlaying
      ? "Pause Calm Sound"
      : "Play Calm Sound";

  return (
    <div className="pointer-events-auto">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
            currentTrack?.type === "youtube"
              ? "bg-red-400/80 text-red-950 hover:bg-red-300/90"
              : isPlaying
                  ? "bg-emerald-400/80 text-emerald-950 hover:bg-emerald-300/90"
                  : "bg-white/15 text-white hover:bg-white/25"
          }`}
        >
          {primaryButtonLabel}
        </button>
        <button
          type="button"
          onClick={() => setIsPanelOpen((prev) => !prev)}
          className="rounded-full bg-white/10 px-3 py-2 text-xs text-slate-100 transition hover:bg-white/20"
          aria-expanded={isPanelOpen}
        >
          {isPanelOpen ? "Hide" : "Tracks"}
        </button>
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-3 w-72 max-w-xs rounded-3xl border border-white/10 bg-slate-900/90 p-4 text-xs text-slate-200 shadow-lg backdrop-blur"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">Track</p>
            <ul className="mt-2 space-y-2">
              {tracks.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => handleTrackChange(track.id)}
                    className={`w-full rounded-2xl px-3 py-2 text-left transition ${
                      currentTrack?.id === track.id
                        ? "bg-emerald-400/20 text-emerald-100"
                        : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-medium">{track.title}</p>
                    <p className="text-[0.65rem] text-slate-300/70">{track.duration}</p>
                  </button>
                </li>
              ))}
            </ul>

            {currentTrack?.type === "local" && (
              <div className="mt-3">
                <label className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">
                  Volume
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            )}

            {currentTrack?.type === "youtube" && (
              <div className="mt-4 space-y-2">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <iframe
                    key={youtubeAutoplayKey}
                    src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1`}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-44 w-full"
                  />
                </div>
                <p className="text-[0.65rem] text-slate-400/80">
                  If the stream stays paused, click inside the player to allow autoplay in your browser.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {currentTrack?.type === "local" && (
        <audio ref={audioRef} src={currentTrack.src} loop preload="auto" />
      )}
    </div>
  );
}
