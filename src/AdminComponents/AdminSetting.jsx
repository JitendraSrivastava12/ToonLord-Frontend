import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShieldAlert, Eye, EyeOff, Save, Settings2, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

import { useAlert } from "../context/AlertContext";
const AdminSettings = () => {
  // Use null initially so we know when data hasn't arrived yet
  const [isRedModeDisabled, setIsRedModeDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
    const {showAlert}=useAlert();
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/red-mode`);
        // Ensure this matches exactly what your backend returns
        // If backend sends { isDisabled: true }, use res.data.isDisabled
        setIsRedModeDisabled(res.data.isDisabled ?? false);
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken'); 
      await axios.patch(`${API_URL}/admin/red-mode`, 
        { isDisabled: isRedModeDisabled }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("System configuration updated.",'success');
    } catch (err) {
      console.error(err);
      showAlert("Failed to sync with server.",'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Professional Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-8">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Settings2 className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Controls
            </h1>
            <p className="text-slate-500 text-sm">Manage global feature flags and system visibility.</p>
          </div>
        </div>

        {/* Setting Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${isRedModeDisabled ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-600'}`}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Red Mode Toggle</h3>
                <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">
                  Hide the Red/Friendly mode switch from the navigation bar. 
                  Users will be locked into the default theme.
                </p>
              </div>
            </div>

            {/* Professional Toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isRedModeDisabled ? 'text-slate-400' : 'text-blue-600'}`}>
                {isRedModeDisabled ? "Hidden" : "Visible"}
              </span>
              <button
                onClick={() => setIsRedModeDisabled(!isRedModeDisabled)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isRedModeDisabled ? "bg-slate-200" : "bg-blue-600"
                }`}
              >
                <div 
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                    isRedModeDisabled ? "translate-x-0" : "translate-x-7"
                  }`}
                >
                   {isRedModeDisabled ? <EyeOff size={10} className="text-slate-400" /> : <Eye size={10} className="text-blue-600" />}
                </div>
              </button>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
            <button
              onClick={handleUpdateSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Configuration
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">System Online // All nodes synced</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;