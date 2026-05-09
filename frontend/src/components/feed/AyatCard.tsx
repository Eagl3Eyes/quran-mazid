"use client";

import React, { useRef, useEffect } from "react";
import { Play, Pause, BookOpen, Bookmark, MoreVertical } from "lucide-react";
import { useSettings } from "@/components/context/SettingsContext";
import { useAudio } from "@/components/audio/AudioContext";

import { Verse } from "@/types";

interface AyatCardProps {
  surahId: number;
  verse: Verse;
}

const toArabicNumber = (num: number) => 
  num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d as any]);

export const AyatCard = ({ surahId, verse }: AyatCardProps) => {
  const { arabicFontSize, translationFontSize, arabicFontFace } = useSettings();
  const { currentVerseId, isPlaying, playVerse, pause, resume } = useAudio();
  
  const isCurrentPlaying = currentVerseId === verse.id;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrentPlaying && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isCurrentPlaying]);

  const handlePlayClick = () => {
    if (isCurrentPlaying) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      playVerse(surahId, verse.id);
    }
  };

  const getFontFamily = () => {
    if (arabicFontFace.startsWith("var(")) {
      return arabicFontFace;
    }
    return `"${arabicFontFace}", serif, var(--font-amiri-quran)`;
  };

  const IconButton = ({ icon: Icon, tooltip, onClick }: any) => (
    <div className="relative group flex items-center justify-center">
      <button
        onClick={onClick}
        className="cursor-pointer p-2 text-[var(--text-secondary)] transition-colors rounded-full bg-[var(--surface-secondary)]"
      >
        <Icon size={20} />
      </button>
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[12px] px-2 py-1 opacity-0 scale-95 transition-all group-hover:opacity-100 group-hover:scale-100 z-10 hidden md:block">
        {tooltip}
      </span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col md:flex-row gap-3 md:gap-4 px-4 md:px-5 p-3 md:py-4 border-b border-[var(--border)]/5 transition-colors scroll-mt-24 ${
        isCurrentPlaying ? "" : ""
      }`}
    >
      {/* Left Column (Actions) */}
      <div className="flex flex-col items-center gap-4 w-[50px] shrink-0 pt-1">
        <span className="text-[11px] md:text-xs font-bold text-[var(--primary-green)] tracking-wider">
          {surahId}:{verse.id}
        </span>
        <div className="flex flex-col gap-4 mt-2">
          <button onClick={handlePlayClick} className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors cursor-pointer">
            {isCurrentPlaying && isPlaying ? <Pause size={20}/> : <Play size={20}/>}
          </button>
          <button className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors cursor-pointer">
            <BookOpen size={20}/>
          </button>
          <button className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors cursor-pointer">
            <Bookmark size={20}/>
          </button>
          <button className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors cursor-pointer">
            <MoreVertical size={20}/>
          </button>
        </div>
      </div>

      {/* Right Column - Arabic & Translation */}
      <div className="flex-1 flex flex-col gap-4 pt-2">
        <div
          dir="rtl"
          style={{
            fontSize: `${arabicFontSize}px`,
            fontFamily: getFontFamily(),
            lineHeight: "2.2",
          }}
          className={`pb-4 text-right ${
            isCurrentPlaying ? "text-[var(--primary-green)]" : "text-[var(--text-primary)]/90"
          } transition-colors duration-300`}
        >
          {verse.text}
          <span className="relative inline-flex items-center justify-center mx-4 translate-y-[2px] select-none">
            <span 
              className="text-[1.3em] leading-none opacity-90" 
              style={{ fontFamily: "'KFGQ', serif" }}
            >
              ۝
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-[0.45em] pt-[1px] font-sans font-bold">
              {toArabicNumber(verse.id)}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] md:text-xs font-bold text-[var(--text-secondary)]/60 uppercase tracking-[0.1em]">
            SAHEEH INTERNATIONAL
          </span>
          <div
            style={{ fontSize: `${translationFontSize}px`, lineHeight: "1.6" }}
            className="text-[var(--text-primary)]/80 leading-relaxed w-full"
          >
            {verse.translation}
          </div>
        </div>
      </div>
    </div>
  );
};
