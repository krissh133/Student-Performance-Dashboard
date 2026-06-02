const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    score: { type: Number, required: true },
    maxScore: { type: Number, default: 100 },
    timeSpent: { type: Number, default: 0 }, // minutes
    month: { type: String },
    monthIndex: { type: Number },
    year: { type: Number },
    feedback: { type: String, default: "" },
    // MCQ-specific fields
    submittedAnswers: [{ type: Number }], // student's chosen option indices
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

scoreSchema.virtual("percentage").get(function () {
  return Math.round((this.score / this.maxScore) * 100);
});

scoreSchema.virtual("performanceLevel").get(function () {
  const pct = (this.score / this.maxScore) * 100;
  if (pct >= 85) return "Excellent";
  if (pct >= 70) return "Good";
  return "Average";
});

module.exports = mongoose.model("Score", scoreSchema);
