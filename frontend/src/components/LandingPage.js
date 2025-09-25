import React from "react";
import "./LandingPage.css";

function LandingPage() {
  const handleStart = () => {
    window.location.href = "/auth"; // Navigate to login/signup
  };

  return (
    <div className="landing-page">
      <div className="overlay">
        <div className="content text-center">
          <h1 className="app-name">MockMate</h1>
          <p className="description">
            Prepare smart with real-time mock interviews and actionable feedback, powered by AI.
          </p>
          <button className="start-btn" onClick={handleStart}>
            Start a Mock Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
