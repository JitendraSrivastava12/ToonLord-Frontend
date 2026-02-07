import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      /** * 1. API CALL
       * Using a relative path. Ensure your vite.config.js has a proxy 
       * to http://localhost:5000 or use the full URL:
       * 'http://localhost:5000/admin/admin-login'
       */
      const response = await axios.post(`${API_URL}/admin/admin-login`, { email, password });
      
      // Extracting data from your backend response
      const { token, admin } = response.data;

      // 2. ROLE VALIDATION (Gatekeeper)
      if (!admin || admin.role !== 'admin') {
        throw new Error("Access Denied: Administrative privileges required.");
      }

      // 3. PERSISTENCE
      // Store token and user object separately for the AdminLayout to use
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));

      // 4. NAVIGATION
      // Redirect to the dashboard layout we created
      navigate('/admin');

    } catch (err) {
      console.error("Login error:", err);
      // Capture the error message from the backend if available
      const message = err.response?.data?.message || err.message || "Terminal Connection Failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/20 mb-4 animate-in zoom-in duration-500">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight italic">TOONLORD TERMINAL</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            System Administration Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Admin Email"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Master Password"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Establish Secure Connection
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="flex justify-center items-center gap-4 mt-8 opacity-40">
           <div className="h-px w-8 bg-slate-700" />
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
             Authorized Access Only &bull; SSL Active
           </p>
           <div className="h-px w-8 bg-slate-700" />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;