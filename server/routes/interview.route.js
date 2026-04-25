import express from "express";
import isAuth from "../middleware/isAuth.js"; 
import { upload } from "../middleware/multer.js";
import { 
    analyzeInterview, 
    generateQuestion, 
    submitAnswer, 
    finishInterview, 
    getMyInterviews,
    getInterviewReport
} from "../controllers/interview.controller.js";

const router = express.Router();

/**
 * @route   POST /api/interview/resume
 * @desc    Upload and analyze resume PDF
 * @access  Private
 */
router.post("/resume", isAuth, upload.single("resume"), analyzeInterview);

/**
 * @route   POST /api/interview/generate-questions
 * @desc    Generate 5 AI interview questions based on resume/profile
 * @access  Private
 */
router.post("/generate-questions", isAuth, generateQuestion);

/**
 * @route   POST /api/interview/submit-answer
 * @desc    Evaluate a single answer using AI
 * @access  Private
 */
router.post("/submit-answer", isAuth, submitAnswer);

/**
 * @route   POST /api/interview/finish
 * @desc    Calculate final scores and complete session
 * @access  Private
 */
router.post("/finish", isAuth, finishInterview);



router.get("/get-interview", isAuth, getMyInterviews);
router.get("/report/:id", isAuth, getInterviewReport);



export default router;