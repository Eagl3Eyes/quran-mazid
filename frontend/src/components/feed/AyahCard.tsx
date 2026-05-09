"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, BookOpen, Bookmark, MoreVertical, MoreHorizontal, Copy, Link, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/components/context/SettingsContext";
import { useAudio } from "@/components/audio/AudioContext";

import { Verse } from "@/types";

interface AyahCardProps {
  surahId: number;
  verse: Verse;
}

const toArabicNumber = (num: number) => 
  num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d as any]);

export const AyahCard = ({ surahId, verse }: AyahCardProps) => {
  const { arabicFontSize, translationFontSize, arabicFontFace } = useSettings();
  const { currentVerseId, isPlaying, playVerse, pause, resume } = useAudio();
  
  const isCurrentPlaying = currentVerseId === verse.id;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Left Column / Mobile Top Row */}
      <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 md:w-[50px] shrink-0 pt-1 w-full">
        <span className="text-[11px] md:text-xs font-bold text-[var(--primary-green)] tracking-wider">
          {surahId}:{verse.id}
        </span>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex flex-col gap-4 mt-2">
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

        {/* Mobile 3-dots */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors cursor-pointer"
        >
          <MoreHorizontal size={20}/>
        </button>
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

      {/* Mobile Bottom Sheet Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--surface-secondary)] rounded-t-3xl z-50 md:hidden pb-8 pt-4 px-2 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-[var(--border)]/20 rounded-full mx-auto mb-4" />
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => {
                    handlePlayClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 p-4 text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors text-left"
                >
                  {isCurrentPlaying && isPlaying ? <Pause size={20} className="text-[var(--text-secondary)]" /> : <Play size={20} className="text-[var(--text-secondary)]" />}
                  <span className="text-sm font-medium text-[var(--text-primary)]/80">Play</span>
                </button>
                <button className="flex items-center gap-4 p-4 text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors text-left">
                  <BookOpen size={20} className="text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]/80">Tafsir</span>
                </button>
                <button className="flex items-center gap-4 p-4 text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors text-left">
                  <Bookmark size={20} className="text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]/80">Bookmark</span>
                </button>
                <button className="flex items-center gap-4 p-4 text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors text-left">
                  <Copy size={20} className="text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]/80">Ayah Copy</span>
                </button>
                <button className="flex items-center gap-4 p-4 text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors text-left">
                  <Link size={20} className="text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]/80">Copy Link</span>
                </button>
                <button className="flex items-center gap-4 p-4 text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors text-left">
                  <Share2 size={20} className="text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]/80">Ayah Share</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
