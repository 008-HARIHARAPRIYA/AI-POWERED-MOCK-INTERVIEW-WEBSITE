import React from "react";
import Navbar from "./Navbar";
import "./Home.css";
import { dummyInterviews } from "../data/dummyInterviews";
import InterviewCard from "./InterviewCard";

function Home() {
  let user = {};
  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
      if (user.profileImage && !user.profileImage.startsWith("http")) {
        user.profileImage = `http://localhost:5000/${user.profileImage}`;
      }
    } catch (err) {
      console.error("Failed to parse user:", err);
      user = {};
    }
  }

  return (
    <>
      <Navbar name={user.name} profileImage={user.profileImage} />

      <div className="home-container">
        {/* Intro card */}
        <div className="intro-card">
          <div className="intro-text">
            <h2>
              Get Interview-Ready with AI-Powered Practice & Feedback <br />
              <span className="highlight">
                Practice on real interview questions & get instant feedback
              </span>
            </h2>
            <button className="start-btn">Start an Interview</button>
          </div>
          <div className="intro-image">
            <img
              src="https://rhcc.fr/wp-content/uploads/2024/11/ia-Intelligence-Artificielle-Recrutement.webp"
              alt="AI Interview"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="sections-container">
          {/* Your Interviews Section */}
          <div className="section">
            <h3>Your Interviews</h3>
            {dummyInterviews.length === 0 ? (
              <p>You haven’t taken any interviews yet</p>
            ) : (
              <div className="interview-cards-container">
                {dummyInterviews.map((interview) => (
                  <InterviewCard key={interview.id} {...interview} />
                ))}
              </div>
            )}
          </div>

          {/* Take an Interview Section */}
          <div className="section">
            <h3>Take an Interview</h3>
            <p>There are no interviews available</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
