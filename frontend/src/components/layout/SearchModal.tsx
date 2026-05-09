import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, SlidersHorizontal, ArrowRight, ChevronDown } from "lucide-react";
import type { SurahIndexItem } from "@/types";

const SearchModal = ({
  isOpen,
  onClose,
  surahs,
  onSurahSelect,
  onJuzSelect,
  onPageSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  surahs: SurahIndexItem[];
  onSurahSelect: (surah: SurahIndexItem) => void;
  onJuzSelect: (juzId: number) => void;
  onPageSelect: (pageId: number) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const fetchUrl = `${API_URL}/search?q=${encodeURIComponent(query)}`;
        console.log("[DEBUG] Fetching search from:", fetchUrl);
        
        const res = await fetch(fetchUrl);
        
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search fetch failed", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]/10"
          >
            {/* Header / Input */}
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]/10">
              <div className="text-[var(--primary-green)] shrink-0 opacity-80">
                <BookOpen size={22} />
              </div>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find wisdom in the Quran"
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-[17px] placeholder:text-[var(--text-secondary)] font-medium"
              />
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-secondary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                  Quran
                  <ChevronDown size={14} />
                </button>
                <button className="p-2 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-8 max-h-[70vh] overflow-y-auto hide-scrollbar">
              {!query ? (
                <>
                  {/* Try to navigate */}
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-4 font-bold">Try to navigate</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Al-Fatiha", id: 1, type: "surah" },
                        { label: "Juz 30", id: 30, type: "juz" },
                        { label: "Surah Yasin", id: 36, type: "surah" },
                        { label: "Page 1", id: 1, type: "page" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (item.type === "surah") {
                              const s = surahs.find(x => x.id === item.id);
                              if (s) onSurahSelect(s);
                            } else if (item.type === "juz") {
                              onJuzSelect(item.id);
                            } else if (item.type === "page") {
                              onPageSelect(item.id);
                            }
                            onClose();
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)]/80 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Navigation */}
                  <div className="flex flex-col">
                    <p className="text-xs text-[var(--text-secondary)] mb-4 font-bold">Recent Navigation</p>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-[var(--text-secondary)] text-sm font-bold opacity-60">No recent navigation</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-secondary)] font-bold">
                      {isLoading ? "Searching..." : `Search Results (${results.length})`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {results.length > 0 ? (
                      results.map((verse, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const surah = surahs.find(s => s.id === verse.surah_id);
                            if (surah) onSurahSelect(surah);
                            onClose();
                          }}
                          className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)]/80 transition-all text-left group cursor-pointer border border-transparent hover:border-[var(--primary-green)]/20"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[var(--primary-green)]">
                              {verse.surah_name} {verse.verse_key}
                            </span>
                            <ArrowRight size={14} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p 
                            className="text-[var(--text-primary)] font-arabic text-lg leading-loose text-right"
                            dangerouslySetInnerHTML={{ __html: verse.text }}
                          />
                          <p 
                            className="text-sm text-[var(--text-secondary)] line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: verse.translation }}
                          />
                        </button>
                      ))
                    ) : (
                      !isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-[var(--text-secondary)] text-sm font-bold opacity-60">No ayahs found for "{query}"</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
