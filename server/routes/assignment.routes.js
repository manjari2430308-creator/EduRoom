const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { upload } = require("../middleware/upload.middleware");
const { createAssignment, getAssignments, getAssignmentById, deleteAssignment } = require("../controllers/assignment.controller");

router.get("/classroom/:classroomId", protect, getAssignments);
router.post("/classroom/:classroomId", protect, requireRole("teacher"), upload.single("file"), createAssignment);
router.get("/:id", protect, getAssignmentById);
router.delete("/:id", protect, requireRole("teacher"), deleteAssignment);

module.exports = router;
