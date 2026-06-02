const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
}, { _id: true });

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  correctOption: { type: Number, required: true }, // 0-indexed
  marks: { type: Number, default: 1 },
}, { _id: true });

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    maxScore: { type: Number, default: 100 },
    duration: { type: Number, default: 60 }, // minutes
    dueDate: { type: Date },
    status: { type: String, enum: ["available", "upcoming", "completed"], default: "upcoming" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    description: { type: String, default: "" },
    questions: [questionSchema], // MCQ questions
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
