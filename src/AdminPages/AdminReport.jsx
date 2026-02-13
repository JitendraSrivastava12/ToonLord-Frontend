import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronRight,
  User,
  Loader2,
  Trash2,
  Target,
  AlertCircle,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${API_URL}/reports/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/reports/admin/${reportId}`,
        { action: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchReports();
      setSelectedReport(null);
    } catch {
      alert("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearProcessed = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API_URL}/reports/admin/clear-processed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchReports();
      setIsPurgeModalOpen(false);
    } catch {
      alert("System error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-red-50 text-red-600 border border-red-100";
      case "investigating":
        return "bg-yellow-50 text-yellow-700 border border-yellow-100";
      case "resolved":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "dismissed":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Reports Management
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Review user flags and enforce community guidelines
            </p>
          </div>

          <button
            onClick={() => setIsPurgeModalOpen(true)}
            disabled={
              actionLoading ||
              !reports.some(
                (r) => r.status === "resolved" || r.status === "dismissed"
              )
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 shadow-sm"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Clear Processed
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">Issue</th>
                  <th className="px-6 py-4 text-left">Target</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-gray-400">
                      No reports available.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900 truncate">
                          {report.reason}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 truncate">
                          {report.parentManga?.title || "General Report"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                          <User size={12} />
                          {report.reporter?.username || "Unknown"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-orange-500" />
                          <span className="font-medium text-gray-900 truncate">
                            {report.targetUser?.username || "System"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-600 border border-purple-100 capitalize">
                          {report.targetType}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition shadow-sm"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-5 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Report Details
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="font-semibold text-gray-900">
                    {selectedReport.parentManga?.title ||
                      "General Content"}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    {selectedReport.reason}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-gray-700 italic">
                  {selectedReport.details ||
                    "No additional details provided."}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus(
                        selectedReport._id,
                        "investigating"
                      )
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Investigate
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus(
                        selectedReport._id,
                        "resolved"
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Resolve
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus(
                        selectedReport._id,
                        "dismissed"
                      )
                    }
                    className="bg-gray-800 hover:bg-black text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purge Modal */}
        {isPurgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl text-center space-y-4">
              <AlertCircle size={44} className="mx-auto text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Clear processed reports?
              </h3>
              <p className="text-gray-500 text-sm">
                This will permanently remove resolved and dismissed
                reports.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleClearProcessed}
                  className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setIsPurgeModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsManagement;
