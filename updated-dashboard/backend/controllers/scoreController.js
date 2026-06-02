const Score = require("../models/Score");

const getMyScores = async (req, res) => {
  try {
    const scores = await Score.find({ student: req.user._id })
      .populate("assessment", "title subject duration")
      .sort({ createdAt: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getScoreTrends = async (req, res) => {
  try {
    const scores = await Score.find({ student: req.user._id }).sort({ monthIndex: 1 });

    // Group by subject
    const subjectMap = {};
    scores.forEach((s) => {
      if (!subjectMap[s.subject]) subjectMap[s.subject] = [];
      subjectMap[s.subject].push({ month: s.month, score: s.score, monthIndex: s.monthIndex });
    });

    // Get months in order
    const allMonths = [...new Set(scores.map((s) => s.month))];

    // Build trend data
    const trends = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      data: allMonths.map((m) => {
        const entry = data.find((d) => d.month === m);
        return { month: m, score: entry ? entry.score : null };
      }),
    }));

    // Overall average per month
    const monthlyAvg = allMonths.map((month) => {
      const monthScores = scores.filter((s) => s.month === month);
      const avg = monthScores.reduce((a, b) => a + b.score, 0) / monthScores.length;
      return { month, average: Math.round(avg) };
    });

    res.json({ trends, monthlyAvg, months: allMonths });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const scores = await Score.find({ student: req.user._id });
    if (!scores.length) return res.json({ bestScore: 0, avgScore: 0, totalTests: 0, improvement: 0 });

    const percentages = scores.map((s) => Math.round((s.score / s.maxScore) * 100));
    const bestScore = Math.max(...percentages);
    const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const totalTests = scores.length;
    const totalTimeSpent = scores.reduce((a, b) => a + (b.timeSpent || 0), 0);

    // Improvement: compare last 3 vs first 3
    const sorted = scores.sort((a, b) => a.monthIndex - b.monthIndex);
    const firstThree = sorted.slice(0, 3).map((s) => (s.score / s.maxScore) * 100);
    const lastThree = sorted.slice(-3).map((s) => (s.score / s.maxScore) * 100);
    const firstAvg = firstThree.reduce((a, b) => a + b, 0) / firstThree.length;
    const lastAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
    const improvement = Math.round(lastAvg - firstAvg);

    // Performance distribution
    const excellent = percentages.filter((p) => p >= 85).length;
    const good = percentages.filter((p) => p >= 70 && p < 85).length;
    const average = percentages.filter((p) => p < 70).length;

    res.json({
      bestScore,
      avgScore,
      totalTests,
      improvement,
      totalTimeSpent,
      distribution: { excellent, good, average },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecentResults = async (req, res) => {
  try {
    const scores = await Score.find({ student: req.user._id })
      .populate("assessment", "title subject difficulty")
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyScores, getScoreTrends, getStats, getRecentResults };
