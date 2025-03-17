import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Replace with your backend API URL

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [location]);

  const handleResetPassword = async () => {
    try {
      await axios.post(`${API_URL}/reset-password`, { token, newPassword });
      alert("Password reset successfully! You can now login.");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px", display: "block" }}
      />
      <button onClick={handleResetPassword} style={{ padding: "10px" }}>
        Reset Password
      </button>
    </div>
  );
};

export default ResetPassword;
