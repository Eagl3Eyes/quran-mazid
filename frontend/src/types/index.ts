export interface Verse {
  id: number;
  text: string;
  translation: string;
  surah_id?: number;
  surah_name?: string;
  surah_transliteration?: string;
}

export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  total_verses: number;
  verses: Verse[];
}

export type SurahIndexItem = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  total_verses: number;
  pages?: number[];
};

export interface FeedData {
  id: string | number;
  type: "surah" | "juz" | "page";
  title: string;
  subtitle: string;
  verses: Verse[];
  revelation_place?: "makkah" | "madina";
}
