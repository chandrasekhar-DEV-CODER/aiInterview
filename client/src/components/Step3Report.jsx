import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'motion/react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';



// ✅ MUST have curly braces and MUST be named 'report'
const Step3Report = ({ report }) => { 
  
    const navigate = useNavigate();

  // Safe console log to see your data!
  console.log("Report Data Received:", report);

  // Failsafe so the page doesn't crash if data is delayed
  if (!report) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Loading Report...</p>
    </div>
  );
}
 const {
  finalScore = 0,
  confidence = 0,
  communication = 0,
  correctness = 0,
  questionWiseScore = [],
} = report;



const questionScoreData = questionWiseScore.map((score, index) => ({
  name: `Q${index + 1}`,
  score: score.score || 0
}))

const skills = [
  { label: "Confidence", value: confidence },
  { label: "Communication", value: communication },
  { label: "Correctness", value: correctness },
];

let performanceText = "";
let shortTagline = "";

if (finalScore >= 8) {
  performanceText = "Ready for job opportunities.";
  shortTagline = "Excellent clarity and structured responses.";
} else if (finalScore >= 5) {
  performanceText = "Needs minor improvement before interviews";
  shortTagline = "Good foundation, refine articulation.";
}
else{
  performanceText = "Significant improvement reqiured before interviews";
  shortTagline = "Work on clarity and confidence";

}

  const score=finalScore;
  const percentage=(score/10)*100;

  const downloadPDF = () => {
  // 1. Initialize document (Portrait, Millimeters, A4)
  const doc = new jsPDF("p", "mm", "a4");

  // 2. Setup Layout Measurements
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 20;

  // 3. Render the Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94); // Green title
  doc.text("AI Interview Performance Report", pageWidth / 2, currentY, { align: "center" });

  currentY += 5;
  doc.setDrawColor(34, 197, 94);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 15;

  // =================== FINAL SCORE BOX ===================
  doc.setFillColor(248, 253, 244);
  doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, { align: "center" });
  currentY += 30;

  // ================= SKILLS BOX =================
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");
  doc.setFontSize(12);
  doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
  doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
  doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);
  currentY += 40;

  // ================= ADVICE =================
  let advice = "";
  if (finalScore >= 8) {
    advice = "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
  } else if (finalScore >= 5) {
    advice = "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
  } else {
    advice = "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
  }

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
  const adviceHeight = (splitAdvice.length * 7) + 15; // Dynamic height based on text lines

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, adviceHeight, 4, 4);
  
  doc.setFont("helvetica", "bold");
  doc.text("Professional Advice", margin + 10, currentY + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(splitAdvice, margin + 10, currentY + 16);
  
  currentY += adviceHeight + 15;

  // ================= TABLE =================
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Question", "Score", "Feedback"]],
    body: questionWiseScore.map((q, i) => [
      `${i + 1}`, 
      q.question, 
      `${q.score}/10`, 
      q.feedback
    ]), // FIXED: Corrected mapping syntax and closing brackets
    styles: { 
      fontSize: 9, 
      cellPadding: 5, 
      valign: "top" 
    },
    headStyles: { 
      fillColor: [34, 197, 94], 
      textColor: 255, 
      halign: "center" 
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: "auto" },
    },
    alternateRowStyles: { 
      fillColor: [249, 250, 251] 
    },
  });

  doc.save("AI_Interview_Report.pdf");
};




  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10'>
      <div className='mb-8 flex flex-col sm:flex-row  sm:items-center'>
        
        <div className='mb:mb-10 w-full flex items-start gap-4'>
          <button 
            onClick={() => navigate("/history")}
            className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'
          >
            <FaArrowLeft className='text-gray-600' />
          </button>

          <div>
            <h1 className='text-3xl font-bold flex-nowrap text-gray-800'>
              Interview Analytics Dashboard
            </h1>
            <p className='text-gray-500 mt-2'>
              Ai-powerd performance insights and analysis.
            </p>
          </div>
        </div>

        <button onClick={downloadPDF} className='bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base'>
          Download PDF
        </button>


      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
      <div className='space-y-6'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center"
        >

          <h3 className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
            Overall Performance
          </h3>

          {/* Content goes here */}

          <div className='relative w-36 h-36 sm:w-25 sm:h-25 mx-auto'> {/* ✅ Made it a bit bigger and centered it! */}
                <CircularProgressbar
                  value={finalScore * 10} // ✅ Math: If score is 8, percentage is 80
                  text={`${finalScore}/10`} // ✅ Uses your actual finalScore variable
                  styles={buildStyles({
                    textSize: "28px",
                    pathColor: "#10b981", // Emerald green
                    textColor: "#1f2937", // Dark gray (red is too aggressive for a good score!)
                    trailColor: "#e5e7eb",
                  })}
                />
          </div>


          <p className="text-gray-400 mt-3 text-xs sm:text-sm">
            Out of 10
          </p>

          <div className="mt-4">
            <p className="font-semibold text-gray-800 text-sm sm:text-base">
              {performanceText}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {shortTagline}
            </p>
          </div>


        </motion.div>
        <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8'
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
        Skill Evaluation
      </h3>

      <div className='space-y-5'>
      {skills.map((s, i) => (
        <div key={i}>
          {/* Label and Percentage Row */}
          <div className='flex justify-between mb-2 text-sm sm:text-base'>
            <span>{s.label}</span>
            <span className='font-semibold text-green-600'>{s.value}%</span>
          </div>

          <div className='bg-gray-200 h-2 sm:h-3 rounded-full'>
            <div 
              className='bg-green-500 h-full rounded-full'
              style={{ width: `${s.value * 10}%` }}
            ></div>
          </div>




          </div>
      ))}
      </div>


    </motion.div>
      </div>

      <div className='lg:col-span-2 space-y-6'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'
        >
          <h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6'>
            Performance Trend
          </h3>

          <div className='h-64 sm:h-72'>
            <ResponsiveContainer width="100%" height="100%" aspect={2.5}>
              <AreaChart data={questionScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#22c55e"
                  fill="#bbf7d0"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>

        </motion.div>


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
            Question Breakdown
          </h3>
          <div className='space-y-6'>
            {questionWiseScore.map((q, i) => (
              <div 
                key={i} 
                className='bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200'
              >
                {/* Item content would go here */}

                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                  <div>
                    <p className="text-xs text-gray-400">
                      Question {i + 1}
                    </p>

                    <p className="font-semibold text-gray-800 sm:text-base leading-relaxed">
                      {q.question || "Question not available"}
                    </p>
                  </div>


                  <div className='bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit'>
                    {q.score ?? 0}/10
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold mb-1">
                    AI Feedback
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">

                    {q.feedback && q.feedback.trim() !== "" 
                      ? q.feedback 
                      : "No feedback available for this question."}

                  </p>
                </div>




              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </div>


    </div>

  )
}

export default Step3Report;