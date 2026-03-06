import React, { useState } from "react";
import { Shield, Key, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-900/20 blur-xl rounded-full s-0"></div>
            <div className="relative bg-neutral-900/50 p-4 rounded-full border border-primary-900/30">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-neutral-500 text-sm mt-1 uppercase tracking-widest font-medium">
              Official Election Administration Portal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest ml-1">
                Administrator ID
              </label>
              <div className="relative group">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter Admin ID"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-primary-700/50 focus:ring-1 focus:ring-primary-700/50 transition-all font-mono"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest ml-1">
                Secure Password
              </label>
              <div className="relative group">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-primary-700/50 focus:ring-1 focus:ring-primary-700/50 transition-all font-mono"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-800 hover:bg-primary-700 text-white font-bold uppercase text-xs tracking-widest py-4 rounded-lg shadow-lg shadow-primary-900/20 transition-all transform active:scale-[0.98] mt-2 border border-primary-700/50"
            >
              Authorize Session
            </button>
          </form>
        </div>

        {/* Footer Security Notice */}
        <div className="flex flex-col items-center gap-2 text-center mt-4">
          <div className="flex items-center gap-2 text-primary-800/60">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-mono tracking-wider">
              Secure Connection (TLS 1.3)
            </span>
          </div>
          <p className="text-[10px] text-neutral-600 max-w-xs">
            Unauthorized access attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
