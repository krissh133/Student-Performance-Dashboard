export const getPerformanceLevel = (score, maxScore = 100) => {
  const pct = (score / maxScore) * 100;
  if (pct >= 85) return "Excellent";
  if (pct >= 70) return "Good";
  return "Average";
};

export const getPerformanceColor = (level) => {
  const map = { Excellent: "#00e5a0", Good: "#00d4ff", Average: "#ffb800" };
  return map[level] || "#8892b0";
};

export const formatMinutes = (mins) => {
  if (!mins) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatFullDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const getSubjectColor = (subject) => {
  const colors = {
    Mathematics: "#7c6cfc",
    Physics: "#00d4ff",
    "Computer Science": "#00e5a0",
    Chemistry: "#ffb800",
    English: "#ff4d6d",
    Biology: "#00e5c8",
    History: "#f97316",
  };
  return colors[subject] || "#8892b0";
};

export const getScoreGrade = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 75) return "B";
  if (pct >= 70) return "C+";
  if (pct >= 65) return "C";
  return "D";
};
