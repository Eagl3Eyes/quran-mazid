"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { SurahDrawer } from "@/components/panel/SurahDrawer";
import { AyahFeed } from "@/components/feed/AyahFeed";
import { RightPanel } from "@/components/panel/RightPanel";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useAudio } from "@/components/audio/AudioContext";
import SearchModal from "@/components/layout/SearchModal";

import type { FeedData, Surah, SurahIndexItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type FeedQuery = { type: "surah" | "juz" | "page"; id: number };

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [surahsList, setSurahsList] = useState<SurahIndexItem[]>([]);
  const [activeFeedQuery, setActiveFeedQuery] = useState<FeedQuery | null>(null);
  const [feedData, setFeedData] = useState<FeedData | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const { stop } = useAudio();

  useEffect(() => {
    if (!activeFeedQuery) {
      setFeedData(null);
      return;
    }

    let isMounted = true;

    async function loadFeed() {
      try {
        let endpoint = "";
        if (activeFeedQuery?.type === "surah") endpoint = `${API_URL}/surah?id=${activeFeedQuery.id}`;
        else if (activeFeedQuery?.type === "juz") endpoint = `${API_URL}/juz?id=${activeFeedQuery.id}`;
        else if (activeFeedQuery?.type === "page") endpoint = `${API_URL}/page?id=${activeFeedQuery.id}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          console.error(`Feed fetch failed: ${response.status}`, endpoint);
          setFeedData(null);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Expected JSON but got:", text.substring(0, 100));
          setFeedData(null);
          return;
        }

        const data = await response.json();

        if (isMounted && data) {
          if (data.error) {
            setFeedData(null);
            return;
          }

          if (activeFeedQuery?.type === "surah") {
            const surahInfo = surahsList.find(s => s.id === activeFeedQuery.id);
            const medinanSurahs = [2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 99, 110];
            const isMedinan = medinanSurahs.includes(data.id);

            setFeedData({
              id: data.id,
              type: "surah",
              title: surahInfo?.transliteration || data.transliteration || data.name,
              subtitle: `Ayah-${data.total_verses}, ${isMedinan ? "Madinah" : "Makkah"}`,
              verses: data.verses ? data.verses.map((v: any) => ({ ...v, surah_id: data.id })) : [],
              revelation_place: isMedinan ? "madina" : "makkah"
            });
          } else {
            setFeedData(data as FeedData);
          }
        }
      } catch {
        if (isMounted) setFeedData(null);
      }
    }

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [activeFeedQuery, surahsList]);

  useEffect(() => {
    if (feedData) {
      if (feedData.type === "surah") {
        const surahId = feedData.id.toString().padStart(2, '0');
        const surah = surahsList.find(s => s.id === feedData.id);
        document.title = `Surah ${feedData.title} (${surahId}) - Arabic, English Translation & Recitation | ${surah?.name || ""}`;
      } else if (feedData.type === "page") {
        document.title = `${feedData.title} | Page ${activeFeedQuery?.id} - Quran Mazid`;
      } else if (feedData.type === "juz") {
        document.title = `Juz ${activeFeedQuery?.id} - Quran Mazid`;
      }
    } else {
      document.title = "Quran Mazid";
    }
  }, [feedData, surahsList, activeFeedQuery]);

  useEffect(() => {
    if (activeFeedQuery) {
      return;
    }

    let isMounted = true;

    async function loadInitialSurah() {
      try {
        const response = await fetch(`${API_URL}/surah`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Invalid response type");

        const data = await response.json();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setSurahsList(data);
          setActiveFeedQuery({ type: "surah", id: data[0].id });
        }
      } catch (err) {
        console.error("Initial surah load failed", err);
        if (isMounted) {
          setActiveFeedQuery(null);
        }
      }
    }

    loadInitialSurah();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNextFeed = () => {
    if (!activeFeedQuery || activeFeedQuery.type !== "surah" || surahsList.length === 0) return;
    const currentIndex = surahsList.findIndex(s => s.id === activeFeedQuery.id);
    if (currentIndex >= 0 && currentIndex < surahsList.length - 1) {
      stop();
      setActiveFeedQuery({ type: "surah", id: surahsList[currentIndex + 1].id });
    }
  };

  const handlePrevFeed = () => {
    if (!activeFeedQuery || activeFeedQuery.type !== "surah" || surahsList.length === 0) return;
    const currentIndex = surahsList.findIndex(s => s.id === activeFeedQuery.id);
    if (currentIndex > 0) {
      stop();
      setActiveFeedQuery({ type: "surah", id: surahsList[currentIndex - 1].id });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col pb-16 lg:pb-0 lg:pl-15">
        <Navbar
          onMenuClick={() => setIsDrawerOpen((prev) => !prev)}
          isDrawerOpen={isDrawerOpen}
          onSearchClick={() => setIsSearchOpen(true)}
          isVisible={isNavbarVisible}
        />
        <div className="flex flex-1 overflow-hidden relative">
          <SurahDrawer
            activeFeedQuery={activeFeedQuery}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSurahSelect={(surahInfo) => {
              stop();
              setActiveFeedQuery({ type: "surah", id: surahInfo.id });
            }}
            onJuzSelect={(juzId) => {
              stop();
              setActiveFeedQuery({ type: "juz", id: juzId });
            }}
            onPageSelect={(pageId) => {
              stop();
              setActiveFeedQuery({ type: "page", id: pageId });
            }}
          />
          <AyahFeed
            feedData={feedData}
            onNextFeed={handleNextFeed}
            onPrevFeed={handlePrevFeed}
            hasNext={activeFeedQuery?.type === "surah" ? surahsList.findIndex(s => s.id === activeFeedQuery.id) < surahsList.length - 1 : false}
            hasPrev={activeFeedQuery?.type === "surah" ? surahsList.findIndex(s => s.id === activeFeedQuery.id) > 0 : false}
            onScrollDirection={(dir) => setIsNavbarVisible(dir === "up")}
          />
          <RightPanel />
        </div>
        <AudioPlayer />
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        surahs={surahsList}
        onSurahSelect={(surahInfo) => {
          stop();
          setActiveFeedQuery({ type: "surah", id: surahInfo.id });
        }}
        onJuzSelect={(juzId) => {
          stop();
          setActiveFeedQuery({ type: "juz", id: juzId });
        }}
        onPageSelect={(pageId) => {
          stop();
          setActiveFeedQuery({ type: "page", id: pageId });
        }}
      />
    </div>
  );
};
