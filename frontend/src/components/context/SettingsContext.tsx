"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface SettingsContextType {
  arabicFontSize: number;
  setArabicFontSize: (val: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (val: number) => void;
  arabicFontFace: string;
  setArabicFontFace: (val: string) => void;
  isMobileSettingsOpen: boolean;
  setIsMobileSettingsOpen: (val: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to read saved settings from localStorage
function getSavedSettings() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("quranSettings");
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default to dark mode (the app is dark-first)
  const [arabicFontSize, setArabicFontSize] = useState<number>(22);
  const [translationFontSize, setTranslationFontSize] = useState<number>(16);
  const [arabicFontFace, setArabicFontFace] = useState<string>("KFGQ");
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Load settings after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = getSavedSettings();
    if (saved) {
      if (saved.arabicFontSize) setArabicFontSize(saved.arabicFontSize);
      if (saved.translationFontSize) setTranslationFontSize(saved.translationFontSize);
      if (saved.arabicFontFace) setArabicFontFace(saved.arabicFontFace);
      if (saved.isDarkMode !== undefined) setIsDarkMode(saved.isDarkMode);
    }
  }, []);

  // Apply the dark class on first render
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("quranSettings", JSON.stringify({
      arabicFontSize,
      translationFontSize,
      arabicFontFace,
      isDarkMode,
    }));
  }, [arabicFontSize, translationFontSize, arabicFontFace, isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        arabicFontSize,
        setArabicFontSize,
        translationFontSize,
        setTranslationFontSize,
        arabicFontFace,
        setArabicFontFace,
        isMobileSettingsOpen,
        setIsMobileSettingsOpen,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

