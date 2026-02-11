import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Flag, Clock, AlertTriangle, X, 
  ChevronRight, Search, Filter, 
  MoreVertical, User, ShieldAlert, Loader2,
  Trash2, Target, AlertCircle, BookOpen, ExternalLink
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/reports/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/reports/admin/${reportId}`, 
        { action: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      await fetchReports();
      setSelectedReport(null);
    } catch (err) {
      alert("Action Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearProcessed = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/reports/admin/clear-processed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchReports();
      setIsPurgeModalOpen(false);
    } catch (err) {
      alert("System Error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-50 text-red-600 border-red-100';
      case 'investigating': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      case 'dismissed': return 'bg-gray-50 text-gray-400 border-gray-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );
  console.log(reports)

  return (
    <div className="p-4 bg-[#F9FAFB] min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Reports Management</h2>
            <p className="text-gray-500 text-sm font-medium">Review user flags and enforce community guidelines</p>
          </div>

          <button 
            onClick={() => setIsPurgeModalOpen(true)}
            disabled={actionLoading || !reports.some(r => r.status === 'resolved' || r.status === 'dismissed')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Clear Processed
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6 w-[35%]">Issue / Context</th>
                <th className="px-8 py-6 w-[20%]">Target User</th>
                <th className="px-8 py-6 w-[15%]">Category</th>
                <th className="px-8 py-6 w-[15%]">Status</th>
                <th className="px-8 py-6 w-[15%] text-right">Analyze</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900 leading-tight truncate">{report.reason}</p>
                    
                    {/* Display Chapter/Manga Context */}
                    <div className="flex items-center gap-2 mt-1">
                        {report.targetType === 'chapter' && (
                             <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-black uppercase">
                                Ch. {report.chapterNumber}
                             </span>
                        )}
                        <p className="text-[11px] text-gray-500 font-bold truncate">
                            {report.parentManga?.title || "General Report"}
                        </p>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                      <User size={10} className="shrink-0"/> 
                      <span className="truncate">Reporter: {report.reporter?.username || 'Unknown'}</span>
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                          <Target size={14}/>
                       </div>
                       <p className="text-sm font-bold text-gray-900 truncate">
                         {report.targetUser?.username || 'System/N/A'}
                       </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-purple-50 text-purple-600 border border-purple-100 inline-block">
                      {report.targetType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border inline-block ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedReport(report)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md shadow-blue-100 inline-flex items-center justify-center"
                    >
                      <ChevronRight size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- ANALYSIS MODAL --- */}
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 md:p-4">
            <div className="bg-white w-full max-w-2xl rounded-t-[2rem] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
              
              <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                        <ShieldAlert size={24}/>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase">Analysis Case</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{selectedReport._id.slice(-6)}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                
                {/* 🔥 PRIMARY MANGA TITLE CARD 🔥 */}
                <div className="bg-[#0F172A] text-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase">
                                {selectedReport.targetType}
                            </span>
                            {selectedReport.targetType === 'chapter' && (
                                <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">
                                    Chapter {selectedReport.chapterNumber}
                                </span>
                            )}
                        </div>
                        <h4 className="text-2xl font-black italic uppercase leading-tight tracking-tighter">
                            {selectedReport.parentManga?.title || "General Content"}
                        </h4>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">
                           Reason: {selectedReport.reason}
                        </p>
                    </div>
                    <BookOpen size={100} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 transition-transform group-hover:rotate-0 duration-500" />
                </div>

                {/* User Relationship Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reporter</p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                        <User size={14} className="text-blue-500"/>
                        {selectedReport.reporter?.username || 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Target User</p>
                    <p className="font-bold text-orange-900 flex items-center gap-2">
                        <Target size={14} className="text-orange-500"/>
                        {selectedReport.targetUser?.username || 'System'}
                    </p>
                  </div>
                </div>

                {/* Complaint Text */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Report Details</p>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-sm leading-relaxed text-gray-600 font-medium italic border-l-4 border-l-red-500">
                    "{selectedReport.details || "No additional text provided by the reporter."}"
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="pt-6 border-t border-gray-50 space-y-4">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Administrative Decision</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      disabled={actionLoading} 
                      onClick={() => handleUpdateStatus(selectedReport._id, 'investigating')} 
                      className="bg-yellow-500 text-white py-4 rounded-xl font-black text-[11px] uppercase hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} 
                      Investigate
                    </button>
                    <button 
                      disabled={actionLoading} 
                      onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')} 
                      className="bg-green-600 text-white py-4 rounded-xl font-black text-[11px] uppercase hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />} 
                      Resolve
                    </button>
                    <button 
                      disabled={actionLoading} 
                      onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')} 
                      className="bg-gray-900 text-white py-4 rounded-xl font-black text-[11px] uppercase hover:bg-black sm:col-span-2 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />} 
                      Dismiss Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PURGE MODAL --- */}
        {isPurgeModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight">Purge Records?</h3>
                <p className="text-gray-500 text-sm font-medium italic">This will permanently delete resolved and dismissed reports.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleClearProcessed} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-red-700 transition-all">Confirm Purge</button>
                <button onClick={() => setIsPurgeModalOpen(false)} className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;