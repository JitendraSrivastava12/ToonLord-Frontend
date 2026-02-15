import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/admin/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading logs...</p>
      </div>
    );

  const getStatusBadge = (type) => {
    switch (type) {
      case "success":
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full">
            <CheckCircle2 size={14} className="mr-1" /> Success
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-rose-800 bg-rose-100 rounded-full">
            <AlertCircle size={14} className="mr-1" /> Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-100 rounded-full">
            <Info size={14} className="mr-1" /> Info
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Logs</h1>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No logs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto pr-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">{log.event}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {log.user} • {log.time}
                </p>
              </div>

              <div className="flex justify-between items-center">
                {getStatusBadge(log.type)}
                <p className="text-xs text-gray-400">{log.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogsPage;
