const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const {
  createClassroom, getMyClassrooms, getClassroomById,
  joinClassroom, removeStudent, getAnnouncements, postAnnouncement
} = require("../controllers/classroom.controller");

router.get("/", protect, getMyClassrooms);
router.post("/", protect, requireRole("teacher"), createClassroom);
router.post("/join", protect, requireRole("student"), joinClassroom);
router.get("/:id", protect, getClassroomById);
router.delete("/:id/students/:studentId", protect, requireRole("teacher"), removeStudent);
router.get("/:id/announcements", protect, getAnnouncements);
router.post("/:id/announcements", protect, requireRole("teacher"), postAnnouncement);

module.exports = router;
