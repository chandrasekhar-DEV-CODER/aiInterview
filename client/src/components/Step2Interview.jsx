import React from 'react'
import { useLocation } from 'react-router-dom';
import femaleVideo from "../assets/Videos/female-ai.mp4";
import maleVideo from "../assets/Videos/male-ai.mp4";
import Timer from './Timer';
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from "react-icons/fa";
import { useState ,useRef} from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { ServerURL } from '../App.jsx';
import { BsArrowRight } from 'react-icons/bs';



const Step2Interview = ({interviewData, onFinish}) => {

    const { interviewId, questions, userName } = interviewData;
    const [isIntroPhase, setIsIntroPhase] = useState(true);

    const [isMicOn, setIsMicOn] = useState(true);
    const recognitionRef = useRef(null);
    const [isAIPlaying, setIsAIPlaying] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(
      questions[0]?.timeLimit || 60
    );

    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");
    
    const videoRef=useRef(null);
    const currentQuestion=questions[currentIndex];
    const ServerUrl = ServerURL || "http://localhost:8000";


    useEffect(() => {
  const loadVoices = () => {
    // Correcting 'cdnst' typo from the image to 'const'
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    // Try known female voices first
    const femaleVoice = voices.find(v => 
      v.name.toLowerCase().includes("zira") || 
      v.name.toLowerCase().includes("samantha") || 
      v.name.toLowerCase().includes("female")
    );

    if (femaleVoice) {
      setSelectedVoice(femaleVoice);
      setVoiceGender("female");
      return;
    }

    // Try known male voices
    const maleVoice = voices.find(v =>
      v.name.toLowerCase().includes("david") ||
      v.name.toLowerCase().includes("mark") ||
      v.name.toLowerCase().includes("male")
    );

    if (maleVoice) {
      setSelectedVoice(maleVoice);
      setVoiceGender("male");
      return;
    }

    setSelectedVoice(voices[0]);
    setVoiceGender("female");


    // Try known male voices...
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged=loadVoices;
    },[]);


    const videoSource=voiceGender==="male"?maleVideo:femaleVideo;

//speek functionality
const speakText = (text) => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !selectedVoice) {
      resolve();
      return;
    }

    if (typeof text !== "string") {
      console.error("speakText received invalid input:", text);
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Add natural pauses after commas and periods
    const humanText = text
      .replace(/,/g, ", ... ")
      .replace(/\./g, ". ... ");

    const utterance = new SpeechSynthesisUtterance(humanText);
    utterance.voice = selectedVoice;

    // Human-like pacing
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsAIPlaying(true);
      stopMic();
      videoRef.current?.play();
    };

    utterance.onend = () => {
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setIsAIPlaying(false);
      if(isMicOn){startMic();}

      setTimeout(() => {
        setSubtitle("");
        resolve();
      }, 300);
    };

    setSubtitle(text);
    window.speechSynthesis.speak(utterance);
  });
};

useEffect(() => {
  if (!selectedVoice) {
    return;
  }

  const runIntro = async () => {
    if (isIntroPhase) {
      await speakText(
        `Hi ${userName || "there"}, it's great to meet you today. I hope you're feeling confident and ready.`
      );

      await speakText(
        "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
      );

      setIsIntroPhase(false);
    } else if (currentQuestion) {
      const textToSpeak = typeof currentQuestion === "string" 
        ? currentQuestion 
        : currentQuestion?.question;

      if (textToSpeak) {
        await new Promise((r) => setTimeout(r, 800)); // Small natural pause

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(textToSpeak);
        
         if(isMicOn){startMic();}
      
        }
    }
  };

  runIntro();
}, [selectedVoice, isIntroPhase, currentIndex]); 


useEffect(() => {
  if (isIntroPhase) return;
  if (!currentQuestion) return;
  

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [isIntroPhase, currentIndex]);

useEffect(() => {
  if (!isIntroPhase && currentQuestion) {
    setTimeLeft(currentQuestion.timeLimit || 60);
  }
}, [currentIndex]);



useEffect(()=>{
  if (!("webkitSpeechRecognition" in window)) return;

  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript =
      event.results[event.results.length - 1][0].transcript;

    setAnswer((prev) => prev + " " + transcript);
  };

  recognitionRef.current = recognition;

  },[])

  const startMic = () => {
      if (recognitionRef.current && !isAIPlaying) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    };


  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

    const stopMic = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };

  useEffect(() => {
    if (timeLeft === 0 && !isIntroPhase && !isSubmitting && !feedback) {
      submitAnswer(true); 
    }
  }, [timeLeft]);

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", {
        interviewId
      }, {
        withCredentials: true
      })

      console.log(result.data)
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  // ✅ AUTO-TRANSITION LOGIC ADDED HERE
  const submitAnswer = async (isTimeOut = false) => {
    if (isSubmitting) return;

    if (isTimeOut !== true && answer.trim().length < 5) {
      return alert("Please type a more detailed answer.");
    }

    let finalAnswer = answer;
    if (isTimeOut === true && answer.trim().length < 5) {
      finalAnswer = answer ? answer + " (Time Expired)" : "No answer provided within time limit.";
    }

    stopMic()
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer: finalAnswer, 
        timeTaken: currentQuestion.timeLimit - timeLeft,
      },{withCredentials:true})

      setFeedback(result.data.feedback);
      
      // 1. Wait for the AI to speak the feedback text
      await speakText(result.data.feedback);
      
      // 2. Pause for 3 seconds so the candidate can digest the feedback visually
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Automatically transition!
      if (currentIndex + 1 >= questions.length) {
        finishInterview();
      } else {
        setAnswer("");
        setFeedback("");
        await speakText("Alright, let's move to the next question.");
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => {
          if (isMicOn) startMic();
        }, 500);
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
        {/*video section*/}

        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden'>
            <video src={femaleVideo} ref={videoRef} key={videoSource} muted playsInline preload='auto' className='w-full h-auto object-cover'/>

          </div>

          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>
                {subtitle}
              </p>
            </div>
          )}

          {/*timer area*/}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              {isAIPlaying&&<span className='text-sm font-semibold text-emerald-600'>
                {isAIPlaying?"AI Speaking":""}
              </span>}
            </div> 

            <div className="h-px bg-gray-200"></div>
            
            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit||60}/>
            </div>
          <div className="h-px bg-gray-200"></div>

          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <span className="text-2xl font-bold text-emerald-600">{currentIndex+1}</span>
              <span className="text-xs text-gray-400">Current Questions</span>
            </div>

            <div>
              <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
              <span className="text-xs text-gray-400">Total Questions</span>
            </div>
          </div>

          </div>

        </div>

        {/*text section */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

          {!isIntroPhase&&(<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
            Question{currentIndex+1}of{questions.length}
            </p>

            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>
              {typeof currentQuestion === "string" ? currentQuestion : currentQuestion?.question}
            </div>

          </div>)}

          <textarea
            value={answer} 
            onChange={(e) => setAnswer(e.target.value)} 
            disabled={isSubmitting || isAIPlaying || timeLeft === 0} 
            placeholder="Type your answer here..."
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 disabled:opacity-50"
          />

          {!feedback?(<div className='flex items-center gap-4 mt-6'>
            {/* Microphone Toggle Button */}
            <motion.button
              onClick={toggleMic}
              whileTap={{ scale: 0.9 }}
              className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'
            >
            {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
            </motion.button>

            {/* Submit Action Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => submitAnswer(false)} 
              disabled={isSubmitting || isAIPlaying || (!answer.trim() && timeLeft > 0)}
              className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'
            >
              {isSubmitting ? "Submitting..." : currentIndex === questions.length - 1 ? "Finish Interview" : "Submit Answer"}
            </motion.button>
          </div>):(

            // ✅ REMOVED BUTTON, ADDED AUTO-TRANSITION TEXT
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'
            >
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>
              
              <div className='w-full text-emerald-600 py-2 flex items-center justify-center gap-2 font-medium'>
                <FaSpinner className="animate-spin" /> Moving to next question...
              </div>

            </motion.div>

          )}

        </div>

      </div>
    </div>
  )
}

export default Step2Interview