/*import React, { useState } from 'react';
import { motion } from "motion/react";
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaMicrophoneAlt, FaChartLine, FaBriefcase, FaFileUpload, FaCheckCircle, FaRobot } from "react-icons/fa";
import axios from 'axios';
import { ServerURL } from '../App.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';

const Step1SetUp = ({ onStart }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [interviewType, setInterviewType] = useState("Standard"); // ✅ Added state
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const ServerUrl = ServerURL || "http://localhost:8000";

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/resume", formData, { withCredentials: true });
      setResumeText(result.data.resumeText || "");
      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setAnalysisDone(true);
    } catch (error) {
      console.error("Failed to upload resume:", error);
      alert("Error analyzing resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/generate-questions", {
        role, experience, mode, resumeText, projects, skills, interviewType // ✅ Pass it to backend
      }, { withCredentials: true });
      
      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
      }
      if (onStart) onStart(result.data);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Could not generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
      >
        //{ Left Section }
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 lg:p-12 flex flex-col justify-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
            Start your AI Interview
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Practice real interview scenarios with our AI assistant. Improve communication skills in a safe environment.
          </p>
          <div className="space-y-4">
            {[
              { icon: <FaUserTie className="text-green-600 w-6 h-6" />, text: "Simulate real interview scenarios with our AI assistant." },
              { icon: <FaMicrophoneAlt className="text-green-600 w-6 h-6" />, text: "Practice communication skills in a safe environment." },
              { icon: <FaChartLine className="text-green-600 w-6 h-6" />, text: "Get instant feedback to improve your performance." },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 bg-white rounded-xl p-5 shadow-sm border border-green-50">
                <div className="bg-green-100 p-3 rounded-full">{item.icon}</div>
                <span className="text-gray-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        //{ Right Section }
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Set Up Your Profile</h2>
          <div className="space-y-6 w-full">
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-gray-400" />
              <input type="text" placeholder="Enter role" onChange={(e) => setRole(e.target.value)} value={role} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 hover:bg-white" />
            </div>

            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-gray-400" />
              <input type="text" placeholder="Enter experience level" onChange={(e) => setExperience(e.target.value)} value={experience} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 hover:bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 hover:bg-white cursor-pointer">
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                </select>

               // {/* ✅ Added Interview Type Select }
                <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 hover:bg-white cursor-pointer font-medium text-green-700">
                <option value="Standard">Standard (5 Questions)</option>
                <option value="Dynamic">Dynamic (AI Follow-ups)</option>
                </select>
            </div>

            {!analysisDone && (
              <div onClick={() => document.getElementById("resumeupload").click()} className='border-2 border-dashed border-green-300 rounded-xl p-6 text-center bg-green-50/50 cursor-pointer hover:bg-green-50 transition-colors group'>
                <FaFileUpload className='text-4xl mx-auto text-green-500 mb-3 group-hover:scale-110 transition-transform duration-300'/>
                <input type="file" id="resumeupload" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} className="hidden" />
                <p className='text-gray-700 font-medium'>{resumeFile ? resumeFile.name : "Click to Upload Resume"}</p>
                {resumeFile && (
                  <button onClick={(e) => { e.stopPropagation(); handleUploadResume(); }} className='mt-4 w-full bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition font-medium'>
                    {analyzing ? "Analyzing Resume..." : "Extract Data from Resume"}
                  </button>
                )}
              </div>
            )}

            {analysisDone && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 text-green-700 font-bold text-lg mb-3">
                  <FaCheckCircle /> <span>Analysis Complete</span>
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Role:</strong> {role}</p>
                  <p><strong>Top Skills:</strong> {Array.isArray(skills) ? skills.slice(0, 5).join(", ") : "N/A"}</p>
                  <p><strong>Key Project:</strong> {projects.length > 0 ? (projects[0]?.title || projects[0]?.name || (typeof projects[0] === 'string' ? projects[0] : "N/A")) : "N/A"}</p>
                </div>
                <button onClick={() => setAnalysisDone(false)} className="mt-3 text-sm text-green-600 font-medium hover:underline">
                  Upload a different resume
                </button>
              </motion.div>
            )}

            <button onClick={handleStart} disabled={!role || !experience || analyzing} className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4">
              {loading ? "Preparing Interview Room..." : "Start Interview"}     
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Step1SetUp;*/