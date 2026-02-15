import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Unlock,
  FileText,
  RefreshCw,
} from "lucide-react";

const REVENUE_CHART_DATA = [40, 55, 60, 45, 70, 85, 50, 65, 75, 80, 90, 95];

const StatCard = ({ title, value, change, isPositive, icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    red: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">
          {value}
        </h3>

        <div
          className={`mt-2 flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{change}</span>
        </div>
      </div>

      <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Monthly");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("adminToken");

        const res = await axios.get(
          "http://localhost:5000/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData(res.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <RefreshCw size={36} className="text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: data?.stats?.totalRevenue || "0 ",
      change: "+12.5%",
      isPositive: true,
      icon: <DollarSign size={20} />,
      color: "blue",
    },
    {
      title: "Active Users",
      value: data?.stats?.activeUsers || "0",
      change: "+4.3%",
      isPositive: true,
      icon: <Users size={20} />,
      color: "green",
    },
    {
      title: "Content Unlocks",
      value: data?.stats?.salesCount || "0",
      change: "+18.2%",
      isPositive: true,
      icon: <Unlock size={20} />,
      color: "purple",
    },
    {
      title: "Pending Reports",
      value: data?.stats?.reportsPending || "0",
      change:
        data?.stats?.reportsPending > 0
          ? `1 New`
          : "No New",
      isPositive: data?.stats?.reportsPending === 0,
      icon: <FileText size={20} />,
      color: "red",
    },
  ];

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const chartValues =
    data?.chartData && data.chartData.length > 0
      ? data.chartData
      : REVENUE_CHART_DATA;

  const maxValue = Math.max(...chartValues, 1);

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back. Here’s what’s happening on your platform today.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Overview
              </h3>
              <p className="text-sm text-gray-500">
                Monthly revenue performance
              </p>
            </div>

            {/* FIXED CHART DISPLAY LOGIC */}
            <div className="grid grid-cols-12 gap-3 items-end h-64 border-b border-gray-100 pb-2">
              {chartValues.slice(0, 12).map((val, i) => {
                // Ensure height is calculated as a percentage relative to the highest value
                const heightPercent = (val / maxValue) * 100;

                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {val}
                    </div>

                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-500 rounded-t-lg cursor-pointer"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                    <span className="mt-2 text-xs text-gray-500 font-medium">
                      {months[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <Clock size={18} className="text-gray-400" />
            </div>

            <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
              {data?.activity?.length > 0 ? (
                data.activity.map((action) => (
                  <div
                    key={action.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          action.type === "success"
                            ? "bg-emerald-50 text-emerald-600"
                            : action.type === "danger"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {action.type === "success" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {action.event}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.user} • {action.time}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-gray-500">
                      {action.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">
                  No recent activity found.
                </p>
              )}
            </div>

            <button
              onClick={() => navigate("/admin/logs")}
              className="mt-6 w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;