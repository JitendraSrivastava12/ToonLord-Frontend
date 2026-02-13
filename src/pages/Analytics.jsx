import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../UserContext";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Clock, BookOpen, BarChart2, Heart, Flame, 
  Loader2, Star, ShieldCheck 
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
  const activeAccent = isRedMode ? "#ff003c" : (isLight ? "#10b981" : "#60a5fa");

  const prepareWeeklyData = (apiData) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map(day => {
      const found = apiData?.find(d => d.day === day);
      return found ? found : { day, minutes: 0 };
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/analytics/mystats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isMounted) {
          const data = res.data || {};
          setStats({
            summary: data.summary || { totalMinutes: 0, totalChapters: 0, uniqueSeries: [] },
            streak: data.streak || 0,
            weeklyData: prepareWeeklyData(data.weeklyData),
            genreData: data.genreData || [],
            progressData: data.progressData || []
          });
        }
      } catch (err) {
        console.error("Connection Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const cardClass = `p-6 rounded-[2rem] border transition-all duration-500 ${
    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-black border-white/5 shadow-2xl"
  }`;

  // Custom Tooltip to show Min and Hr
  const CustomWeeklyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const mins = payload[0].value;
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return (
        <div className="bg-black/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-white">
            {mins} min <span className="opacity-40 font-medium">({hrs}h {remainingMins}m)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">Syncing Activity...</p>
      </div>
    );
  }

  const formatTime = (totalMinutes) => {
    const minutes = parseInt(totalMinutes) || 0;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 mt-10 px-6 text-[var(--text-main)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black tracking-tight uppercase">
            My <span style={{ color: activeAccent }}>Reading</span> Activity
          </h1>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest text-left">Habit tracking and performance</p>
        </div>
        
        <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/20 px-6 py-4 rounded-3xl">
          <Flame className={stats?.streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-500"} size={24} />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500/60">Reading Streak</span>
            <span className="text-xl font-black text-orange-500 leading-none">
              {stats?.streak || 0} {stats?.streak === 1 ? "Day" : "Days"}
            </span> 
          </div>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Time Spent Reading" val={formatTime(stats?.summary?.totalMinutes)} sub="Total logged time" icon={<Clock size={20}/>} accent={activeAccent} cardClass={cardClass} />
        <StatCard label="Chapters Finished" val={stats?.summary?.totalChapters || 0} sub="Lifetime total" icon={<BookOpen size={20}/>} accent={activeAccent} cardClass={cardClass} />
        <StatCard label="Different Series" val={stats?.summary?.uniqueSeries?.length || 0} sub="Series variety" icon={<BarChart2 size={20}/>} accent={activeAccent} cardClass={cardClass} />
        <StatCard label="User Reputation" val={Math.floor((stats?.summary?.totalChapters || 0) * 10)} sub="Platform rank" icon={<Star size={20} className="fill-current"/>} accent={activeAccent} cardClass={cardClass} />
      </div>

      {/* PROGRESS CHART (MONTHLY) */}
      <div className={cardClass}>
        <div className="mb-10 text-left">
          <h2 className="text-lg font-black uppercase tracking-tight text-left">Monthly Progress</h2>
          <p className="text-xs font-bold opacity-40 text-left">Hours and chapters over the last 6 months</p>
        </div>
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.progressData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeAccent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeAccent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e2e8f0" : "#ffffff10"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#888' }} />
                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', background: isLight ? '#fff' : '#111', color: isLight ? '#000' : '#fff' }} />
                <Area name="Hours" type="monotone" dataKey="hours" stroke={activeAccent} strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                <Area name="Chapters" type="monotone" dataKey="chapters" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h2 className="text-lg font-black uppercase tracking-tight mb-8 text-left">Weekly Activity</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e2e8f0" : "#ffffff10"} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#888' }} />
                <Bar name="Minutes" dataKey="minutes" fill={activeAccent} radius={[8, 8, 0, 0]} barSize={40} />
                <Tooltip content={<CustomWeeklyTooltip />} cursor={{ fill: isLight ? '#f8fafc' : '#ffffff05' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-black uppercase tracking-tight mb-8 text-left">Favorite Genres</h2>
          <div className="h-[280px] flex flex-col sm:flex-row items-center justify-center gap-10">
            <div className="w-full h-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats?.genreData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                    {stats?.genreData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[activeAccent, '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-auto text-left min-w-[120px]">
              {stats?.genreData?.map((g, i) => (
                <div key={g.name || i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: [activeAccent, '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5] }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider truncate text-left">{g.name || 'Other'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, sub, icon, accent, cardClass }) {
  return (
    <motion.div whileHover={{ y: -5 }} className={cardClass + " text-left"}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 shadow-inner" style={{ color: accent }}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-black mb-1 tracking-tight">{val}</h3>
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-4">{label}</p>
      <div className="pt-4 border-t border-white/5 text-left">
        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">{sub}</span>
      </div>
    </motion.div>
  );
}

export default Analytics;