import React, { useState, useEffect } from "react";
import { useSettings } from "@/components/context/SettingsContext";
import { useAudio } from "@/components/audio/AudioContext";
import { X, ChevronDown, ChevronUp, BookOpenText, Headset } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Reciter {
  id: number;
  reciter_name: string;
  style: string;
}

export const RightPanel = () => {
  const {
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    arabicFontFace,
    setArabicFontFace,
    isMobileSettingsOpen,
    setIsMobileSettingsOpen,
  } = useSettings();

  const sliderStyle = `
    .custom-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 5px;
      outline: none;
    }
    .custom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-green);
      cursor: pointer;
      border: 2px solid var(--primary-green);
      box-shadow: 0 0 2px rgba(0,0,0,0.2);
    }
    .custom-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-green);
      cursor: pointer;
      border: 2px solid var(--primary-green);
    }
  `;

  const [activeTab, setActiveTab] = useState<"Translation" | "Reading">("Translation");
  const [currentView, setCurrentView] = useState<"main" | "font-face" | "reciters">("main");
  const [expandedSection, setExpandedSection] = useState<"reading" | "font" | "mushaf" | "audio" | null>("font");

  // Tab switching animation
  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleTabChange = (tab: "Translation" | "Reading") => {
    if (tab === activeTab) return;
    setDirection(tab === "Reading" ? 1 : -1);
    setActiveTab(tab);
    setExpandedSection(tab === "Reading" ? "mushaf" : "font");
    setCurrentView("main"); // Reset view on tab change
  };

  const drillDownVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" as const }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" as const }
    })
  };

  const [drillDirection, setDrillDirection] = useState(0);

  const navigateTo = (view: "main" | "font-face") => {
    setDrillDirection(view === "font-face" ? 1 : -1);
    setCurrentView(view);
  };

  const PanelContent = (
    <div className="flex flex-col h-full bg-[var(--surface)] border-l border-[var(--border)]/10 w-full max-w-sm ml-auto">
      <style dangerouslySetInnerHTML={{ __html: sliderStyle }} />
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] xl:hidden">
        <h2 className="text-[var(--text-primary)] font-semibold">Settings</h2>
        <button
          onClick={() => setIsMobileSettingsOpen(false)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <div className="flex rounded-full bg-[var(--surface-secondary)] p-1 text-sm font-medium text-[var(--text-secondary)]">
          {["Translation", "Reading"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as any)}
              className={`cursor-pointer relative flex-1 py-1.5 px-4 text-sm font-medium transition-colors z-10 ${activeTab === tab
                  ? "text-[var(--text-primary)] font-bold"
                  : "text-[var(--text-secondary)]/60"
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab-settings"
                  className="absolute inset-0 rounded-full bg-[var(--background)] shadow-sm z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false} custom={drillDirection}>
          {currentView === "main" ? (
            <motion.div
              key="main"
              custom={drillDirection}
              variants={drillDownVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 overflow-y-auto p-4 hide-scrollbar flex flex-col gap-6"
            >
              <AnimatePresence mode="wait" custom={direction}>
                {activeTab === "Translation" && (
                  <motion.div
                    key="Translation"
                    custom={direction}
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-6"
                  >
                    {/* Reading Settings Dropdown */}
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => setExpandedSection(expandedSection === "reading" ? null : "reading")}
                        className={`flex items-center justify-between text-sm cursor-pointer group transition-colors ${expandedSection === "reading" ? "text-[var(--primary-green)]" : "text-[var(--text-secondary)]"
                          }`}
                      >
                        <div className="flex items-center gap-2 group-hover:text-[var(--text-primary)] transition-colors">
                          <BookOpenText className="w-5 h-5" />
                          <span className="font-bold">Reading Settings</span>
                        </div>
                        <motion.div animate={{ rotate: expandedSection === "reading" ? 0 : -90 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedSection === "reading" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-5 py-2">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Translations</label>
                                <div className="relative">
                                  <select className="w-full appearance-none bg-[var(--surface-secondary)] border border-[var(--border)]/10 text-[var(--text-primary)] rounded-xl p-3 text-xs outline-none focus:border-(--primary-green)/40 cursor-pointer">
                                    <option>Saheeh International</option>
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" size={14} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Word-by-word</label>
                                <div className="relative">
                                  <select className="w-full appearance-none bg-[var(--surface-secondary)] border border-[var(--border)]/10 text-[var(--text-primary)] rounded-xl p-3 text-xs outline-none focus:border-(--primary-green)/40 cursor-pointer">
                                    <option>Bengali</option>
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" size={14} />
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-[var(--text-primary)] font-medium bg-[var(--surface-secondary)] p-3 rounded-xl border border-[var(--border)]/10">
                                <span>Show by words</span>
                                <button className="w-8 h-4.5 bg-[var(--primary-green)] rounded-full flex items-center p-0.5 justify-end cursor-pointer transition-colors shadow-inner">
                                  <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Font Settings Dropdown */}
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => setExpandedSection(expandedSection === "font" ? null : "font")}
                        className={`flex items-center justify-between text-sm cursor-pointer group transition-colors ${expandedSection === "font" ? "text-[var(--primary-green)]" : "text-[var(--text-primary)]"
                          }`}
                      >
                        <div className="flex items-center gap-2 group-hover:text-[var(--primary-green)] transition-colors">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${expandedSection === "font" ? "bg-[var(--primary-green)] text-white" : "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
                            }`}>
                            <span className="text-[12px] font-bold">T</span>
                          </div>
                          <span className="font-bold">Font Settings</span>
                        </div>
                        <motion.div animate={{ rotate: expandedSection === "font" ? 0 : -90 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedSection === "font" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-6 py-2">
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[var(--text-primary)] text-sm font-bold">Arabic Font Size</span>
                                  <span className="text-[var(--primary-green)] font-bold text-sm">{arabicFontSize}</span>
                                </div>
                                <input
                                  type="range"
                                  min="18"
                                  max="100"
                                  value={arabicFontSize}
                                  onChange={(e) => setArabicFontSize(Number(e.target.value))}
                                  className="custom-slider cursor-pointer"
                                  style={{
                                    "--range-percent": `${(arabicFontSize - 18) / (100 - 18) * 100}%`,
                                    background: `linear-gradient(to right, var(--primary-green) 0%, var(--primary-green) var(--range-percent), var(--surface-secondary) var(--range-percent), var(--surface-secondary) 100%)`
                                  } as React.CSSProperties}
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[var(--text-primary)] text-sm font-bold">Translation Font Size</span>
                                  <span className="text-[var(--primary-green)] font-bold text-sm">{translationFontSize}</span>
                                </div>
                                <input
                                  type="range"
                                  min="14"
                                  max="44"
                                  value={translationFontSize}
                                  onChange={(e) => setTranslationFontSize(Number(e.target.value))}
                                  className="custom-slider cursor-pointer"
                                  style={{
                                    "--range-percent": `${(translationFontSize - 14) / (44 - 14) * 100}%`,
                                    background: `linear-gradient(to right, var(--primary-green) 0%, var(--primary-green) var(--range-percent), var(--surface-secondary) var(--range-percent), var(--surface-secondary) 100%)`
                                  } as React.CSSProperties}
                                />
                              </div>

                              <div className="flex flex-col gap-3">
                                <span className="text-[var(--text-primary)] text-sm font-bold">Arabic Font Face</span>
                                <button
                                  onClick={() => navigateTo("font-face")}
                                  className="flex items-center justify-between p-4 bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)]/80 rounded-xl transition-all group cursor-pointer"
                                >
                                  <span className="text-sm font-semibold text-[var(--text-primary)]/80">
                                    {arabicFontFace === "var(--font-amiri-quran)" ? "Amiri Quran" :
                                      arabicFontFace === "KFGQ" ? "KFGQ" : "PDMS Islamic"}
                                  </span>
                                  <div className="flex items-center text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors">
                                    <ChevronDown size={16} className="-rotate-90" />
                                  </div>
                                </button>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Support Box */}
                    <div className="mt-4 p-5 bg-[#eff6ed] dark:bg-[var(--primary-green)]/5 rounded-2xl border border-[var(--primary-green)]/10 flex flex-col gap-4 relative overflow-hidden group">
                      <h3 className="text-[var(--text-primary)] font-bold text-lg leading-tight">Help spread the knowledge of Islam</h3>
                      <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed relative z-10 font-medium">
                        Your regular support helps us reach our religious brothers and sisters with the message of Islam. Join our mission and be part of the big change.
                      </p>
                      <button className="w-full py-3.5 bg-[var(--primary-green)] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:bg-[var(--primary-green)]/90 transition-all active:scale-95 cursor-pointer">
                        Support Us
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "Reading" && (
                  <motion.div
                    key="Reading"
                    custom={direction}
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => setExpandedSection(expandedSection === "mushaf" ? null : "mushaf")}
                        className={`flex items-center justify-between text-sm cursor-pointer group transition-colors ${expandedSection === "mushaf" ? "text-[var(--primary-green)]" : "text-[var(--text-secondary)]"
                          }`}
                      >
                        <div className="flex items-center gap-2 group-hover:text-[var(--text-primary)] transition-colors">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${expandedSection === "mushaf" ? "bg-[var(--primary-green)] text-white" : "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
                            }`}>
                            <span className="text-[12px] font-bold">T</span>
                          </div>
                          <span className="font-bold">Change Mushaf</span>
                        </div>
                        <motion.div animate={{ rotate: expandedSection === "mushaf" ? 0 : -90 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedSection === "mushaf" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-4 py-2">
                              {[
                                { id: "unicode", name: "Unicode Text Mushaf" },
                                { id: "hafezi", name: "Hafezi Quran Mushaf" },
                                { id: "madani", name: "New Madani Mushaf" },
                                { id: "nurani", name: "Nurani Mushaf" }
                              ].map((mushaf) => (
                                <div 
                                  key={mushaf.id} 
                                  className={`flex flex-col gap-3 p-4 bg-[var(--surface-secondary)] rounded-2xl border border-[var(--border)]/10 hover:border-[var(--primary-green)]/30 transition-all cursor-pointer group ${
                                    mushaf.id === "unicode" ? "ring-1 ring-[var(--primary-green)]/30" : ""
                                  }`}
                                  onClick={() => {}} // Handle mushaf change
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      mushaf.id === "unicode" ? "border-[var(--primary-green)]" : "border-[var(--text-secondary)]/30"
                                    }`}>
                                      {mushaf.id === "unicode" && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-green)]" />
                                      )}
                                    </div>
                                    <span className={`text-sm font-bold ${
                                      mushaf.id === "unicode" ? "text-[var(--primary-green)]" : "text-[var(--text-primary)]"
                                    }`}>
                                      {mushaf.name}
                                    </span>
                                  </div>
                                  
                                  {/* Preview Box */}
                                  <div className="w-full h-24 bg-[var(--background)] rounded-xl overflow-hidden border border-[var(--border)]/10 p-2 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="w-full h-full relative">
                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] text-[10px] font-serif">
                                        {mushaf.id === "unicode" ? (
                                          <div className="text-center px-4 leading-relaxed text-[var(--text-primary)]/70">
                                            بسم الله الرحمن الرحيم<br/>
                                            الم ذلك الكتاب لا ريب فيه هدى للمتقين
                                          </div>
                                        ) : (
                                          <div className="w-full h-full bg-[var(--surface-secondary)]/50 rounded flex items-center justify-center border border-dashed border-[var(--border)]/20">
                                            {mushaf.name} Preview
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <>
              {/* Drill-down Sub-view (Font Face) */}
              {currentView === "font-face" && (
                <motion.div
                  key="font-face"
                  custom={drillDirection}
                  variants={drillDownVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 p-4 flex flex-col gap-6"
                >
                  <button
                    onClick={() => navigateTo("main")}
                    className="flex items-center gap-2 text-sm font-semibold text-[var(--primary-green)] hover:translate-x-[-4px] transition-transform cursor-pointer"
                  >
                    <ChevronDown size={20} className="rotate-90" />
                    Select Font Face
                  </button>

                  <div className="flex flex-col gap-6">
                    {/* Font Tabs */}
                    <div className="flex p-1 bg-[var(--surface-secondary)] rounded-full">
                      {["Uthmani", "Indopak"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {}} 
                          className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
                            tab === "Uthmani" ? "bg-[var(--background)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar max-h-[60vh]">
                      {[
                        { id: "KFGQ", name: "KFGQ" },
                        { id: "KFGQ V2", name: "KFGQ V2" },
                        { id: "Me Quran", name: "Me Quran" },
                        { id: "Al Mushaf", name: "Al Mushaf" },
                        { id: "PDMS Saleem Quran", name: "PDMS Saleem Quran" },
                        { id: "PDMS-Islamic", name: "PDMS Islamic" },
                        { id: "Al Qalam Quran Majeed", name: "Al Qalam Quran Majeed" },
                        { id: "var(--font-amiri-quran)", name: "Amiri Quran" }
                      ].map((font) => {
                        const isActive = arabicFontFace === font.id;
                        return (
                          <button
                            key={font.id}
                            onClick={() => {
                              setArabicFontFace(font.id);
                            }}
                            className={`flex items-center justify-between w-full p-4 rounded-xl transition-all cursor-pointer text-left ${
                              isActive ? "bg-[var(--surface-secondary)] text-[var(--primary-green)]" : "text-[var(--text-primary)]/80 hover:bg-[var(--surface-secondary)]/50"
                            }`}
                          >
                            <span className="text-sm font-bold">{font.name}</span>
                            {isActive && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden xl:block w-80 h-full shrink-0">
        <div className="h-full">
          {PanelContent}
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSettingsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-80 max-w-[85vw] h-full z-50 xl:hidden"
            >
              {PanelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
