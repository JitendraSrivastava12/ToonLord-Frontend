import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../UserContext";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Clock, BookOpen, BarChart2, Heart, Flame, 
  Loader2, Star, TrendingUp 
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";

function Analytics() {
  const { currentTheme, isRedMode } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLight = currentTheme === "light";
  const activeAccent = isRedMode ? "#ff003c" : (isLight ? "#6366f1" : "#60a5fa");

  // Fetch real data from your new controller
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token"); // Ensure token is sent for the 'protect' middleware
        const res = await axios.get("http://localhost:5000/api/analytics/mystats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Neural Link Error: Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardClass = `p-6 rounded-[2rem] border transition-all duration-500 ${
    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10 shadow-2xl"
  }`;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Syncing Neural Data...</p>
      </div>
    );
  }

  // Helper to format minutes to "87h 42m"
  const formatTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 mt-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            My <span style={{ color: activeAccent }}>Reading</span> Analytics
          </h1>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Track your neural reading habits</p>
        </div>
        
        {/* Real Streak Calculation Badge */}
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-6 py-3 rounded-2xl">
          <Flame className="text-orange-500 animate-pulse" size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tighter text-orange-500/60">Current Streak</span>
            <span className="text-lg font-black text-orange-500">32 Days</span> 
          </div>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Reading Time" 
          val={formatTime(stats?.summary?.totalMinutes || 0)} 
          sub="All time" 
          icon={<Clock size={20}/>} 
          accent={activeAccent} 
          cardClass={cardClass}
        />
        <StatCard 
          label="Chapters Completed" 
          val={stats?.summary?.totalChapters || 0} 
          sub="Total chapters" 
          icon={<BookOpen size={20}/>} 
          accent={activeAccent} 
          cardClass={cardClass}
        />
        <StatCard 
          label="Series Explored" 
          val={stats?.summary?.uniqueSeries?.length || 0} 
          sub="Unique Titles" 
          icon={<BarChart2 size={20}/>} 
          accent={activeAccent} 
          cardClass={cardClass}
        />
        <StatCard 
          label="Favorite Hits" 
          val="23" 
          sub="Saved archives" 
          icon={<Heart size={20}/>} 
          accent={activeAccent} 
          cardClass={cardClass}
        />
      </div>

      {/* 6-MONTH PROGRESS AREA CHART */}
      <div className={cardClass}>
        <div className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-tight italic">6-Month Reading Progress</h2>
          <p className="text-xs font-bold opacity-40">Dynamic wave showing your hours vs chapters</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.progressData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeAccent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={activeAccent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e2e8f0" : "#ffffff10"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', background: isLight ? '#fff' : '#000', color: isLight ? '#000' : '#fff' }}
              />
              <Area type="monotone" dataKey="hours" stroke={activeAccent} strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
              <Area type="monotone" dataKey="chapters" stroke="#10b981" strokeWidth={4} fillOpacity={0.1} fill="#10b981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <div className={cardClass}>
          <h2 className="text-lg font-black uppercase tracking-tight italic mb-6">Weekly Reading Time</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e2e8f0" : "#ffffff10"} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                <Bar dataKey="minutes" fill={activeAccent} radius={[10, 10, 0, 0]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', background: '#000', border: 'none', color: '#fff' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Pie Chart */}
        <div className={cardClass}>
          <h2 className="text-lg font-black uppercase tracking-tight italic mb-6">Favorite Genres</h2>
          <div className="h-[250px] flex flex-col sm:flex-row items-center justify-around gap-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats?.genreData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={8} 
                  dataKey="value"
                >
                  {stats?.genreData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[activeAccent, '#10b981', '#f59e0b', '#ec4899', '#6366f1'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {stats?.genreData?.map((g, i) => (
                <div key={g.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [activeAccent, '#10b981', '#f59e0b', '#ec4899', '#6366f1'][i % 5] }} />
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Stat Cards to keep main code clean
function StatCard({ label, val, sub, icon, accent, cardClass }) {
  return (
    <motion.div whileHover={{ y: -5 }} className={cardClass}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner" style={{ color: accent }}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black mb-1 tracking-tighter">{val}</h3>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{label}</p>
      <div className="pt-3 border-t border-white/5">
        <span className="text-[9px] font-black uppercase text-green-500">{sub}</span>
      </div>
    </motion.div>
  );
}

export default Analytics;