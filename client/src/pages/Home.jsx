import React from 'react'
import NavBar from '../components/NavBar.jsx'
import { useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsMic, BsClock, BsBarChart, BsFileEarmarkText } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import AuthModel from '../components/AuthModel.jsx'
import hrImg from "../assets/HR.png"
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer.jsx';
const Home = () => {
    const { userData } = useSelector((state) => state.user);
    const [showAuth, setShowAuth] = React.useState(false);
    const navigate = useNavigate();

    return (
        <>
            <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
                <NavBar />
                <div className="flex-1 px-6 py-20">

                    <div className='max-w-6xl mx-auto'>
                        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex justify-center items-center w-fit mx-auto mb-6">
                            <HiSparkles size={16} className="text-green-500 mr-2 bg-green-100" />
                            AI Smart Interview
                        </div>
                    </div>

                    <div className='text-center mb-28'>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.6 }} 
                            className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'
                        >
                            Practice Interviews with
                            <span className='relative inline-block ml-2'>
                                <span className='bg-green-100 text-green-600 px-5 py-1 rounded-full'>
                                    AI Smart Interview
                                </span>
                            </span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.6, delay: 0.3 }} 
                            className='text-gray-600 text-lg md:text-xl mt-6 max-w-2xl mx-auto'
                        >
                            role-based mock interviews, instant feedback, and personalized question sets to help you ace your next interview.
                        </motion.p>

                        <div className='flex flex-wrap justify-center gap-4 mt-8'>
                            <motion.button
                                onClick={() => {
                                    if (!userData) {
                                        setShowAuth(true);
                                        return;
                                    }
                                    navigate("/interview");
                                }}
                                whileHover={{ opacity: 0.9, scale: 1.03 }}
                                whileTap={{ opacity: 1, scale: 0.98 }}
                                className="bg-black text-white px-10 py-3 rounded-full hover:opacity-90 transition shadow-md"
                            >
                                Start Interview
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    if (!userData) {
                                        setShowAuth(true);
                                        return;
                                    }
                                    navigate("/history");
                                }}
                                whileHover={{ opacity: 0.9, scale: 1.03 }}
                                whileTap={{ opacity: 1, scale: 0.98 }}
                                className="border border-gray-800 text-gray-800 px-10 py-3 rounded-full hover:bg-gray-800 hover:text-white transition shadow-md"
                            >
                                View Interview History
                            </motion.button>
                        </div>

                        <div className='flex flex-col md:flex-row justify-center items-center gap-10 mt-10 mb-28'>
                            {[
                                { icon: <BsRobot size={24} />, step: "STEP 1", title: "Role & Experience Selection", desc: "AI selects interview questions based on your chosen role and experience level." },
                                { icon: <BsMic size={24} />, step: "STEP 2", title: "Conduct Mock Interview", desc: "Engage in a realistic mock interview with AI, answering questions verbally or through text." },
                                { icon: <BsClock size={24} />, step: "STEP 3", title: "Instant Feedback", desc: "Receive immediate feedback on your answers, including strengths and areas for improvement." }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 60 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 + index * 0.2 }}
                                    whileHover={{ rotate: 0, scale: 1.06 }}
                                    className={`relative bg-white rounded-3xl border-2 border-green-100 hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300 ${index === 0 ? "rotate-[-4deg]" : ""} ${index === 1 ? "rotate-[3deg] md:-mt-10 shadow-xl" : ""} ${index === 2 ? "rotate-[-3deg]" : ""}`}
                                >
                                    <div className='w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4'>
                                        {item.icon}
                                    </div>
                                    <p className='text-xs text-gray-500 mb-1 font-medium'>{item.step}</p>
                                    <h3 className='font-bold text-xl mb-2 text-gray-800'>{item.title}</h3>
                                    <p className='text-gray-600 text-sm leading-relaxed'>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className='mb-32'>
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='text-4xl font-semibold text-center mb-16'>
                                Advanced AI <span className="text-green-600">Capabilities</span>
                            </motion.h2>

                            <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-4">
                                {[
                                    { image: evalImg, icon: <BsBarChart size={20} />, title: "AI Answer Evaluation", desc: "Scores communication, technical accuracy and confidence." },
                                    { image: resumeImg, icon: <BsFileEarmarkText size={20} />, title: "Resume Based Interview", desc: "Project-specific questions based on uploaded resume." },
                                    { image: pdfImg, icon: <BsFileEarmarkText size={20} />, title: "Downloadable PDF Report", desc: "Detailed strengths, weaknesses and insights." },
                                    { image: analyticsImg, icon: <BsBarChart size={20} />, title: "History Analytics", desc: "Track and analyze your interview performance over time." }
                                ].map((item, index) => (
                                    <div key={index} className='bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all'>
                                        <div className='flex flex-col md:flex-row items-center gap-8'>
                                            <div className='w-full md:w-1/2 flex justify-center'>
                                                <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-40' />
                                            </div>
                                            <div className='w-full md:w-1/2'>
                                                <div className='bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6'>
                                                    {item.icon}
                                                </div>
                                                <h3 className="font-semibold text-xl">{item.title}</h3>
                                                <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- UPDATED SECTION BELOW --- */}
                        <div className='mb-32'>
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='text-4xl font-semibold text-center mb-16'>
                                Multiple Interview <span className="text-green-600">Modes</span>
                            </motion.h2>

                            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
                                {[
                                    { img: hrImg, title: "HR Interview Mode", desc: "Behavioral and communication-based evaluation." },
                                    { img: techImg, title: "Technical Mode", desc: "Deep technical questioning based on selected role." },
                                    { img: confidenceImg, title: "Confidence Detection", desc: "Basic tone and voice analysis insights." },
                                    { img: creditImg, title: "Credits System", desc: "Unlock premium interview sessions easily." }
                                ].map((item, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex items-center">
                                        {/* Left Side: Text */}
                                        <div className="w-full md:w-3/5 text-left pr-4">
                                            <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                        {/* Right Side: Image */}
                                        <div className="w-full md:w-2/5 flex justify-center">
                                            <img src={item.img} alt={item.title} className="w-20 h-20 object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

                    <Footer />
            </div>
        
        </>
    )
}

export default Home