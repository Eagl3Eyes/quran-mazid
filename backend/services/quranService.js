const axios = require("axios");

const BASE_URL = "https://api.quranpedia.net/v1";
const QURAN_COM_API = "https://api.quran.com/api/v4";

let surahListCache = null;
let translationCache = {};

async function getSurahList() {
  if (surahListCache) return surahListCache;
  try {
    const res = await axios.get(`${QURAN_COM_API}/chapters`);
    surahListCache = res.data.chapters.map(c => ({
      id: c.id,
      name: c.name_arabic,
      transliteration: c.name_simple,
      translation: c.translated_name.name,
      total_verses: c.verses_count,
      revelation_place: c.revelation_place,
      pages: c.pages
    }));
    return surahListCache;
  } catch (error) {
    console.error("Failed to fetch surah list", error.message);
    return [];
  }
}

async function getTranslations(surahId) {
  if (translationCache[surahId]) return translationCache[surahId];
  try {
    const res = await axios.get(`${QURAN_COM_API}/quran/translations/20?chapter_number=${surahId}`);
    translationCache[surahId] = res.data.translations.map(t => t.text.replace(/<sup[^>]*>.*?<\/sup>/g, ''));
    return translationCache[surahId];
  } catch (error) {
    console.error(`Failed to fetch translations for surah ${surahId}`);
    return [];
  }
}

async function getSurahData(id) {
  const surahs = await getSurahList();
  const surahId = parseInt(id);
  const surahInfo = surahs.find((s) => s.id === surahId);
  if (!surahInfo) return null;

  // Fetch ayahs and translations in parallel
  const [ayahsRes, translations] = await Promise.all([
    axios.get(`${BASE_URL}/mushafs/1/${surahId}`),
    getTranslations(surahId)
  ]);

  const ayahs = ayahsRes.data;

  return {
    ...surahInfo,
    verses: ayahs.map((a, index) => ({
      id: a.number,
      text: a.text,
      translation: translations[index] || "",
    })),
  };
}

async function getJuzData(id) {
  const juzId = parseInt(id);
  const mappingRes = await axios.get(`${QURAN_COM_API}/juzs`);
  const mapping = mappingRes.data.juzs.find((j) => j.juz_number === juzId);

  if (!mapping) return null;

  const surahs = await getSurahList();
  
  // Fetch all necessary surah data and translations in parallel
  const surahIds = Object.keys(mapping.verse_mapping).map(Number);
  const surahDataPromises = surahIds.map(async (surahId) => {
    const [ayahsRes, translations] = await Promise.all([
      axios.get(`${BASE_URL}/mushafs/1/${surahId}`),
      getTranslations(surahId)
    ]);
    return { surahId, ayahs: ayahsRes.data, translations, info: surahs.find(s => s.id === surahId) };
  });

  const allSurahResults = await Promise.all(surahDataPromises);
  
  let allVerses = [];
  for (const { surahId, ayahs, translations, info, verseRange } of allSurahResults) {
    const [startVerse, endVerse] = mapping.verse_mapping[surahId].split("-").map(Number);
    
    const versesInRange = ayahs
      .filter((a) => a.number >= startVerse && a.number <= endVerse)
      .map((a) => ({
        id: a.number,
        text: a.text,
        translation: translations[a.number - 1] || "",
        surah_id: surahId,
        surah_name: info?.name,
        surah_transliteration: info?.transliteration,
      }));

    allVerses = allVerses.concat(versesInRange);
  }

  const firstSurahId = surahIds[0];
  const firstSurahInfo = surahs.find((s) => s.id === firstSurahId);

  return {
    id: `juz-${juzId}`,
    type: "juz",
    title: `Juz ${juzId}`,
    subtitle: `${firstSurahInfo?.transliteration || 'Juz'} & More`,
    verses: allVerses,
  };
}

async function getPageData(id) {
  const response = await axios.get(`${QURAN_COM_API}/quran/verses/uthmani?page_number=${id}`);
  const ayahs = response.data.verses;
  const surahs = await getSurahList();

  const surahIds = [...new Set(ayahs.map(a => parseInt(a.verse_key.split(':')[0])))];
  
  // Fetch translations in parallel
  const translationsMap = {};
  const translationPromises = surahIds.map(async (sId) => {
    translationsMap[sId] = await getTranslations(sId);
  });
  await Promise.all(translationPromises);

  const verses = ayahs.map(a => {
    const parts = a.verse_key.split(':');
    const surahId = parseInt(parts[0]);
    const verseNum = parseInt(parts[1]);
    const surahInfo = surahs.find(s => s.id === surahId);
    return {
      id: verseNum,
      text: a.text_uthmani,
      translation: translationsMap[surahId][verseNum - 1] || "",
      surah_id: surahId,
      surah_name: surahInfo?.name,
      surah_transliteration: surahInfo?.transliteration
    };
  });

  const firstSurahId = surahIds[0];
  const firstSurahInfo = surahs.find(s => s.id === firstSurahId);
  const medinanSurahs = [2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 99, 110];
  const isMedinan = medinanSurahs.includes(firstSurahId);

  return {
    id: `page-${id}`,
    type: "page",
    title: firstSurahInfo?.transliteration || `Page ${id}`,
    subtitle: `Ayah-${firstSurahInfo?.total_verses || verses.length}, ${isMedinan ? "Madinah" : "Makkah"}`,
    verses: verses,
    revelation_place: isMedinan ? "madina" : "makkah"
  };
}

async function searchQuran(q) {
  const response = await axios.get(`${QURAN_COM_API}/search?q=${encodeURIComponent(q)}&size=10`);
  const results = response.data.search.results;
  const surahs = await getSurahList();

  return results.map(r => {
    const parts = r.verse_key.split(':');
    const surahId = parseInt(parts[0]);
    const verseId = parseInt(parts[1]);
    const surahInfo = surahs.find(s => s.id === surahId);
    
    return {
      surah_id: surahId,
      verse_id: verseId,
      verse_key: r.verse_key,
      text: r.text,
      surah_name: surahInfo?.transliteration || "Unknown",
      translation: r.translations?.[0]?.text.replace(/<[^>]*>/g, '') || ""
    };
  });
}

async function getAudioData(chapter, from, reciter) {
  let pickedId = reciter;
  
  if (!pickedId) {
    const recitersRes = await axios.get(`${QURAN_COM_API}/resources/recitations`);
    pickedId = recitersRes.data.recitations[0].id;
  }

  const [audioRes, surahs] = await Promise.all([
    axios.get(`${QURAN_COM_API}/quran/recitations/${pickedId}?chapter_number=${chapter}`),
    getSurahList()
  ]);
  
  const audioFiles = audioRes.data.audio_files;
  const surahInfo = surahs.find((s) => s.id === parseInt(chapter));
  const maxVerse = surahInfo ? surahInfo.total_verses : 0;

  const start = parseInt(from || 1);
  const audioUrls = [];
  const AUDIO_BASE_URL = "https://verses.quran.com/";

  for (let v = start; v <= maxVerse; v++) {
    const verseKey = `${chapter}:${v}`;
    const file = audioFiles.find((a) => a.verse_key === verseKey);
    if (file?.url) {
      audioUrls.push(`${AUDIO_BASE_URL}${file.url}`);
    }
  }

  return {
    reciterId: parseInt(pickedId),
    range: {
      chapter: parseInt(chapter),
      from: start,
      to: maxVerse,
    },
    audioUrls,
  };
}

module.exports = {
  getSurahList,
  getSurahData,
  getJuzData,
  getPageData,
  searchQuran,
  getAudioData
};
