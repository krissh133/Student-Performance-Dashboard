const express = require("express");
const router = express.Router();
const { getMyScores, getScoreTrends, getStats, getRecentResults } = require("../controllers/scoreController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyScores);
router.get("/trends", protect, getScoreTrends);
router.get("/stats", protect, getStats);
router.get("/recent", protect, getRecentResults);

module.exports = router;
