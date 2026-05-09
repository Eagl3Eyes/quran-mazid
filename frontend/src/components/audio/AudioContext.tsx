"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface AudioContextType {
  isPlaying: boolean;
  currentVerseId: number | null;
  error: string | null;
  audioError: string | null;
  playVerse: (surahId: number, startVerseId: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  totalDuration: number;
  elapsedTime: number;
  currentIndex: number;
  audioUrls: string[];
  reciterId: number;
  setReciterId: (id: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [startVerse, setStartVerse] = useState<number | null>(null);
  const [durations, setDurations] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [reciterId, setReciterId] = useState<number>(7); // Default to Mishary Rashid Alafasy
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentVerseId = currentIndex >= 0 ? currentIndex + 1 : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= audioUrls.length) {
          setIsPlaying(false);
          return prev;
        }
        return nextIndex;
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audio) {
        // Only update state if the difference is significant enough to matter for the UI
        // or just update it but we memoized the derived values now.
        // To really optimize, we could throttle this.
        setCurrentTime(audio.currentTime);
      }
    };
    const handleError = () => {
      setAudioError("Audio failed to load. Try another reciter or verse.");
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrls.length]);

  useEffect(() => {
    if (audioUrls.length === 0) {
      setDurations([]);
      return;
    }
    
    let isCancelled = false;
    const fetchDurations = async () => {
      const newDurations = new Array(audioUrls.length).fill(0);
      
      const promises = audioUrls.map((url, index) => {
        return new Promise<void>((resolve) => {
          const audio = new window.Audio(url);
          audio.preload = "metadata";
          audio.onloadedmetadata = () => {
            newDurations[index] = audio.duration;
            resolve();
          };
          audio.onerror = () => resolve();
        });
      });
      
      await Promise.all(promises);
      if (!isCancelled) {
        setDurations(newDurations);
      }
    };
    
    fetchDurations();
    return () => { isCancelled = true; };
  }, [audioUrls]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0 || currentIndex >= audioUrls.length) return;

    audio.src = audioUrls[currentIndex];
    audio.currentTime = 0;
    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [audioUrls, currentIndex]);

  const playVerse = async (surahId: number, startVerseId: number) => {
    setError(null);
    setAudioError(null);
    setIsPlaying(false);
    setAudioUrls([]);
    setCurrentIndex(-1);
    setStartVerse(startVerseId);

    try {
      const response = await fetch(
        `${API_URL}/audio?chapter=${surahId}&from=1&reciter=${reciterId}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Failed to load audio.");
        return;
      }

      const urls = Array.isArray(data?.audioUrls) ? data.audioUrls : [];
      if (urls.length === 0) {
        setError("No audio URLs returned.");
        return;
      }

      setAudioUrls(urls);
      setCurrentIndex(Math.max(0, startVerseId - 1));
    } catch {
      setError("Failed to load audio.");
    }
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    if (audioUrls.length > 0 && currentIndex >= 0) {
      audioRef.current?.play();
    }
  };

  const stop = () => {
    setIsPlaying(false);
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setAudioUrls([]);
    setCurrentIndex(-1);
    setCurrentTime(0);
    setDurations([]);
  };

  const totalDuration = useMemo(() => durations.reduce((a, b) => a + b, 0), [durations]);
  const elapsedTime = useMemo(() => 
    durations.slice(0, Math.max(0, currentIndex)).reduce((a, b) => a + b, 0) + currentTime,
    [durations, currentIndex, currentTime]
  );

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentVerseId,
        error,
        audioError,
        playVerse,
        pause,
        resume,
        stop,
        audioRef,
        currentTime,
        totalDuration,
        elapsedTime,
        currentIndex,
        audioUrls,
        reciterId,
        setReciterId,
      }}
    >
      {children}
      <audio ref={audioRef} preload="auto" />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
