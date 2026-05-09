"use client";

import React from "react";
import { Play, Pause, SkipForward, SkipBack, X, MoreHorizontal } from "lucide-react";
import { useAudio } from "./AudioContext";

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const AudioPlayer = () => {
  const { isPlaying, currentVerseId, pause, resume, stop, error, audioError, elapsedTime, totalDuration } = useAudio();

  if (currentVerseId === null && !error && !audioError) {
    return null; 
  }

  return (
    <div className="relative w-full shrink-0 z-40 bg-[var(--surface-secondary)] px-4 md:px-8 py-3 flex items-center justify-between text-white shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      {/* Track Info */}
      <div className="hidden md:block flex items-center gap-4 w-1/4">
        {currentVerseId !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-100/80">Al Baqarah : {currentVerseId}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full flex items-center gap-3 text-xs text-zinc-500 font-mono">
          <div className="h-1 flex-1 bg-[var(--surface)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--primary-green)] rounded-full transition-all duration-300 ease-linear"
              style={{ width: `${totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0}%` }}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-[var(--primary-green)] rounded-full shadow" />
    
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-10">
          <span className="text-xs md:text-sm text-zinc-400">{formatTime(elapsedTime)}</span>
          <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <MoreHorizontal size={20} />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={isPlaying ? pause : resume}
            className="w-10 h-10 rounded-full bg-[var(--primary-green)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          
          <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <SkipForward size={20} />
          </button>
          <button onClick={stop} className="text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label="Close Player">
          <X size={20} />
        </button>
        
          <span className="text-xs md:text-sm text-zinc-400">{formatTime(totalDuration)}</span>
        </div>
        
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex justify-end w-1/4 gap-4 items-center">
        {/*  */}
      </div>

      {/* Errors */}
      {(error || audioError) && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-900/90 text-white px-4 py-1 rounded text-xs shadow-lg">
          {error || audioError}
        </div>
      )}
    </div>
  );
};
