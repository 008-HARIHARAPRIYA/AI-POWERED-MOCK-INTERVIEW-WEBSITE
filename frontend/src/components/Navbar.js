// Navbar.js
import React from "react";
import "./Navbar.css";

function Navbar({ name, profileImage }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="https://img.freepik.com/premium-photo/cute-mini-robot_553012-44382.jpg?w=996"
          alt="Logo"
          className="logo"
        />
        <span className="app-name">MockMate</span>
      </div>

      <div className="navbar-right">
        <div
          className="navbar-user-info"
          style={{ display: "flex", alignItems: "center" }}
        >
          <span
            style={{
              marginRight: "10px",
              color: "#fff",
              fontWeight: "600",
              fontFamily: "monospace",
              fontSize: "22px",
              letterSpacing: "0.5px",
            }}
          >
            Hi, {name || "User"}
          </span>
          <img
            src={
              profileImage ||
              "https://via.placeholder.com/40?text=U" // fallback avatar
            }
            alt="Profile"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
