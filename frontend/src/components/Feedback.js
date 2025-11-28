// Feedback.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Feedback.css";

function Feedback() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  let user = {};
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
      if (user.profileImage && !user.profileImage.startsWith("http")) {
        user.profileImage = `http://localhost:5000/${user.profileImage}`;
      }
    } catch {
      user = {};
    }
  }

  useEffect(() => {
    fetchFeedback();
  }, [interviewId]);

  const fetchFeedback = async () => {
    try {
      const id = interviewId || localStorage.getItem("lastInterviewId");
      
      if (!id) {
        setError("No interview ID found");
        setLoading(false);
        return;
      }

      console.log("📊 Fetching feedback for interview:", id);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/interviews/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const data = await response.json();
      console.log("✅ Feedback loaded:", data);
      
      setFeedbackData(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching feedback:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (!feedbackData?.feedback) return 0;
    
    const scores = [
      feedbackData.feedback.communicationSkills?.score || 0,
      feedbackData.feedback.technicalKnowledge?.score || 0,
      feedbackData.feedback.problemSolving?.score || 0,
      feedbackData.feedback.culturalFit?.score || 0,
      feedbackData.feedback.confidenceAndClarity?.score || 0,
    ];

    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#4ade80"; // Green
    if (score >= 60) return "#fbbf24"; // Yellow
    if (score >= 40) return "#fb923c"; // Orange
    return "#ef4444"; // Red
  };

  const getGradeFromScore = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    return "D";
  };

  const downloadPDF = async () => {
    setDownloadingPDF(true);
    
    try {
      const feedbackElement = document.getElementById("feedback-container");
      
      // Temporarily hide download button
      const downloadBtn = document.querySelector(".download-btn");
      if (downloadBtn) downloadBtn.style.display = "none";

      const canvas = await html2canvas(feedbackElement, {
        scale: 2,
        backgroundColor: "#0f0818",
        logging: false,
      });

      // Show download button again
      if (downloadBtn) downloadBtn.style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      pdf.save(
        `Interview_Feedback_${feedbackData.role}_${new Date().toISOString().split("T")[0]}.pdf`
      );

      console.log("✅ PDF downloaded successfully");
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar name={user.name} profileImage={user.profileImage} />
        <div className="feedback-page">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your feedback...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !feedbackData) {
    return (
      <>
        <Navbar name={user.name} profileImage={user.profileImage} />
        <div className="feedback-page">
          <div className="error-container">
            <h2>😕 Oops!</h2>
            <p>{error || "Could not load feedback"}</p>
            <button onClick={() => navigate("/dashboard")} className="back-btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const overallScore = calculateOverallScore();
  const grade = getGradeFromScore(overallScore);

  return (
    <>
      <Navbar name={user.name} profileImage={user.profileImage} />
      <div className="feedback-page">
        <div className="feedback-container" id="feedback-container">
          
          {/* Header Section */}
          <div className="feedback-header">
            <div className="header-content">
              <h1 className="feedback-title">
                🎯 Interview Performance Report
              </h1>
              <p className="feedback-subtitle">
                {feedbackData.role} • {feedbackData.level} Level
              </p>
            </div>
            
            <div className="overall-score-card">
              <div className="score-circle" style={{ borderColor: getScoreColor(overallScore) }}>
                <div className="score-value">{overallScore}</div>
                <div className="score-label">Overall</div>
              </div>
              <div className="grade-badge" style={{ backgroundColor: getScoreColor(overallScore) }}>
                Grade: {grade}
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="scores-grid">
            <ScoreCard
              title="💬 Communication Skills"
              score={feedbackData.feedback.communicationSkills?.score || 0}
              feedback={feedbackData.feedback.communicationSkills?.feedback || "N/A"}
            />
            <ScoreCard
              title="🧠 Technical Knowledge"
              score={feedbackData.feedback.technicalKnowledge?.score || 0}
              feedback={feedbackData.feedback.technicalKnowledge?.feedback || "N/A"}
            />
            <ScoreCard
              title="🔧 Problem Solving"
              score={feedbackData.feedback.problemSolving?.score || 0}
              feedback={feedbackData.feedback.problemSolving?.feedback || "N/A"}
            />
            <ScoreCard
              title="🤝 Cultural Fit"
              score={feedbackData.feedback.culturalFit?.score || 0}
              feedback={feedbackData.feedback.culturalFit?.feedback || "N/A"}
            />
            <ScoreCard
              title="✨ Confidence & Clarity"
              score={feedbackData.feedback.confidenceAndClarity?.score || 0}
              feedback={feedbackData.feedback.confidenceAndClarity?.feedback || "N/A"}
            />
          </div>

          {/* Overall Feedback */}
          <div className="overall-feedback-section">
            <h2 className="section-title">📝 Overall Assessment</h2>
            <div className="overall-feedback-content">
              <p>{feedbackData.feedback.overallFeedback || "No overall feedback provided"}</p>
            </div>
          </div>

          {/* Interview Details */}
          <div className="interview-details">
            <h3>Interview Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Tech Stack:</span>
                <span className="detail-value">
                  {Array.isArray(feedbackData.techstack) 
                    ? feedbackData.techstack.join(", ") 
                    : feedbackData.techstack}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Interview Type:</span>
                <span className="detail-value">{feedbackData.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Questions Asked:</span>
                <span className="detail-value">{feedbackData.questions?.length || 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completed On:</span>
                <span className="detail-value">
                  {feedbackData.completedAt 
                    ? new Date(feedbackData.completedAt).toLocaleDateString() 
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={downloadPDF} 
              className="download-btn"
              disabled={downloadingPDF}
            >
              {downloadingPDF ? (
                <>
                  <span className="btn-spinner"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  📥 Download Report
                </>
              )}
            </button>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="dashboard-btn"
            >
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Score Card Component
function ScoreCard({ title, score, feedback }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#fbbf24";
    if (score >= 40) return "#fb923c";
    return "#ef4444";
  };

  return (
    <div className="score-card">
      <div className="score-card-header">
        <h3 className="score-card-title">{title}</h3>
        <div 
          className="score-badge" 
          style={{ backgroundColor: getScoreColor(score) }}
        >
          {score}/100
        </div>
      </div>
      <div className="score-progress-bar">
        <div 
          className="score-progress-fill" 
          style={{ 
            width: `${score}%`,
            backgroundColor: getScoreColor(score)
          }}
        ></div>
      </div>
      <p className="score-feedback">{feedback}</p>
    </div>
  );
}

export default Feedback;