import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyLogos, techLogos } from "../data/dummyInterviews";
import "./InterviewCard.css";

function InterviewCard({ role, type, techstack, createdAt }) {
  const [logo, setLogo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const randomLogo = companyLogos[Math.floor(Math.random() * companyLogos.length)];
    setLogo(randomLogo);
  }, []);

  return (
    <div className="interview-card">
      {/* Logo top-left */}
      <div className="logo-section">
        <img src={logo} alt="Company Logo" />
      </div>

      {/* Type badge top-right */}
      <div className="type-badge">{type}</div>

      {/* Info Section */}
      <div className="info-section">
        {/* Role + "Interview" */}
        <h3>{role} Interview</h3>

        {/* Date & rating on same line */}
        <div className="date-rating-row" style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "2px" }}>
          <div className="date-section" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="calendar-icon" style={{ fontSize: "16px" }}>📅</span>
            <span className="created-at">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="rating-section" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "18px", color: "#ffd700" }}>★</span>
            <span style={{ color: "#bdbdbd", fontSize: "15px" }}>--/100</span>
          </div>
        </div>

        {/* Message below date/rating */}
        <div className="interview-message" style={{ color: "#bdbdbd", fontSize: "13px", marginBottom: "8px", fontWeight: "500", textAlign: "left" }}>
          You haven't taken the interview yet.<br />
          <span style={{ color: "#bdbdbd", fontWeight: "normal" }}>Take it now to improve your skills.</span>
        </div>

        {/* Techstack with logos */}
        <div className="techstack">
          {techstack.map((tech, index) => (
            <div key={index} className="tech-item">
              <img src={techLogos[tech]} alt={tech} className="tech-logo" />
              <span className="tech-name">{tech}</span>
            </div>
          ))}
        </div>

        {/* View Interview Button */}
        <button
          className="view-btn"
          onClick={() => navigate("/agent")}
        >
          View Interview
        </button>
      </div>
    </div>
  );
}

export default InterviewCard;



