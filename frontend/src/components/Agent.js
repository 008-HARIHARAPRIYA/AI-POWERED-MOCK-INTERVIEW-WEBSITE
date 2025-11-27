// Agent.js - FINAL WORKING VERSION
import React, { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import Navbar from "./Navbar";
import "./Agent.css";

function Agent() {
  const [animate, setAnimate] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [message, setMessage] = useState("Click 'Start Interview' to begin");
  const [transcript, setTranscript] = useState([]);

  const vapiRef = useRef(null);
  const transcriptRef = useRef([]);

  // ✅ Load logged-in user
  let user = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
      if (user.profileImage && !user.profileImage.startsWith("http")) {
        user.profileImage = `http://localhost:5000/${user.profileImage}`;
      }
    }
  } catch {
    user = {};
  }

  useEffect(() => {
    console.log("🚀 Initializing VAPI...");
    const vapi = new Vapi(process.env.REACT_APP_VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    // 📞 Call Started
    vapi.on("call-start", () => {
      console.log("✅ Call started");
      setIsCallActive(true);
      setAnimate(true);
      setMessage("Interview in progress...");
      transcriptRef.current = [];
      setTranscript([]);
    });

    // 📞 Call Ended
    vapi.on("call-end", async () => {
      console.log("📞 Call ended");
      console.log("📋 Final transcript:", transcriptRef.current);

      setIsCallActive(false);
      setAnimate(false);
      setMessage("Processing your responses...");

      if (transcriptRef.current.length > 0) {
        await saveTranscript();
      } else {
        setMessage("No responses recorded.");
      }
    });

    // 🎙 Transcript Events
    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newEntry = {
          role: message.role,
          text: message.transcript,
          timestamp: new Date().toISOString(),
        };

        transcriptRef.current = [...transcriptRef.current, newEntry];
        setTranscript((prev) => [...prev, newEntry]);

        if (message.role === "assistant") {
          setMessage(message.transcript);
        }
      }

      if (message.type === "speech-start") setAnimate(true);
      if (message.type === "speech-end") setAnimate(false);
    });

    vapi.on("error", (err) => {
      console.error("❌ VAPI Error:", err);
      setMessage("An error occurred. Please try again.");
      setIsCallActive(false);
    });

    return () => {
      if (vapiRef.current) vapiRef.current.stop();
    };
  }, []);

  /**
   * 💾 Save Transcript After Interview
   */
  const saveTranscript = async () => {
    try {
      const userId = user.userId; // 🔥 Correct userId
      console.log("💾 Saving transcript for userId:", userId);

      const response = await fetch(
        "http://localhost:5000/api/vapi/process-transcript",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            transcript: transcriptRef.current,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Interview completed! Redirecting...");
        setTimeout(() => (window.location.href = "/dashboard"), 2000);
      } else {
        setMessage("Failed to save your responses: " + data.message);
      }
    } catch (err) {
      console.error("❌ Transcript save error:", err);
      setMessage("Failed to save your responses.");
    }
  };

  /**
   * ▶ Start Interview
   */
  const startInterview = async () => {
    try {
      const userId = user.userId;
      const username = user.name || "User";

      console.log("🎯 Starting interview with userId:", userId);

      setMessage("Connecting to interview assistant...");

      await vapiRef.current.start(
        null,
        null,
        null,
        process.env.REACT_APP_VAPI_WORKFLOW_ID,
        {
          variableValues: {
            userId,
            username,
            role: localStorage.getItem("interviewRole") || "",
            type: localStorage.getItem("interviewType") || "",
            level: localStorage.getItem("interviewLevel") || "",
            techstack: localStorage.getItem("interviewTechstack") || "",
            amount: Number(localStorage.getItem("interviewAmount")) || 2,
          },
        }
      );
    } catch (error) {
      console.error("❌ Error starting interview:", error);
      setMessage("Failed to start interview.");
      setIsCallActive(false);
    }
  };

  /**
   * ⏹ End Interview
   */
  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setMessage("Interview ended manually");
    }
  };

  const toggleCall = () => {
    if (isCallActive) endCall();
    else startInterview();
  };

  return (
    <>
      <Navbar name={user.name} profileImage={user.profileImage} />

      <div className="agent-page">
        <h2 className="title">AI Mock Interview</h2>
        <br /><br /><br />

        <div className="cards">
          <div className="card interviewer-card">
            <div className={`logo-circle ${animate ? "speaking-animation" : ""}`}>
              <img
                src="https://img.freepik.com/premium-photo/cute-mini-robot_553012-44382.jpg?w=996"
                alt="App Logo"
                className="app-logo"
              />
            </div>
            <div className="card-title">AI Interviewer</div>
          </div>

          <div className="card user-card">
            <div className="logo-circle">
              <img src={user.profileImage} alt="You" className="user-avatar" />
            </div>
            <div className="card-title">You</div>
          </div>
        </div>

        <div className="message-bar">{message}</div>

        <button className="go-btn" onClick={toggleCall} disabled={!user.name}>
          {isCallActive ? "End Interview" : "Start Interview"}
        </button>

        {transcript.length > 0 && (
          <div className="transcript-display">
            <h3>Live Transcript ({transcript.length} messages):</h3>
            <div className="transcript-messages">
              {transcript.map((msg, idx) => (
                <div key={idx} className={`transcript-message ${msg.role}`}>
                  <strong>{msg.role === "user" ? "You" : "Interviewer"}:</strong>{" "}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔧 DEBUG BOX */}
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            fontSize: "12px",
            maxWidth: "300px",
            borderRadius: "5px",
          }}
        >
          <strong>Debug Info:</strong>
          <div>Call Active: {isCallActive ? "Yes" : "No"}</div>
          <div>Transcript Count: {transcript.length}</div>
          <div>User: {user.name}</div>
          <div>UserId: {user.userId}</div>
        </div>
      </div>
    </>
  );
}

export default Agent;
