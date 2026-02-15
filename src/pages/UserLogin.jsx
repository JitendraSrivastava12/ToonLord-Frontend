import React, { useState, useContext, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Github, Chrome, Eye, EyeOff,
  Mail, Lock, User, Phone, KeyRound
} from "lucide-react";
import mangaCoverPlaceholder from "../assets/Background/LoginBackground.png";
import { AppContext } from "../UserContext"; 
import { useAlert } from "../context/AlertContext";
const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); 
  const [signupStep, setSignupStep] = useState(1); 
  
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    otp: "",
  });

  /* ---------------- GOOGLE AUTH LOGIC ---------------- */
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID, // REPLACE THIS
        callback: handleGoogleResponse,
      });
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post(`${API_URL}/api/users/google-login`, {
        idToken: response.credential,
      });

      if (res.data.token) {
        login(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        showAlert("Logged in successfully via Google!", "success");
        navigate("/");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Google Authentication failed", "error");
    }
  };

  const triggerGoogleLogin = () => {
    if (window.google) {
      google.accounts.id.prompt(); // Shows the One Tap UI and allows the button to work
    } else {
      showAlert("Google Service not loaded yet. Please refresh.", "error");
    }
  };
  /* ---------------- END GOOGLE LOGIC ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      try {
        const res = await axios.post(`${API_URL}/api/users/login`, {
          email: formData.email,
          password: formData.password
        });
        if (res.data.token) {
          login(res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          showAlert("Welcome back!", "success");
          navigate("/");
        }
      } catch (err) {
        showAlert(err.response?.data?.message || "Login failed", "error");
      }
      return;
    }

    try {
      if (signupStep === 1) {
        await axios.post(`${API_URL}/api/users/request-signup-otp`, {
          email: formData.email,
          username: formData.name
        });
        showAlert("Verification code sent to email!", "success");
        setSignupStep(2);
      } else {
        const res = await axios.post(`${API_URL}/api/users/signup`, {
          username: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          otp: formData.otp
        });
        if (res.data.token) {
          login(res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          showAlert("Account created successfully!", "success");
          navigate("/");
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Signup failed", "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (resetStep === 1) {
        await axios.post(`${API_URL}/api/users/forgot-password`, { email: formData.email });
        showAlert("OTP sent to your email", "success");
        setResetStep(2);
      } else {
        await axios.post(`${API_URL}/api/users/reset-password`, { 
          email: formData.email, 
          otp: formData.otp, 
          newPassword: formData.password 
        });
        showAlert("Password updated! Please login.", "success");
        setIsResetMode(false);
        setResetStep(1);
        setIsLogin(true);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Reset failed", "error");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col items-center md:items-end justify-center overflow-hidden font-sans md:pr-12 lg:pr-32 py-28">
      <div className="absolute inset-0 z-0">
        <div 
          className="hidden md:block absolute inset-0 bg-no-repeat bg-cover bg-[20%_center] transition-all duration-700"
          style={{ backgroundImage: `url('${mangaCoverPlaceholder}')` }}
        />
        <div className="absolute inset-0 bg-[#050505] md:bg-transparent md:bg-gradient-to-r md:from-transparent md:via-[#050505]/30 md:to-[#050505]/95" />
      </div>

      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 md:px-12 lg:px-36">
        <button
          className="group flex items-center gap-2 text-white/90 hover:text-red-500 transition-all text-sm font-bold uppercase tracking-widest bg-white/5 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-xl hover:bg-white/10"
          onClick={() => {
            if (isResetMode) {
              setIsResetMode(false);
              setResetStep(1);
            } else if (!isLogin && signupStep === 2) {
              setSignupStep(1);
            } else {
              navigate(-1);
            }
          }}
        >
          <ArrowLeft size={18} />
          {isResetMode || (!isLogin && signupStep === 2) ? "Back" : "Back"}
        </button>
      </div>

      <div className="relative w-full max-w-[460px] px-4 md:px-0 z-20">
        <div className="w-full px-6 md:px-10 py-10 md:py-12 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
          
          {!isResetMode ? (
            <>
              <div className="flex gap-10 mb-10 border-b border-white/5">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setSignupStep(1); }}
                  className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${isLogin ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${!isLogin ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-300"}`}
                >
                  SignUp
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && signupStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput icon={<User size={16} />} label="Name" type="text" name="name" value={formData.name} onChange={handleChange} />
                    <FloatingInput icon={<Phone size={16} />} label="Mobile" type="tel" name="mobile" value={formData.mobile} onChange={handleChange} />
                  </div>
                )}
                
                {(isLogin || signupStep === 1) && (
                  <FloatingInput icon={<Mail size={18} />} label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
                )}

                {!isLogin && signupStep === 2 && (
                  <FloatingInput icon={<KeyRound size={18} />} label="Enter OTP" type="text" name="otp" value={formData.otp} onChange={handleChange} />
                )}

                {(isLogin || signupStep === 1) && (
                  <div className="relative">
                    <FloatingInput icon={<Lock size={18} />} label="Password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setIsResetMode(true)} className="text-[10px] font-bold text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button type="submit" className="w-full py-4.5 mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all active:scale-95">
                  {isLogin ? "Access Account" : (signupStep === 1 ? "Send Verification" : "Verify & Register")}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-10">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 border-b-2 border-red-600 inline-block pb-2">
                  Reset Password
                </h3>
                <p className="text-gray-400 text-[11px] mt-4 uppercase tracking-widest">
                  {resetStep === 1 ? "Enter your email to receive a 6-digit code." : "Enter the code and your new password."}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleResetPassword}>
                <FloatingInput icon={<Mail size={18} />} label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} />
                
                {resetStep === 2 && (
                  <>
                    <FloatingInput icon={<KeyRound size={18} />} label="OTP Code" type="text" name="otp" value={formData.otp} onChange={handleChange} />
                    <div className="relative">
                      <FloatingInput icon={<Lock size={18} />} label="New Password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                    </div>
                  </>
                )}

                <button type="submit" className="w-full py-4.5 mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all active:scale-95">
                  {resetStep === 1 ? "Send Reset Code" : "Update Password"}
                </button>
              </form>
            </>
          )}

          <div className="mt-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <SocialButton onClick={triggerGoogleLogin} icon={<Chrome size={20} />} label="Google" />
              <SocialButton icon={<Github size={20} />} label="GitHub" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingInput = ({ icon, label, type, name, value, onChange }) => (
  <div className="relative group w-full">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors peer-focus:text-red-600">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className="peer w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all hover:bg-white/[0.08]"
    />
    <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-bold uppercase tracking-widest pointer-events-none transition-all px-2 rounded peer-focus:-top-2 peer-focus:text-red-600 peer-focus:bg-[#121214] peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-red-600 peer-[&:not(:placeholder-shown)]:bg-[#121214]">
      {label}
    </label>
  </div>
);

const SocialButton = ({ icon, label, onClick }) => (
  <button 
    type="button" 
    onClick={onClick}
    className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
  >
    {icon} <span>{label}</span>
  </button>
);

export default AuthScreen;