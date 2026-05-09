const quranService = require("../services/quranService");

async function getSurahs(req, res) {
  try {
    const { id } = req.query;
    if (id) {
      const data = await quranService.getSurahData(id);
      if (!data) return res.status(404).json({ error: "Surah not found" });
      return res.json(data);
    }
    const surahs = await quranService.getSurahList();
    res.json(surahs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch surah data" });
  }
}

async function getJuz(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Juz ID is required" });
    const data = await quranService.getJuzData(id);
    if (!data) return res.status(404).json({ error: "Juz not found" });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch juz data" });
  }
}

async function getPage(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Page ID is required" });
    const data = await quranService.getPageData(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch page data" });
  }
}

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });
    const results = await quranService.searchQuran(q);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
}

async function getAudio(req, res) {
  try {
    const { chapter, from, surah, ayah, reciter } = req.query;
    const ch = chapter || surah;
    const f = from || ayah || 1;
    if (!ch) return res.status(400).json({ error: "Chapter is required" });
    
    const data = await quranService.getAudioData(ch, f, reciter);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch audio data" });
  }
}

module.exports = {
  getSurahs,
  getJuz,
  getPage,
  search,
  getAudio
};
