const { generateFeedback, answerDoubt, summarizeSubmissions } = require("../utils/aiClient");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");

const getFeedback = async (req, res) => {
  try {
    const { submissionContent, assignmentTitle } = req.body;
    if (!submissionContent) return res.status(400).json({ message: "Submission content required" });
    const feedback = await generateFeedback(submissionContent, assignmentTitle);
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: "AI service error: " + err.message });
  }
};

const solveDoubt = async (req, res) => {
  try {
    const { messages, assignmentTitle, subject } = req.body;
    if (!messages?.length) return res.status(400).json({ message: "Messages required" });
    const last5 = messages.slice(-5);
    const answer = await answerDoubt(last5, assignmentTitle, subject);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: "AI service error: " + err.message });
  }
};

const summarizeClass = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const classroom = await Classroom.findById(assignment.classroomId);
    if (classroom.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const submissions = await Submission.find({ assignmentId });
    const summary = await summarizeSubmissions(submissions, assignment.title, classroom.students.length);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "AI service error: " + err.message });
  }
};

module.exports = { getFeedback, solveDoubt, summarizeClass };
