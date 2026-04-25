import React from 'react';
import { BsRobot } from 'react-icons/bs';
import { IoSparkles } from 'react-icons/io5';
import { motion } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from '../utils/firebase.js';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice.js';

// Backend URL (from .env or fallback)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const Auth = ({ isModel = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      // Sign in with Google (Firebase)
      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      console.log("Firebase User Object:", user);

      // Send user info to backend
      const res = await fetch(`${SERVER_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // allow cookies
        body: JSON.stringify({ name: user.displayName, email: user.email })
      });

      const data = await res.json();

      // ✅ Store user object in Redux
      dispatch(setUserData(data.user));

      console.log("Backend response:", data);

      // ✅ Redirect to Home after login
      navigate("/");

      // ✅ Force reload so NavBar updates immediately
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing in with Google:", error);
      dispatch(setUserData(null)); // Clear user data on error
    }
  };

  return (
    <div
      className={`w-full ${isModel ? 'min-h-screen fixed inset-0 z-[999]' : ''} 
      bg-[#f3f3f3] flex items-center justify-center px-4 py-20`}
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2>InterviewIQ</h2>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          continue with
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} /> AI smart interview
          </span>
        </h1>

        <p className="text-gray-600 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to your account to continue
        </p>

        {/* Google Sign-in Button */}
        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ opacity: 0.9, scale: 0.98 }}
          whileTap={{ opacity: 1, scale: 0.9 }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
        >
          <FcGoogle size={20} />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Auth;
