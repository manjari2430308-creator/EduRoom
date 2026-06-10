const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");

const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const existing = await Submission.findOne({ assignmentId: req.params.assignmentId, studentId: req.user._id });
    if (existing) return res.status(400).json({ message: "Already submitted" });

    const submission = await Submission.create({
      assignmentId: req.params.assignmentId,
      studentId: req.user._id,
      content: req.body.content || "",
      fileUrl: req.file?.path || "",
      fileName: req.file?.originalname || "",
    });

    const classroom = await Classroom.findById(assignment.classroomId);
    req.io.to(assignment.classroomId.toString()).emit("newSubmission", {
      assignmentId: assignment._id,
      student: req.user.name,
      classroomId: assignment.classroomId,
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const classroom = await Classroom.findById(assignment.classroomId);
    if (classroom.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
      .populate("studentId", "name avatar email");
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user._id,
    });
    res.json(submission || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback, aiFeedback } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.grade = grade;
    submission.feedback = feedback;
    if (aiFeedback) submission.aiFeedback = aiFeedback;
    submission.status = "graded";
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentGrades = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id, status: "graded" })
      .populate({ path: "assignmentId", populate: { path: "classroomId", select: "title subject" } });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitAssignment, getSubmissions, getMySubmission, gradeSubmission, getStudentGrades };
