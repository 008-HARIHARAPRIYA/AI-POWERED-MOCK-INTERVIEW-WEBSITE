import React, { useState } from "react";
import Navbar from "./Navbar";
import "./Agent.css"; // stylesheet

function Agent() {
  const [animate, setAnimate] = useState(false);

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

  return (
    <>
      <Navbar name={user.name} profileImage={user.profileImage} />
      <div className="agent-page">
        <h2 className="title">Interview Generation</h2>
        <br /> <br />
        <br /> <br />
        <div className="cards">
          {/* AI Interviewer Card */}
          <div className="card interviewer-card">
            <div className={`logo-circle ${animate ? "speaking-animation" : ""}`}>
              <img src="https://img.freepik.com/premium-photo/cute-mini-robot_553012-44382.jpg?w=996" alt="App Logo" className="app-logo" />
            </div>
            <div className="card-title">AI Interviewer</div>
          </div>

          {/* User Card */}
          <div className="card user-card">
            <div className="logo-circle">
              <img
                src={user.profileImage}
                alt="You"
                className="user-avatar"
              />
            </div>
            <div className="card-title">You</div>
          </div>
        </div>

        {/* Message Bar */}
        <div className="message-bar">
          My name is John Doe, nice to meet you!
        </div>

        {/* Toggle Button */}
        <button className="go-btn" onClick={() => setAnimate(!animate)}>
          {animate ? "End" : "Go!"}
        </button>
      </div>
    </>
  );
}

export default Agent;
