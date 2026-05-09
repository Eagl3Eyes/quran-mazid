const express = require("express");
const router = express.Router();
const quranController = require("../controllers/quranController");

router.get("/surah", quranController.getSurahs);
router.get("/surah/:id", (req, res) => {
  req.query.id = req.params.id;
  return quranController.getSurahs(req, res);
});
router.get("/juz", quranController.getJuz);
router.get("/page", quranController.getPage);
router.get("/search", quranController.search);
router.get("/audio", quranController.getAudio);

module.exports = router;
