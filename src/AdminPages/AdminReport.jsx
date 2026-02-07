import React, { useState } from 'react';
import { 
  Flag, Clock, AlertTriangle, X, 
  ChevronRight, Search, Filter, 
  MoreVertical, User, ShieldAlert
} from 'lucide-react';

// --- Dummy Data (Same as provided) ---
const DUMMY_REPORTS = [
  { 
    id: "REP-102", 
    title: "User harassment in comments", 
    reporter: "manga_lover_123", 
    type: "user", 
    priority: "high", 
    status: "open", 
    date: "2/7/2026",
    time: "5:30:00 AM",
    reportedUser: "toxic_troll",
    description: "User \"toxic_troll\" has been consistently harassing other users in comment sections across multiple manga."
  },
  { 
    id: "REP-101", 
    title: "Plagiarized manga content", 
    reporter: "concerned_artist", 
    type: "content", 
    priority: "high", 
    status: "investigating", 
    date: "2/6/2026",
    time: "10:15:00 PM",
    reportedUser: "shady_uploader",
    description: "This uploader is posting scans from a licensed publisher without authorization."
  },
  { 
    id: "REP-098", 
    title: "Chapter images not loading", 
    reporter: "anime_fan_99", 
    type: "technical", 
    priority: "medium", 
    status: "open", 
    date: "2/6/2026",
    time: "1:20:00 PM",
    reportedUser: "System/Server",
    description: "Images in Chapter 45 of 'City Lights' are broken on mobile devices."
  }
];

const ReportsManagement = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-600 border-red-100';
      case 'investigating': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="p-4 bg-[#F9FAFB] min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Responsive Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Reports Management</h2>
            <p className="text-gray-500 text-sm">Handle user reports and technical issues</p>
          </div>
          <button className="flex md:hidden items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-600 shadow-sm">
            <Filter size={16}/> Filter View
          </button>
        </div>

        {/* Summary Grid - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Open", val: "2", color: "red", icon: <Flag size={20}/> },
            { label: "Pending", val: "2", color: "yellow", icon: <Clock size={20}/> },
            { label: "Urgent", val: "3", color: "orange", icon: <AlertTriangle size={20}/> },
            { label: "Total", val: "7", color: "blue", icon: <ShieldAlert size={20}/> }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-wider">{stat.label}</p>
                <h3 className="text-2xl md:text-3xl font-black">{stat.val}</h3>
              </div>
              <div className={`p-3 bg-${stat.color}-50 rounded-xl text-${stat.color}-500 w-fit`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar - Responsive Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Type</label>
            <div className="relative">
              <select className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/10 transition-all">
                <option>All Types</option>
                <option>User</option>
                <option>Content</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" size={16}/>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Status</label>
            <div className="relative">
              <select className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/10 transition-all">
                <option>All Status</option>
                <option>Open</option>
                <option>Resolved</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" size={16}/>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">Issue / Reporter</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Severity</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900 leading-tight">{report.title}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium"><User size={10}/> {report.reporter}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-purple-50 text-purple-600 border border-purple-100">{report.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${report.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-500">{report.date}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setSelectedReport(report)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md shadow-blue-100">
                      <ChevronRight size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {DUMMY_REPORTS.map((report) => (
            <div key={report.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <h4 className="font-black text-gray-900 leading-tight pr-4">{report.title}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-300">{report.id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reporter</p>
                  <p className="text-xs font-bold text-gray-700">{report.reporter}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Category</p>
                  <p className="text-xs font-bold text-gray-700 uppercase">{report.type}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedReport(report)}
                className="w-full bg-gray-50 text-gray-600 font-black py-3 rounded-xl text-xs uppercase tracking-[0.15em] border border-gray-100 flex items-center justify-center gap-2"
              >
                Inspect Issue <ChevronRight size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-[2rem] md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-200 h-[90vh] md:h-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><AlertTriangle size={20}/></div>
                <h3 className="text-lg font-black text-gray-900">Issue Analysis</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Full Description</p>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-sm leading-relaxed text-gray-600 font-medium">
                  "{selectedReport.description}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target User</p><p className="font-black text-red-500">{selectedReport.reportedUser}</p></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted On</p><p className="font-bold">{selectedReport.date}</p></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p><p className="font-bold uppercase">{selectedReport.type}</p></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p><p className="font-bold uppercase">{selectedReport.status}</p></div>
              </div>

              {/* Status Update Actions - Stack on Mobile */}
              <div className="pt-8 border-t border-gray-50 space-y-4">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Administrative Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="bg-yellow-500 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-600 shadow-lg shadow-yellow-100">Investigate</button>
                  <button className="bg-green-600 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100">Resolve</button>
                  <button className="bg-gray-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black sm:col-span-2">Archive Report</button>
                </div>
              </div>
            </div>

            {/* Mobile Footer Spacing */}
            <div className="h-6 md:hidden shrink-0"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;