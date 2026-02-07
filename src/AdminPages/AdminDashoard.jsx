import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, DollarSign, Users, Unlock, FileText } from 'lucide-react';

// --- Dummy Data ---
const DUMMY_STATS = [
  { title: "Total Revenue", value: "$42,890", change: "+12.5%", isPositive: true, icon: <DollarSign size={20}/>, color: "blue" },
  { title: "Active Users", value: "15,204", change: "+4.3%", isPositive: true, icon: <Users size={20}/>, color: "green" },
  { title: "Premium Unlocks", value: "8,942", change: "+18.2%", isPositive: true, icon: <Unlock size={20}/>, color: "purple" },
  { title: "Reports Pending", value: "12", change: "-2.1%", isPositive: false, icon: <FileText size={20}/>, color: "red" },
];

const RECENT_ACTIONS = [
  { id: 1, event: "Chapter #45 Uploaded", user: "SoloLevelingFan", time: "2m ago", status: "Live", type: "success" },
  { id: 2, event: "New Creator Applied", user: "MangaArtist_99", time: "15m ago", status: "Pending", type: "warning" },
  { id: 3, event: "Payment Processed", user: "User_4421", time: "1h ago", status: "Paid", type: "success" },
  { id: 4, event: "Report: Harassment", user: "Mod_Team", time: "3h ago", status: "Review", type: "danger" },
  { id: 5, event: "System Backup", user: "Automated", time: "5h ago", status: "Done", type: "success" },
];

const REVENUE_CHART_DATA = [30, 45, 35, 60, 80, 55, 70, 90, 85, 95, 75, 88];

// --- Sub-Components ---
const StatCard = ({ title, value, change, isPositive, icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    purple: "bg-purple-50 text-purple-500",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-xl md:text-2xl font-black text-gray-900">{value}</h3>
        <div className={`mt-2 flex items-center gap-1 text-[11px] font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          <span>{change}</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-500 text-sm">Welcome back, Admin. System health is optimal.</p>
          </div>
          
          {/* Time Filter - Horizontal Scrollable on tiny screens */}
          <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm min-w-max">
              {['Weekly', 'Monthly', 'Yearly'].map((label) => (
                <button 
                  key={label}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                    label === 'Monthly' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - Responsive Column Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {DUMMY_STATS.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Stream Visualization */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 flex flex-col shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="font-black text-gray-900 text-sm uppercase tracking-wider">Revenue Stream</p>
                <p className="text-xs text-gray-400 font-medium">Points & Premium Purchases</p>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
                Live Analysis
              </span>
            </div>
            
            {/* Chart Container - Scrollable on mobile to prevent squishing */}
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex items-end gap-2 md:gap-3 h-[250px] md:h-[300px] min-w-[600px] lg:min-w-0 px-2">
                {REVENUE_CHART_DATA.map((val, i) => (
                  <div 
                    key={i} 
                    className="bg-blue-500/90 hover:bg-blue-600 w-full rounded-t-md transition-all duration-300 relative group/bar cursor-pointer"
                    style={{ height: `${val}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold pointer-events-none">
                      ${(val * 100).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-4 text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] border-t border-gray-50 pt-4 px-2">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <p className="font-black text-gray-900 text-sm uppercase tracking-wider">Recent Activity</p>
              <Clock size={16} className="text-gray-400" />
            </div>
            
            <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {RECENT_ACTIONS.map((action) => (
                <div key={action.id} className="flex justify-between items-start group">
                  <div className="flex gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg ${
                      action.type === 'success' ? 'bg-green-50 text-green-600' : 
                      action.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {action.type === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                        {action.event}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">
                        by <span className="text-gray-700 font-bold">{action.user}</span> <span className="hidden xs:inline">• {action.time}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase border tracking-tighter ${
                    action.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 
                    action.type === 'danger' ? 'bg-red-50 border-red-100 text-red-700' : 
                    'bg-yellow-50 border-yellow-100 text-yellow-700'
                  }`}>
                    {action.status}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="mt-8 w-full py-3 text-[11px] font-black text-gray-500 border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-widest shadow-sm">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;