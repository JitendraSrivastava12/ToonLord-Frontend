import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  KeyRound,
  RefreshCcw,Chrome
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
  const [isLoading, setIsLoading] = useState(false);

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

  /* ---------------- GOOGLE AUTH ---------------- */
  useEffect(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      // Render the Google button in the placeholder div
      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" },
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/api/users/google-login`, {
        idToken: response.credential,
      });

      if (res.data.token) {
        login(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        showAlert("Login successful!", "success");
        navigate("/");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Google login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      try {
        const res = await axios.post(`${API_URL}/api/users/login`, {
          email: formData.email,
          password: formData.password,
        });

        if (res.data.token) {
          login(res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          showAlert("Logged in successfully!", "success");
          navigate("/");
        }
      } catch (err) {
        showAlert(err.response?.data?.message || "Login failed", "error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (signupStep === 1) {
        await axios.post(`${API_URL}/api/users/request-signup-otp`, {
          email: formData.email,
          username: formData.name,
        });
        showAlert("Verification code sent to your email.", "success");
        setSignupStep(2);
      } else {
        const res = await axios.post(`${API_URL}/api/users/signup`, {
          username: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (resetStep === 1) {
        await axios.post(`${API_URL}/api/users/forgot-password`, {
          email: formData.email,
        });
        showAlert("Password reset code sent to your email.", "success");
        setResetStep(2);
      } else {
        await axios.post(`${API_URL}/api/users/reset-password`, {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.password,
        });

        showAlert("Password updated successfully.", "success");
        setIsResetMode(false);
        setResetStep(1);
        setIsLogin(true);
      }
    } catch (err) {
      showAlert(
        err.response?.data?.message || "Password reset failed",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col items-center md:items-end justify-center overflow-hidden font-sans md:pr-12 lg:pr-32 py-12 md:py-28">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center md:bg-[20%_center] opacity-40 md:opacity-100"
          style={{ backgroundImage: `url('${mangaCoverPlaceholder}')` }}
        />
        <div className="absolute inset-0 bg-black/60 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-[#050505]/40 to-[#050505]" />
      </div>

      {/* BACK BUTTON */}
      <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center z-50 md:px-12 lg:px-36">
        <button
          className="group flex items-center gap-2 text-white/90 hover:text-red-500 text-xs font-bold uppercase bg-white/5 px-4 py-2 rounded-full border border-white/10"
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
          <ArrowLeft size={16} />
          {isResetMode || (!isLogin && signupStep === 2) ? "Cancel" : "Back"}
        </button>
      </div>

      <div className="relative w-full max-w-[460px] px-4 md:px-0 z-20">
        <div className="w-full px-6 md:px-10 py-10 md:py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-xl">
          {!isResetMode ? (
            <>
              {signupStep === 1 && (
                <div className="flex gap-10 mb-10 border-b border-white/5">
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setSignupStep(1);
                    }}
                    className={`pb-4 text-xs font-bold uppercase ${isLogin ? "text-red-600 border-b-2 border-red-600" : "text-gray-500"}`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`pb-4 text-xs font-bold uppercase ${!isLogin ? "text-red-600 border-b-2 border-red-600" : "text-gray-500"}`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && signupStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      icon={<User size={16} />}
                      label="Full Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      icon={<Phone size={16} />}
                      label="Phone Number"
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {(isLogin || signupStep === 1) && (
                  <FloatingInput
                    icon={<Mail size={18} />}
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                )}

                {!isLogin && signupStep === 2 && (
                  <FloatingInput
                    icon={<KeyRound size={18} />}
                    label="Verification Code"
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                )}

                {(isLogin || signupStep === 1) && (
                  <div className="relative">
                    <FloatingInput
                      icon={<Lock size={18} />}
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-2xl flex items-center justify-center"
                >
                  {isLoading ? (
                    <RefreshCcw className="animate-spin" size={18} />
                  ) : isLogin ? (
                    "Login"
                  ) : signupStep === 1 ? (
                    "Create Account"
                  ) : (
                    "Verify Account"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-4">Reset Password</h3>
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <FloatingInput
                  icon={<Mail size={18} />}
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                {resetStep === 2 && (
                  <>
                    <FloatingInput
                      icon={<KeyRound size={18} />}
                      label="Reset Code"
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      icon={<Lock size={18} />}
                      label="New Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-2xl"
                >
                  {isLoading ? (
                    <RefreshCcw className="animate-spin" size={18} />
                  ) : resetStep === 1 ? (
                    "Send Code"
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </>
          )}

          {(isLogin || (!isLogin && signupStep === 1)) && !isResetMode && (
            <div className="mt-8 flex flex-col items-center">
              {/* Decorative "Or" divider */}
              <div className="flex items-center w-full mb-4 gap-4">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                  Digital ID
                </span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>

              {/* The Styled Container */}
              <div className="relative w-full group">
                {/* Matching the icon placement of FloatingInput */}
                  <div
                    id="googleSignInDiv"
                    className="w-full flex justify-center py-2 opacity-80 hover:opacity-100 transition-opacity"
                    style={{
                      // This centers the internal Google iframe
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FloatingInput = ({ icon, label, type, name, value, onChange }) => (
  <div className="relative w-full">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={value ? "" : label}
      className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
    />
  </div>
);

export default AuthScreen;
