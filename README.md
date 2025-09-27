# CalmCube

CalmCube is a heart-rate responsive relaxation assistant built with the Next.js App Router, Tailwind CSS, and Framer Motion. It demonstrates how real-time biometric input can instantly adapt a wellness experience across guided breathing, ambient soundscapes, and supportive chat.

## Highlights

- **Single heart-rate entry** drives the entire experience: values are clamped to a 40–180 bpm demo range and mapped to one of three calming modes.
- **Animated cube visualizer** shifts color, rotation, and glow to reflect the active mode and current heart rate.
- **Mode-specific modules**
  - Breathing sessions inspired by Apple Watch pacing with a 60-second loop and progress halo.
  - Ambient audio player with local loops plus an optional YouTube lofi radio stream.
  - GPT-backed chat window with optional voice input via the Web Speech API (Chrome recommended).
- **Session history** persists locally so stakeholders can replay recent demos, including optional calmness feedback scores.
- **Ambient toggle** floats on the UI, giving quick control over looping audio without leaving the flow.

## Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/docs/app)
- [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- TypeScript throughout

## Quick Start

```bash
npm install
npm run dev
```

The development server boots on `http://localhost:3000`.

### Enable AI Chat

1. Duplicate `.env.local.example` to `.env.local` (or create it) and add your OpenAI key:
   ```bash
   OPENAI_API_KEY=sk-...
   ```
2. Restart `npm run dev` so Next.js picks up the new environment variable.
3. The chat module now proxies requests through `/api/chat`, which forwards to OpenAI's `gpt-4o-mini` with a calming system prompt. Voice capture relies on the browser's Speech Recognition API, so Chrome or Edge is recommended for demos.

### Demo Script

1. Input **115** → The cube turns red and the guided breathing module animates.
2. Input **90** → The cube shifts blue and the ambient soundscape player starts.
3. Input **70** → The cube transitions green and the supportive chat window opens.

## Available Scripts

- `npm run dev` – Start the Next.js dev server with hot reloading.
- `npm run build` – Produce an optimized production build.
- `npm run start` – Serve the production build locally.
- `npm run lint` – Run ESLint with the Next.js shareable config.

## Project Layout

```
src/
  app/                      // App Router entry point and page shell
  features/
    ambient/                // Floating ambient toggle
    breathing/              // Guided breathing module
    chat/                   // GPT-backed supportive chat UI
    cube/                   // Heart-rate visualizer cube
    feedback/               // Calmness feedback form
    heart-rate/             // Heart-rate analysis helpers
    history/                // Session log hook and list UI
    music/                  // Ambient audio player
    onboarding/             // Welcome overlay
public/
  audio/                    // Placeholder ambient loops shipped for the demo
```

## Audio Notes

- Two placeholder loops live at `public/audio/lofi-1.wav` and `public/audio/lofi-2.wav`. Swap in your own WAV/MP3 files and update `src/features/music/MusicPlayer.tsx` or `src/features/ambient/AmbientToggle.tsx` if filenames change.
- The YouTube embed depends on browser autoplay policies. If it remains paused or muted, click once inside the player to grant playback permission.

## Optional Backend Experiments

CalmCube currently analyzes heart rate on the client. If you want to offload logic to a backend (e.g., FastAPI), expose endpoints such as:

- `POST /analyze_hr` → Returns `{ mode: "breathing" | "music" | "chat" }`
- `POST /log_session` → Accepts `{ heartRate, mode, stressScore }`

Then replace the client-side `analyzeHeartRate` call with a `fetch` request to your service.

## Testing Ideas

The MVP ships without automated tests. For production use, consider:

- Component tests with React Testing Library for mode transitions.
- Integration or end-to-end flows with Playwright/Cypress to validate the demo script.
- Mocking OpenAI responses to exercise the chat API route offline.

## License

MIT
