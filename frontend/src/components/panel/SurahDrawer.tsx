"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/shared/icons";
import { X, Search, ChevronDown } from "lucide-react";

import { SurahIndexItem } from "@/types";
import { FeedQuery } from "@/components/layout/AppShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type TabKey = "surah" | "juz" | "page";

interface SurahDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeedQuery?: FeedQuery | null;
  onSurahSelect?: (surah: SurahIndexItem) => void;
  onJuzSelect?: (juzId: number) => void;
  onPageSelect?: (pageId: number) => void;
}

export const SurahDrawer = ({
  isOpen,
  onClose,
  activeFeedQuery,
  onSurahSelect,
  onJuzSelect,
  onPageSelect,
}: SurahDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("surah");
  const [surahs, setSurahs] = useState<SurahIndexItem[]>([]);
  const [juzs, setJuzs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [juzQuery, setJuzQuery] = useState("");
  const [pageQuery, setPageQuery] = useState("");
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const surahScrollRef = useRef<HTMLDivElement>(null);

  // Compute the active surah ID regardless of feed type
  const activeSurahId = useMemo(() => {
    if (!activeFeedQuery) return null;
    if (activeFeedQuery.type === 'surah') return activeFeedQuery.id;
    if (activeFeedQuery.type === 'page') {
      // Find which surah's page range includes this page
      const pageNum = activeFeedQuery.id;
      const s = surahs.find(x => x.pages && pageNum >= x.pages[0] && pageNum <= x.pages[1]);
      return s?.id ?? null;
    }
    if (activeFeedQuery.type === 'juz') {
      // Find the first surah in this juz
      const juz = juzs.find(j => j.juz_number === activeFeedQuery.id);
      if (juz) {
        const firstSurahId = Object.keys(juz.verse_mapping).map(Number)[0];
        return firstSurahId ?? null;
      }
    }
    return null;
  }, [activeFeedQuery, surahs, juzs]);

  // Compute active page number for auto-scroll
  const activePage = useMemo(() => {
    if (activeFeedQuery?.type === 'page') return activeFeedQuery.id;
    if (activeSurahId) {
      const s = surahs.find(x => x.id === activeSurahId);
      return s?.pages?.[0] ?? null;
    }
    return null;
  }, [activeFeedQuery, activeSurahId, surahs]);

  // Auto-scroll to active page when Page tab is shown
  useEffect(() => {
    if (activeTab === 'page' && activePage && pageScrollRef.current) {
      // Small delay to let the DOM render
      const timer = setTimeout(() => {
        const el = pageScrollRef.current?.querySelector(`[data-page="${activePage}"]`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, activePage]);

  // Auto-scroll to active surah when Surah tab is shown
  useEffect(() => {
    if (activeTab === 'surah' && activeSurahId && surahScrollRef.current) {
      const timer = setTimeout(() => {
        const el = surahScrollRef.current?.querySelector(`[data-surah="${activeSurahId}"]`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, activeSurahId]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "surah", label: "Surah" },
    { key: "juz", label: "Juz" },
    { key: "page", label: "Page" },
  ];

  const handleTabChange = (newTab: TabKey) => {
    if (newTab === activeTab) return;
    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    const newIndex = tabs.findIndex(t => t.key === newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? "30%" : "-30%",
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 200, damping: 25 },
        opacity: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-30%" : "30%",
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 200, damping: 25 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  useEffect(() => {
    let isMounted = true;

    async function loadSurahs() {
      try {
        const response = await fetch(`${API_URL}/surah`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Invalid content type");

        const data = (await response.json()) as SurahIndexItem[];
        if (isMounted && Array.isArray(data)) {
          setSurahs(data);
        }
      } catch (err) {
        console.error("Drawer loadSurahs failed", err);
        if (isMounted) {
          setSurahs([]);
        }
      }
    }

    async function loadJuzs() {
      try {
        const response = await fetch("https://api.quran.com/api/v4/juzs");
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        if (isMounted) {
          const uniqueJuzs = [];
          const seen = new Set();
          for (const j of data.juzs) {
            if (!seen.has(j.juz_number)) {
              seen.add(j.juz_number);
              uniqueJuzs.push(j);
            }
          }
          setJuzs(uniqueJuzs);
        }
      } catch (err) {
        console.error("Drawer loadJuzs failed", err);
      }
    }

    loadSurahs();
    loadJuzs();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeFeedQuery?.type === 'juz') {
      setExpandedJuz(activeFeedQuery.id);
    } else if (activeSurahId) {
      // Find which Juz contains this Surah
      const juz = juzs.find(j => {
        const surahIds = Object.keys(j.verse_mapping).map(Number);
        return surahIds.includes(activeSurahId);
      });
      if (juz) {
        setExpandedJuz(juz.juz_number);
      }
    }
  }, [activeFeedQuery, activeSurahId, juzs]);

  const filteredSurahs = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return surahs;
    return surahs.filter((surah) => 
      surah.transliteration.toLowerCase().includes(trimmed) ||
      surah.translation.toLowerCase().includes(trimmed) ||
      surah.name.toLowerCase().includes(trimmed) ||
      surah.id.toString().includes(trimmed)
    );
  }, [query, surahs]);

  const filteredJuzs = useMemo(() => {
    const trimmed = juzQuery.trim().toLowerCase();
    if (!trimmed) return juzs;
    return juzs.filter(j => 
      j.juz_number.toString().includes(trimmed) ||
      (surahs.find(s => Object.keys(j.verse_mapping).map(Number)[0] === s.id)?.transliteration.toLowerCase().includes(trimmed))
    );
  }, [juzQuery, juzs, surahs]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
    
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 z-60 flex h-full w-[320px] flex-col border-r border-(--border)/10 bg-[var(--background)] shadow-xl lg:static lg:z-10 lg:!transform-none lg:shadow-none max-lg:w-full lg:flex`}
      >
        <div className="lg:hidden flex items-start justify-between gap-3 p-6 pb-2">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-green)]">
              <img src="/logo.svg" alt="Logo" className="size-7 invert brightness-0" />
            </div>
            <div className="leading-tight">
              <p className="text-xl font-extrabold text-[var(--text-primary)]">
                Quran Mazid
              </p>
              <p className="text-[11px] font-medium text-[var(--primary-green)]/80">
                Read, Study, and Learn The Quran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close surah drawer"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex rounded-full bg-[var(--surface-secondary)] p-1 text-sm font-medium text-[var(--text-secondary)]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={` cursor-pointer relative flex-1 py-1.5 px-4 text-sm font-medium transition-colors z-10 ${
                  activeTab === tab.key
                    ? "text-[var(--text-secondary)] font-bold"
                    : "text-[var(--text-secondary)]/60"
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab-drawer"
                    className="absolute inset-0 rounded-full bg-[var(--background)] shadow-sm z-[-1]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {/* Surah List */}
            {activeTab === "surah" && (
              <motion.div
                key="surah"
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-1 flex-col gap-4 px-4 overflow-hidden h-full"
              >
                <label className="relative shrink-0">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search Surah"
                    className="w-full rounded-full bg-[var(--surface-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Search size={18} />
                  </span>
                </label>

                <div className="flex flex-1 flex-col overflow-hidden">
                  <div ref={surahScrollRef} className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                    <div className="space-y-3 pb-4">
                      {filteredSurahs.map((surah) => {
                        const isActive = activeSurahId === surah.id;
                        return (
                          <button
                            key={surah.id}
                            data-surah={surah.id}
                            type="button"
                            onClick={() => {
                              if (onSurahSelect) onSurahSelect(surah);
                              onClose();
                            }}
                            className={`cursor-pointer group flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-5 text-left transition-all duration-200  ${
                              isActive ? "border-[var(--primary-green)]/40 bg-[var(--primary-green)]/5 text-[var(--text-primary)]" : "border-[var(--border)]/10 hover:border-[var(--primary-green)]/20 hover:bg-[var(--surface-secondary)]/50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-8 w-8 rotate-45 items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-200 ${isActive ? "bg-[var(--primary-green)] text-white" : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] group-hover:bg-[var(--primary-green)] group-hover:text-white"}`}>
                                  <span className="-rotate-45">{surah.id}</span>
                                </div>
                              <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)] pb-2">{surah.transliteration}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{surah.translation}</p>
                              </div>
                            </div>
                            <div className="text-right text-base text-[var(--text-primary)] font-[var(--font-calligraphy)]">{surah.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "juz" && (
              <motion.div
                key="juz"
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-1 flex-col gap-4 px-4 overflow-hidden h-full"
              >
                <label className="relative shrink-0">
                  <input
                    value={juzQuery}
                    onChange={(event) => setJuzQuery(event.target.value)}
                    placeholder="Search Juz"
                    className="w-full rounded-full bg-[var(--surface-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Search size={18} />
                  </span>
                </label>
                <div className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                  <div className="space-y-3 pb-4">
                    {filteredJuzs.map((juz) => {
                      const isExpanded = expandedJuz === juz.juz_number;
                      const surahIds = Object.keys(juz.verse_mapping).map(Number);
                      const firstSurah = surahs.find(s => s.id === surahIds[0]);
                      const isActive = activeFeedQuery?.type === "juz" && activeFeedQuery.id === juz.juz_number;

                      return (
                        <div key={juz.id} className="flex flex-col gap-3 py-2 border-b border-[var(--border)]/5 last:border-0">
                          <button
                            onClick={() => setExpandedJuz(isExpanded ? null : juz.juz_number)}
                            className="cursor-pointer group flex w-full items-start justify-between text-left transition"
                          >
                            <div>
                              <p className="text-sm font-bold text-[var(--primary-green)] mb-1">Juz {juz.juz_number}</p>
                              <p className="text-xs text-[var(--text-secondary)] font-medium">{firstSurah?.transliteration} & More</p>
                            </div>
                            <div className="flex flex-col items-center text-[var(--text-secondary)]">
                              <span className="text-sm font-medium">{surahIds.length}</span>
                              <span className="text-xs">Surah</span>
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden flex flex-col gap-2 mt-2"
                              >
                                  {surahIds.map(surahId => {
                                    const s = surahs.find(x => x.id === surahId);
                                    if (!s) return null;
                                    const isSurahActive = activeSurahId === surahId;
                                    return (
                                      <button
                                        key={surahId}
                                        onClick={() => {
                                          if (onSurahSelect) onSurahSelect(s);
                                          onClose();
                                        }}
                                        className={`group flex w-full items-center gap-4 rounded-2xl p-3 transition-all duration-200 text-left cursor-pointer ${
                                          isSurahActive ? "bg-[var(--primary-green)]/10" : "hover:bg-[var(--surface-secondary)]/50"
                                        }`}
                                      >
                                        <div className={`flex h-9 w-9 rotate-45 items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-200 ${isSurahActive ? "bg-[var(--primary-green)] text-white" : "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"}`}>
                                          <span className="-rotate-45">{s.id}</span>
                                        </div>
                                        <div className="ml-2">
                                          <p className={`text-sm font-bold pb-1 transition-colors ${isSurahActive ? "text-[var(--primary-green)]" : "text-[var(--text-primary)]"}`}>{s.transliteration}</p>
                                          <p className="text-xs text-[var(--text-secondary)]">{s.translation}</p>
                                        </div>
                                      </button>
                                    );
                                  })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "page" && (
              <motion.div
                key="page"
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onAnimationComplete={() => {
                  if (activePage && pageScrollRef.current) {
                    const el = pageScrollRef.current.querySelector(`[data-page="${activePage}"]`);
                    if (el) {
                      el.scrollIntoView({ block: 'center', behavior: 'instant' });
                    }
                  }
                }}
                className="absolute inset-0 flex flex-1 flex-col gap-4 px-4 overflow-hidden h-full"
              >
                <label className="relative shrink-0">
                  <input
                    value={pageQuery}
                    onChange={(event) => setPageQuery(event.target.value)}
                    placeholder="Search Page"
                    className="w-full rounded-full bg-[var(--surface-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Search size={18} />
                  </span>
                </label>
                <div ref={pageScrollRef} className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                  <div className="space-y-3 pb-4">
                    {Array.from({ length: 604 }, (_, i) => i + 1).filter(p => !pageQuery || p.toString().includes(pageQuery)).map((page) => {
                       const isDirectActive = activeFeedQuery?.type === 'page' && activeFeedQuery.id === page;
                       // Highlight the start page of the currently reading surah
                       let isSurahStartPage = false;
                       if (activeSurahId) {
                         const s = surahs.find(x => x.id === activeSurahId);
                         if (s?.pages?.[0] === page) {
                           isSurahStartPage = true;
                         }
                       }
                       const isActive = isDirectActive || isSurahStartPage;
                       const formattedPage = page.toString().padStart(2, '0');
                       return (
                        <button
                          key={page}
                          data-page={page}
                          onClick={() => {
                            if (onPageSelect) onPageSelect(page);
                            onClose();
                          }}
                          className={`cursor-pointer group flex w-full items-center gap-5 rounded-xl border p-4 text-left transition-all duration-200  ${
                            isActive ? "border-[var(--primary-green)]/40 bg-[var(--primary-green)]/5" : "border-[var(--border)]/10 hover:bg-[var(--surface-secondary)]/50 hover:border-[var(--border)]/20"
                          }`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 rotate-45 items-center justify-center rounded-lg text-xs font-bold transition-colors duration-200 ${isActive ? "bg-[var(--primary-green)] text-white" : "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"}`}>
                            <span className="-rotate-45">{formattedPage}</span>
                          </div>
                          <p className={`text-sm font-bold transition-colors ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"}`}>
                            Page {formattedPage}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};
