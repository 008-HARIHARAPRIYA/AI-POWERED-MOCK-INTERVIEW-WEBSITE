import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

function SignupLogin() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    resume: null,
    profileImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value);
        });
        await axios.post("http://localhost:5000/api/auth/signup", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Signup successful!");
        setIsSignup(false); // switch to login form
      } else {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        // Save user data and token if needed
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);

        alert("Login successful!");
        navigate("/home"); // go to home page
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row shadow-lg rounded-4 overflow-hidden">
          {/* Left Side */}
          <div className="col-md-6 text-white p-5 d-flex flex-column justify-content-center bg-overlay">
            <h1 className="display-5 fw-bold">MockMate</h1>
            <p className="lead">“Practice with AI, perform with confidence.”</p>
            <p className="lead">
              Your personal AI-powered interview coach. Sharpen your skills, get
              instant feedback, and walk into every interview with confidence.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className={`col-md-6 bg-white p-5 form-panel ${isSignup ? "slide-signup" : "slide-login"}`}>
            <h2 className="fw-bold mb-4 text-center">{isSignup ? "Sign Up" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="form-control mb-3" />
                  <input type="text" name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} required className="form-control mb-3" />
                  <label className="form-label">Upload Resume</label>
                  <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} required className="form-control mb-3" />
                  <label className="form-label">Upload Profile Image</label>
                  <input type="file" name="profileImage" accept="image/*" onChange={handleChange} required className="form-control mb-3" />
                </>
              )}
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="form-control mb-3" />
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="form-control mb-3" />
              <button type="submit" className="btn btn-primary w-100">
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </form>

            <p className="text-center mt-3">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button type="button" className="btn btn-link fw-bold" onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupLogin;
