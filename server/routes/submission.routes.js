const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { upload } = require("../middleware/upload.middleware");
const { submitAssignment, getSubmissions, getMySubmission, gradeSubmission, getStudentGrades } = require("../controllers/submission.controller");

router.post("/:assignmentId/submit", protect, requireRole("student"), upload.single("file"), submitAssignment);
router.get("/:assignmentId/all", protect, requireRole("teacher"), getSubmissions);
router.get("/:assignmentId/mine", protect, requireRole("student"), getMySubmission);
router.patch("/:id/grade", protect, requireRole("teacher"), gradeSubmission);
router.get("/my/grades", protect, requireRole("student"), getStudentGrades);

module.exports = router;
