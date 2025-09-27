"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "ai" | "user" | "system";
  content: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "ai",
    content: "You’re safe. Want to share more?"
  }
];

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  item(index: number): SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    setIsSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim.trim());

      if (finalTranscript.trim()) {
        setDraft((prev) => {
          if (!prev) {
            return finalTranscript.trim();
          }
          return `${prev} ${finalTranscript.trim()}`.replace(/\s+/g, " ");
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      switch (event.error) {
        case "not-allowed":
          setSpeechError("Microphone access was blocked. Allow permissions to try again.");
          break;
        case "no-speech":
          setSpeechError("No speech detected. Try speaking louder or closer to the mic.");
          break;
        default:
          setSpeechError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = draft.trim();
    if (!next || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: next
    };

    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setDraft("");
    setInterimTranscript("");
    setSpeechError(null);
    setChatError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: conversation.map(({ id, ...rest }) => rest)
        })
      });

      let data: { reply?: string; error?: string } | null = null;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error("Received an invalid response from CalmCube chat");
      }

      if (!response.ok) {
        throw new Error(data?.error ?? "CalmCube companion is unavailable");
      }

      const reply = data?.reply?.trim();
      if (!reply) {
        throw new Error("CalmCube companion did not return a message");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: reply
        }
      ]);
    } catch (error) {
      console.error("Chat submission failed", error);
      const fallbackMessage =
        "I’m having trouble connecting right now. Let’s pause, breathe slowly, and try again soon.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: fallbackMessage
        }
      ]);
      setChatError(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!isSpeechSupported || !recognition) {
      setSpeechError("Voice input isn’t supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      setSpeechError(null);
      setInterimTranscript("");
      recognition.start();
      setIsListening(true);
    } catch (error) {
      setSpeechError("Unable to access the microphone. Make sure it’s not in use elsewhere.");
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="h-64 overflow-y-auto rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5 shadow-inner">
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow ${
                message.role === "ai"
                  ? "self-start bg-emerald-400/20 text-emerald-50"
                  : "self-end bg-white/20 text-slate-900"
              }`}
            >
              {message.content}
            </li>
          ))}
          {isLoading && (
            <li className="self-start rounded-2xl bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 shadow">
              CalmCube is listening…
            </li>
          )}
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Speak or type how you’re feeling…"
              disabled={isLoading}
            />
            {interimTranscript && (
              <div className="pointer-events-none absolute left-0 right-0 top-full mt-1 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
                Listening: {interimTranscript}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isListening
                ? "bg-amber-400 text-amber-950 hover:bg-amber-300"
                : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            }`}
            aria-pressed={isListening}
            disabled={isLoading}
          >
            {isListening ? "Stop" : "🎤"}
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Sending" : "Send"}
          </button>
        </div>
        {speechError && <p className="text-xs text-amber-300">{speechError}</p>}
        {chatError && <p className="text-xs text-amber-300">{chatError}</p>}
        {!isSpeechSupported && (
          <p className="text-xs text-slate-400">
            Voice input isn’t available in this browser. Switch to Chrome/Edge or configure the GPT API
            speech backend.
          </p>
        )}
      </form>
    </div>
  );
}
