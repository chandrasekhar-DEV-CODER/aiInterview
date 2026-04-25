import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from "motion/react";
import { BsRobot, BsCoin } from 'react-icons/bs';
import { FaUserAstronaut } from 'react-icons/fa'; 
import { HiOutlineLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerURL } from '../App.jsx';
import { setUserData } from '../redux/userSlice.js';
import AuthModel from './AuthModel.jsx';

const NavBar = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCreditsPopup, setShowCreditsPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(`${ServerURL}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      setShowUserPopup(false);
      navigate('/auth'); // redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="w-full max-w-6xl flex items-center justify-between bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 relative"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h1 className="text-xl font-bold hidden mb:block">interviewiq</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6 relative">
          {/* Credits */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditsPopup(!showCreditsPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors duration-300"
            >
              <BsCoin size={20} />
              {userData ? userData.credits : 0}
            </button>
            {showCreditsPopup && (
              <div className="absolute right-[-50px] mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                <p className="px-4 py-2 text-gray-700">
                  Need more credits to continue interview?
                </p>
                <button
                  onClick={() => navigate('/buy-coins')}
                  className="w-full bg-black text-white py-2 rounded-lg text-sm"
                >
                  Buy Credits
                </button>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="relative">
            <div
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold cursor-pointer"
              onClick={() => {
                if (!userData) {
                  setShowAuth(true); // open Auth modal if not logged in
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditsPopup(false);
              }}
            >
              {userData && userData.name
                ? userData.name.charAt(0).toUpperCase()
                : <FaUserAstronaut size={16} />}
            </div>
            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl border-gray-200 shadow-xl py-2 z-10">
                <p className="px-4 py-2 text-gray-700">
                  {userData ? userData.name : 'Guest'}
                </p>
                <button
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate('/history');
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200"
                >
                  Interview history
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-700 flex items-center gap-2"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default NavBar;
