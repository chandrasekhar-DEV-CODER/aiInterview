/*import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeInterview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    let resumeText = "";

    if (fileExtension === "pdf") {
      const fileBuffer = await fs.promises.readFile(filePath);
      const uint8Array = new Uint8Array(fileBuffer);
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        resumeText += textContent.items.map((item) => item.str).join(" ") + "\n";
      }
    } 
    else if (fileExtension === "docx" || fileExtension === "doc") {
      const result = await mammoth.extractRawText({ path: filePath });
      resumeText = result.value;
    } 
    else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported format. Please upload PDF or DOCX." });
    }

    const messages = [
      {
        role: "system",
        content: "You are a resume parser. Extract data into this EXACT JSON format: { \"role\": \"\", \"experience\": \"\", \"projects\": [], \"skills\": [], \"education\": \"\" }. Return ONLY the JSON.",
      },
      { role: "user", content: resumeText },
    ];

    const aiResponse = await askAi(messages);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (!aiResponse) throw new Error("AI did not return a response");
    
    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("AI did not return valid JSON");
    
    const cleanJson = aiResponse.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(cleanJson);

    return res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      education: parsed.education,
      resumeText: resumeText
    });

  } catch (error) {
    console.error("Analyze Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills, interviewType } = req.body;

    role = String(role || "").trim();
    experience = String(experience || "").trim();
    mode = String(mode || "").trim();
    const type = interviewType || "Standard"; // Standard or Dynamic

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.credits < 50) {
      return res.status(400).json({ message: "Insufficient credits. Please top up." });
    }

    const projectText = Array.isArray(projects) ? projects.join(", ") : "None";
    const skillText = Array.isArray(skills) ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";
    const extendedResumeContext = safeResume.substring(0, 4000);

    const userPrompt = `
      Role: ${role}
      Experience: ${experience}
      Mode: ${mode}
      Skills: ${skillText}
      Projects: ${projectText}
      Resume: ${extendedResumeContext}
    `;

    let systemPrompt = "";
    if (type === "Dynamic") {
      systemPrompt = `You are a real human interviewer. Based on the candidate's resume, generate EXACTLY 1 specific, highly relevant opening interview question. Return ONLY the question string. Keep it under 25 words.`;
    } else {
      systemPrompt = `You are a Senior Hiring Manager conducting a ${mode} interview for a ${role}. 
      Read their resume and ask 5 specific questions based on it.
      Return ONLY the questions, one per line. No numbers. Keep each between 15-30 words.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const aiResponse = await askAi(messages);
    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI failed to generate content" });
    }

    let questionsArray = [];
    if (type === "Dynamic") {
      questionsArray = [aiResponse.trim()];
    } else {
      questionsArray = aiResponse.split("\n").map(q => q.trim()).filter(q => q.length > 10).slice(0, 5);
      if (questionsArray.length < 5) throw new Error("AI failed to provide 5 questions.");
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      interviewType: type,
      resumeText: safeResume,
      questions: questionsArray.map((q) => ({
        question: q,
        difficulty: "medium",
        timeLimit: 60,
      })),
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: questionsArray,
      interviewType: type
    });

  } catch (error) {
      console.error("Generate Error:", error.message);
      res.status(500).json({ message: "Internal Server Error: " + error.message });  
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const question = interview.questions[questionIndex];

    if (!answer || answer.trim().length < 5) {
      question.score = 0;
      question.feedback = "Answer was too short or missing.";
      await interview.save();
      return res.status(400).json({ message: "Meaningful answer is required" });
    }

    // Dynamic vs Standard Prompting
    let systemPrompt = `Evaluate this answer. Return ONLY JSON: { "confidence": 0-10, "communication": 0-10, "correctness": 0-10, "finalScore": 0-10, "feedback": "15 words max" }`;
    
    // If dynamic and not the last question, grade AND generate the next question
    if (interview.interviewType === "Dynamic" && questionIndex < 4) {
        systemPrompt = `You are the interviewer. The user just answered your question. 
        1. Grade the answer. 
        2. Generate a logical follow-up question based SPECIFICALLY on what they just said.
        Return ONLY JSON: { "confidence": 0-10, "communication": 0-10, "correctness": 0-10, "finalScore": 0-10, "feedback": "15 words max grading feedback", "nextQuestion": "Your 20-word follow-up question here" }`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Question: ${question.question}\nAnswer: ${answer}` }
    ];

    const aiResponse = await askAi(messages);
    if (!aiResponse) throw new Error("AI did not return a response");

    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("AI did not return valid JSON");

    const parsed = JSON.parse(aiResponse.substring(jsonStart, jsonEnd + 1));

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    // If dynamic, save the newly generated question to the database
    if (parsed.nextQuestion && interview.interviewType === "Dynamic") {
        interview.questions.push({
            question: parsed.nextQuestion,
            difficulty: "medium",
            timeLimit: 60
        });
    }

    await interview.save();

    return res.status(200).json({ 
        feedback: parsed.feedback, 
        score: parsed.finalScore,
        nextQuestion: parsed.nextQuestion || null 
    });

  } catch (error) {
    console.error("Submit Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const totalQuestions = interview.questions.length || 1;
    let sumScore = 0, sumConf = 0, sumComm = 0, sumCorr = 0;

    interview.questions.forEach((q) => {
      sumScore += Number(q.score) || 0;
      sumConf += Number(q.confidence) || 0;
      sumComm += Number(q.communication) || 0;
      sumCorr += Number(q.correctness) || 0;
    });

    const finalScore = Math.round(sumScore / totalQuestions) || 0;
    
    await Interview.updateOne(
        { _id: interviewId },
        { $set: { finalScore: finalScore, status: "Completed" } }
    );

    return res.status(200).json({
      finalScore,
      confidence: Math.round(sumConf / totalQuestions) || 0,
      communication: Math.round(sumComm / totalQuestions) || 0,
      correctness: Math.round(sumCorr / totalQuestions) || 0,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });

  } catch (error) {
    console.error("Finish Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt interviewType");
    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({ message: `Failed to find interviews ${error}` });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    
    const totalQuestions = interview.questions?.length || 1; 
    let sumScore = 0, sumConf = 0, sumComm = 0, sumCorr = 0;

    interview.questions.forEach((q) => {
      sumScore += Number(q.score) || 0;
      sumConf += Number(q.confidence) || 0;
      sumComm += Number(q.communication) || 0;
      sumCorr += Number(q.correctness) || 0;
    });

    const finalScore = Math.round(sumScore / totalQuestions) || 0;

    return res.status(200).json({
      finalScore,
      confidence: Math.round(sumConf / totalQuestions) || 0,
      communication: Math.round(sumComm / totalQuestions) || 0,
      correctness: Math.round(sumCorr / totalQuestions) || 0,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "No feedback recorded",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}*/