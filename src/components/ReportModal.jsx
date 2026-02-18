import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAlert } from "../context/AlertContext";
const API_URL = import.meta.env.VITE_API_URL;
const ReportModal = ({ isOpen, onClose, targetId, targetType, targetUser, extraData}) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  // Match these exactly with your Mongoose Schema Enum
  const {showAlert}=useAlert();
  const chapterReasons = [
    { label: "Broken Images/Pages", value: "Broken Images" },
    { label: "Wrong Chapter Order", value: "Wrong Chapter Order" },
    { label: "Missing Pages", value: "Missing Pages" },
    { label: "Other Issues", value: "Other" }
  ];

  const generalReasons = [
    { label: "Spam", value: "Spam" },
    { label: "Toxic Behavior", value: "Toxic Behavior" },
    { label: "Copyright Violation", value: "Copyright Violation" },
    { label: "Inappropriate Content", value: "Inappropriate Content" },
    { label: "Other Issues", value: "Other" }
  ];

  const options = targetType === 'chapter' ? chapterReasons : generalReasons;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return showAlert("Please select a reason", "error");

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/reports/submit`, {
        targetId,
        targetType,
        targetUser,
        reason,
        details,
        // New Chapter-Specific Fields for the Controller
        parentManga: extraData?.parentManga, 
        chapterNumber: extraData?.chapterNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert("Report submitted successfully","success");
      onClose();
      // Reset form
      setReason("");
      setDetails("");
    } catch (err) {
       showAlert(err.response?.data?.message || "Failed to submit report","error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="bg-[#111] w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-500/5 to-transparent">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={18} />
              <h3 className="font-black uppercase italic tracking-tighter text-lg">System Report</h3>
            </div>
            {targetType === 'chapter' && extraData?.chapterNumber && (
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Target: Chapter {extraData.chapterNumber}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Reason Selection */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block ml-1">
              Issue Category
            </label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Choose diagnostic result...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Details Area */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block ml-1">
              Detailed Logs (Optional)
            </label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all h-32 resize-none"
              placeholder="Describe the anomaly..."
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-black uppercase text-[12px] tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18}/>
            ) : (
              <>
                Submit Report
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse group-hover:bg-black transition-colors" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;