import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import axios from 'axios'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice.js';
import InterviewPage from './pages/InterviewPage.jsx'
import Step1SetUp from './components/Step1SetUp.jsx'
import Step2Interview from './components/Step2Interview.jsx'
import Step3Report from './components/Step3Report.jsx'
import ViewHistory from './pages/InterviewHistory.jsx'
import Pricing from './pages/Pricing.jsx'
import InterviewReport from './pages/InterviewReport.jsx'

export const ServerURL = 'http://localhost:8000';





const App = () => {

  const dispatch = useDispatch();


  useEffect(() => {
  const getUser = async () => {
    try {
      const result = await axios.get(ServerURL+"/api/user/current-user", {
        withCredentials: true, // Include cookies in the request
      });
      dispatch(setUserData(result.data)); // Store user data in Redux 
      const user = result.data;
      console.log("Current user:", user);
    } catch (error) {
      if (error.response && error.response.status === 401) {
    // Not logged in, clear user
    dispatch(setUserData(null));
  } else {
    console.error("Unexpected error fetching current user:", error);
  }
}
  };

  getUser();
}, [dispatch]);


  return (

    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/history' element={<ViewHistory />} />
      <Route path='/pricing' element={<Pricing />} />
      <Route path='/report/:id' element={<InterviewReport/>}/>
       
       </Routes> 
  )
}

export default App
