// Agent.js - UPDATED VERSION WITH FEEDBACK REDIRECT
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import Navbar from "./Navbar";
import "./Agent.css";

function Agent() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [message, setMessage] = useState("Click 'Start Interview' to begin");
  const [transcript, setTranscript] = useState([]);
  
  const vapiRef = useRef(null);
  const transcriptRef = useRef([]);

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
    console.log("🚀 Initializing VAPI...");
    const vapi = new Vapi(process.env.REACT_APP_VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      console.log("✅ Call started");
      setIsCallActive(true);
      setAnimate(true);
      setMessage("Interview in progress...");
      setTranscript([]);
      transcriptRef.current = [];
    });

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

    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newEntry = {
          role: message.role,
          text: message.transcript,
          timestamp: new Date().toISOString()
        };

        transcriptRef.current = [...transcriptRef.current, newEntry];
        setTranscript(prev => [...prev, newEntry]);

        if (message.role === "assistant") {
          setMessage(message.transcript);
        }
      }

      if (message.type === "speech-start") {
        setAnimate(true);
      }
      
      if (message.type === "speech-end") {
        setAnimate(false);
      }
    });

    vapi.on("error", (error) => {
      console.error("❌ VAPI Error:", error);
      setMessage("An error occurred. Please try again.");
      setIsCallActive(false);
      setAnimate(false);
    });

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const saveTranscript = async () => {
    try {
      const userId = user.userId;
      
      console.log('💾 Sending transcript for analysis (userId):', userId);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/vapi/process-transcript`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            transcript: transcriptRef.current,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Interview completed! Generating your feedback...`);
        
        // Store the interview ID
        localStorage.setItem("lastInterviewId", data.interviewId);
        
        // Redirect to feedback page after 1.5 seconds
        setTimeout(() => {
          navigate(`/feedback/${data.interviewId}`);
        }, 1500);
      } else {
        setMessage("Analysis completed: " + data.message);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      setMessage("Interview completed. Check console for analysis.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  const startInterview = async () => {
    try {
      const userId = user.userId;
      const userName = user.name || "User";

      console.log('🎯 Starting interview for userId:', userId);

      setMessage("Connecting to interview assistant...");

      await vapiRef.current.start(
        null,
        null,
        null,
        process.env.REACT_APP_VAPI_WORKFLOW_ID,
        {
          variableValues: {
            userId: userId,
            username: userName,
            role: localStorage.getItem("interviewRole") || "",
            type: localStorage.getItem("interviewType") || "",
            level: localStorage.getItem("interviewLevel") || "",
            techstack: localStorage.getItem("interviewTechstack") || "",
            amount: Number(localStorage.getItem("interviewAmount")) || 2,
          },
        }
      );

    } catch (error) {
      console.error('Error starting interview:', error);
      setMessage("Failed to start interview.");
      setIsCallActive(false);
      setAnimate(false);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setMessage("Interview ended manually");
    }
  };

  const handleToggle = () => {
    if (isCallActive) {
      endCall();
    } else {
      startInterview();
    }
  };

  return (
    <>
      <Navbar name={user.name} profileImage={user.profileImage} />
      <div className="agent-page">
        <h2 className="title">AI Mock Interview</h2>
        <br /><br /><br /><br />
        
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

        <button 
          className="go-btn" 
          onClick={handleToggle}
          disabled={!user.name}
        >
          {isCallActive ? "End Interview" : "Start Interview"}
        </button>

        {transcript.length > 0 && (
          <div className="transcript-display">
            <h3>Live Transcript ({transcript.length} messages):</h3>
            <div className="transcript-messages">
              {transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`transcript-message ${msg.role}`}
                >
                  <strong>
                    {msg.role === "user" ? "You" : "Interviewer"}:
                  </strong>{" "}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px',
          fontSize: '12px',
          maxWidth: '300px',
          borderRadius: '5px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Call Active: {isCallActive ? "Yes" : "No"}</div>
          <div>Transcript Count: {transcript.length}</div>
          <div>User: {user.name || "Not found"}</div>
          <div>UserId: {user.userId || "Not found"}</div>
        </div>
      </div>
    </>
  );
}

export default Agent;