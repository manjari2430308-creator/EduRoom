const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getFeedback, solveDoubt, summarizeClass } = require("../controllers/ai.controller");

router.post("/feedback", protect, getFeedback);
router.post("/doubt", protect, solveDoubt);
router.post("/summarize", protect, summarizeClass);

module.exports = router;
