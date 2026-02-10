import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/admin/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard/admin");
    } catch (err) {
      alert("Invalid Admin Credentials");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Administrative Portal</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Admin Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login to Console</button>
      </form>
    </div>
  );
};

export default AdminLogin;
