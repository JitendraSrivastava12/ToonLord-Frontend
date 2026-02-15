import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../UserContext";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Clock,
  BookOpen,
  BarChart2,
  Flame,
  Loader2,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const API_URL = import.meta.env.VITE_API_URL;
function Analytics() {
  const { currentTheme, isRedMode } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLight = currentTheme === "light";
  const activeAccent = isRedMode
    ? "#ef4444"
    : isLight
    ? "#10b981"
    : "#60a5fa";

  const prepareWeeklyData = (apiData) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day) => {
      const found = apiData?.find((d) => d.day === day);
      return found ? found : { day, minutes: 0 };
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/analytics/mystats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (isMounted) {
          const data = res.data || {};
          setStats({
            summary: data.summary || {
              totalMinutes: 0,
              totalChapters: 0,
              uniqueSeries: [],
            },
            streak: data.streak || 0,
            weeklyData: prepareWeeklyData(data.weeklyData),
            genreData: data.genreData || [],
            progressData: data.progressData || [],
          });
        }
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const cardClass = `p-6 rounded-2xl border transition ${
    isLight
      ? "bg-white border-slate-200 shadow-sm"
      : "bg-black border-white/10 shadow-lg"
  }`;

  const CustomWeeklyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const mins = payload[0].value;
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-lg shadow">
          <p className="text-xs text-[var(--text-dim)] mb-1">{label}</p>
          <p className="text-sm font-semibold text-[var(--text-main)]">
            {hrs}h {remainingMins}m
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm text-[var(--text-dim)]">
          Loading your activity…
        </p>
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 mt-2 md:mt-10 px-6 text-[var(--text-main)]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Reading analytics
          </h1>
          <p className="text-sm text-[var(--text-dim)]">
            Your reading habits and progress
          </p>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-orange-500/20 bg-orange-500/10">
          <Flame
            className={stats?.streak > 0 ? "text-orange-500" : "text-slate-400"}
            size={20}
          />
          <div>
            <p className="text-xs text-orange-500/70">Reading streak</p>
            <p className="text-lg font-semibold text-orange-500">
              {stats?.streak || 0}{" "}
              {stats?.streak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Time spent reading"
          val={formatTime(stats?.summary?.totalMinutes)}
          sub="Total time"
          icon={<Clock size={20} />}
          accent={activeAccent}
          cardClass={cardClass}
        />
        <StatCard
          label="Chapters finished"
          val={stats?.summary?.totalChapters || 0}
          sub="All time"
          icon={<BookOpen size={20} />}
          accent={activeAccent}
          cardClass={cardClass}
        />
        <StatCard
          label="Different series"
          val={stats?.summary?.uniqueSeries?.length || 0}
          sub="Variety"
          icon={<BarChart2 size={20} />}
          accent={activeAccent}
          cardClass={cardClass}
        />
        <StatCard
          label="Reader score"
          val={Math.floor((stats?.summary?.totalChapters || 0) * 10)}
          sub="Engagement"
          icon={<Star size={20} />}
          accent={activeAccent}
          cardClass={cardClass}
        />
      </div>

      {/* MONTHLY PROGRESS */}
      <div className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Monthly progress</h2>
          <p className="text-sm text-[var(--text-dim)]">
            Reading time and chapters over the last months
          </p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.progressData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={activeAccent}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={activeAccent}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isLight ? "#e2e8f0" : "#ffffff10"}
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                name="Hours"
                type="monotone"
                dataKey="hours"
                stroke={activeAccent}
                strokeWidth={3}
                fill="url(#colorHours)"
              />
              <Area
                name="Chapters"
                type="monotone"
                dataKey="chapters"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold mb-4">
            Weekly activity
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isLight ? "#e2e8f0" : "#ffffff10"}
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <Bar
                  name="Minutes"
                  dataKey="minutes"
                  fill={activeAccent}
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
                <Tooltip content={<CustomWeeklyTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold mb-4">
            Favorite genres
          </h2>
          <div className="h-[280px] flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="w-full h-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.genreData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats?.genreData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={[
                          activeAccent,
                          "#10b981",
                          "#f59e0b",
                          "#ec4899",
                          "#8b5cf6",
                        ][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              {stats?.genreData?.map((g, i) => (
                <div key={g.name || i} className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: [
                        activeAccent,
                        "#10b981",
                        "#f59e0b",
                        "#ec4899",
                        "#8b5cf6",
                      ][i % 5],
                    }}
                  />
                  <span>{g.name || "Other"}</span>
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
    <motion.div whileHover={{ y: -3 }} className={cardClass}>
      <div className="flex justify-between items-start mb-4">
        <div
          className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
          style={{ color: accent }}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-semibold mb-1">{val}</h3>
      <p className="text-sm text-[var(--text-dim)] mb-3">{label}</p>
      <div className="pt-3 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-dim)]">{sub}</span>
      </div>
    </motion.div>
  );
}

export default Analytics;
