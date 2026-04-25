/*import React, { useState, useRef, useEffect } from 'react';
import femaleVideo from "../assets/Videos/female-ai.mp4";
import maleVideo from "../assets/Videos/male-ai.mp4";
import Timer from './Timer';
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from "react-icons/fa";
import axios from 'axios';
import { ServerURL } from '../App.jsx';

// We want interviews to always end after 5 questions so reports don't break
const MAX_QUESTIONS = 5; 

const Step2Interview = ({ interviewData, onFinish }) => {
    const { interviewId, userName } = interviewData;
    
    // ✅ Use state for questions so we can add to it dynamically!
    const [interviewQuestions, setInterviewQuestions] = useState(interviewData.questions);
    
    const [isIntroPhase, setIsIntroPhase] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const recognitionRef = useRef(null);
    const [isAIPlaying, setIsAIPlaying] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(interviewQuestions[0]?.timeLimit || 60);

    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");
    
    const videoRef = useRef(null);
    const currentQuestion = interviewQuestions[currentIndex];
    const ServerUrl = ServerURL || "http://localhost:8000";

    useEffect(() => {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return;
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("female"));
        if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); return; }
        const maleVoice = voices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("male"));
        if (maleVoice) { setSelectedVoice(maleVoice); setVoiceGender("male"); return; }
        setSelectedVoice(voices[0]); setVoiceGender("female");
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged=loadVoices;
    },[]);

    const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

    const speakText = (text) => {
      return new Promise((resolve) => {
        if (!window.speechSynthesis || !selectedVoice || typeof text !== "string") { resolve(); return; }
        window.speechSynthesis.cancel();
        const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
        const utterance = new SpeechSynthesisUtterance(humanText);
        utterance.voice = selectedVoice; utterance.rate = 0.92; utterance.pitch = 1.05; utterance.volume = 1;

        utterance.onstart = () => { setIsAIPlaying(true); stopMic(); videoRef.current?.play(); };
        utterance.onend = () => {
          videoRef.current?.pause();
          if (videoRef.current) videoRef.current.currentTime = 0;
          setIsAIPlaying(false);
          if (isMicOn) startMic();
          setTimeout(() => { setSubtitle(""); resolve(); }, 300);
        };
        setSubtitle(text);
        window.speechSynthesis.speak(utterance);
      });
    };

    useEffect(() => {
      if (!selectedVoice) return;
      const runIntro = async () => {
        if (isIntroPhase) {
          await speakText(`Hi ${userName || "there"}, it's great to meet you today. I hope you're feeling confident and ready.`);
          await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
          setIsIntroPhase(false);
        } else if (currentQuestion) {
          const textToSpeak = typeof currentQuestion === "string" ? currentQuestion : currentQuestion?.question;
          if (textToSpeak) {
            await new Promise(r => setTimeout(r, 800));
            if (currentIndex === MAX_QUESTIONS - 1) await speakText("Alright, this is the final question.");
            await speakText(textToSpeak);
            if (isMicOn) startMic();
          }
        }
      };
      runIntro();
    }, [selectedVoice, isIntroPhase, currentIndex]); 

    useEffect(() => {
      if (isIntroPhase) return;
      if (!currentQuestion) return;
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [isIntroPhase, currentIndex]);

    useEffect(() => {
      if (!isIntroPhase && currentQuestion) setTimeLeft(currentQuestion.timeLimit || 60);
    }, [currentIndex]);

    useEffect(()=>{
      if (!("webkitSpeechRecognition" in window)) return;
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US"; recognition.continuous = true; recognition.interimResults = false;
      recognition.onresult = (event) => { setAnswer(prev => prev + " " + event.results[event.results.length - 1][0].transcript); };
      recognitionRef.current = recognition;
    },[])

    const startMic = () => { if (recognitionRef.current && !isAIPlaying) try { recognitionRef.current.start(); } catch {} };
    const stopMic = () => { if (recognitionRef.current) recognitionRef.current.stop(); };
    const toggleMic = () => { if (isMicOn) stopMic(); else startMic(); setIsMicOn(!isMicOn); };

    useEffect(() => {
      if (timeLeft === 0 && !isIntroPhase && !isSubmitting && !feedback) submitAnswer(true); 
    }, [timeLeft]);

    const finishInterview = async () => {
      stopMic(); setIsMicOn(false);
      try {
        const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
        onFinish(result.data);
      } catch (error) { console.log(error); }
    }

    const submitAnswer = async (isTimeOut = false) => {
      if (isSubmitting) return;
      if (isTimeOut !== true && answer.trim().length < 5) return alert("Please type a more detailed answer.");

      let finalAnswer = answer;
      if (isTimeOut === true && answer.trim().length < 5) finalAnswer = answer ? answer + " (Time Expired)" : "No answer provided within time limit.";

      stopMic(); setIsSubmitting(true);

      try {
        const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
          interviewId, questionIndex: currentIndex, answer: finalAnswer, timeTaken: currentQuestion.timeLimit - timeLeft,
        }, { withCredentials: true });

        setFeedback(result.data.feedback);
        
        // ✅ If the backend gave us a new dynamic question, add it to our array!
        if (result.data.nextQuestion) {
           setInterviewQuestions(prev => [...prev, result.data.nextQuestion]);
        }

        await speakText(result.data.feedback);
        await new Promise(resolve => setTimeout(resolve, 3000));

        // ✅ Stop when we hit the MAX_QUESTIONS limit
        if (currentIndex + 1 >= MAX_QUESTIONS) {
          finishInterview();
        } else {
          setAnswer(""); setFeedback("");
          await speakText("Alright, let's move to the next question.");
          setCurrentIndex(currentIndex + 1);
          setTimeout(() => { if (isMicOn) startMic(); }, 500);
        }
     } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerals-50 via-white to-teal-100 flex justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden'>
            <video src={femaleVideo} ref={videoRef} key={videoSource} muted playsInline preload='auto' className='w-full h-auto object-cover'/>
          </div>

          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>Interview Status</span>
              {isAIPlaying&&<span className='text-sm font-semibold text-emerald-600'>{isAIPlaying?"AI Speaking":""}</span>}
            </div> 
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-center"><Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit||60}/></div>
            <div className="h-px bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div><span className="text-2xl font-bold text-emerald-600">{currentIndex+1}</span><span className="text-xs text-gray-400">Current Question</span></div>
              //{ ✅ Dynamically shows total as 5 max }
              <div><span className="text-2xl font-bold text-emerald-600">{MAX_QUESTIONS}</span><span className="text-xs text-gray-400">Total Questions</span></div>
            </div>
          </div>
        </div>

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>AI Smart Interview</h2>

          {!isIntroPhase&&(<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>Question {currentIndex+1} of {MAX_QUESTIONS}</p>
            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>
              {typeof currentQuestion === "string" ? currentQuestion : currentQuestion?.question}
            </div>
          </div>)}

          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={isSubmitting || isAIPlaying || timeLeft === 0} placeholder="Type your answer here..." className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 disabled:opacity-50" />

          {!feedback?(<div className='flex items-center gap-4 mt-6'>
            <motion.button onClick={toggleMic} whileTap={{ scale: 0.9 }} className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
            {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => submitAnswer(false)} disabled={isSubmitting || isAIPlaying || (!answer.trim() && timeLeft > 0)} className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
              {isSubmitting ? "Evaluating..." : currentIndex === MAX_QUESTIONS - 1 ? "Finish Interview" : "Submit Answer"}
            </motion.button>
          </div>):(
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>
              <div className='w-full text-emerald-600 py-2 flex items-center justify-center gap-2 font-medium'>
                <FaSpinner className="animate-spin" /> {currentIndex + 1 >= MAX_QUESTIONS ? "Compiling Report..." : "Generating next question..."}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Step2Interview;*/