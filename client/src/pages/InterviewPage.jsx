import React, { useState } from 'react';
import Step1Setup from '../components/Step1Setup.jsx';
import Step2Interview from '../components/Step2Interview.jsx';
import Step3Report from '../components/Step3Report.jsx';

const InterviewPage = () => {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className="sm:min-h-screen bg-gray-50">
      {step === 1 && (
        <Step1Setup
          // Step 1 calls this function when the AI finishes
          onStart={(data) => {
            console.log("Transitioning to Step 2 with:", data);
            setInterviewData(data); // Saves the 5 questions and ID
            setStep(2);             // Hides Step 1, shows Step 2!
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          // We pass the saved data straight into Step 2
          interviewData={interviewData} 
          onFinish={(report) => {
            setInterviewData(report); 
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Report report={interviewData} />
      )}
    </div>
  );
};

export default InterviewPage;