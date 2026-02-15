import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Loader2,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAlert } from "../context/AlertContext";
const API_URL = import.meta.env.VITE_API_URL;
const ContractManagement = () => {
  const { showAlert } = useAlert();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${API_URL}/admin/all-contracts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setContracts(res.data);
    } catch (err) {
      showAlert("Failed to load contracts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const stats = [
    {
      label: "Active Premium",
      value: contracts.filter((c) => c.status === "accepted").length,
      icon: <CheckCircle2 size={20} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Waiting Action",
      value: contracts.filter(
        (c) => c.status === "contract_offered" || c.status === "pending"
      ).length,
      icon: <Clock size={20} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Rejected / Declined",
      value: contracts.filter(
        (c) => c.status === "rejected" || c.status === "declined"
      ).length,
      icon: <XCircle size={20} />,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const filteredContracts = contracts.filter(
    (c) =>
      c.manga?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 text-sm font-medium">
          Loading contracts...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Contract Management
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Monitor monetization agreements and creator partnerships
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                Contracts
              </h3>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by series or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">Series</th>
                  <th className="px-6 py-4 text-left">Creator</th>
                  <th className="px-6 py-4 text-left">Valuation</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="py-16 text-center text-gray-400 space-y-3">
                        <AlertCircle size={48} className="mx-auto opacity-30" />
                        <p className="text-sm font-medium">
                          No matching records found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={c.manga?.coverImage}
                            alt=""
                            className="w-12 h-16 object-cover rounded-lg shadow-sm border border-gray-100"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {c.manga?.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900">
                          {c.creator?.username}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {c.creator?.email}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {c.status === "pending"
                          ? "TBD"
                          : `${c.adminOffer?.price || 0} Coins`}
                        <p className="text-gray-400 text-xs mt-1">
                          70% revenue split
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-blue-600">
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// Professional Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    accepted:
      "bg-emerald-50 text-emerald-700 border border-emerald-100",
    contract_offered:
      "bg-amber-50 text-amber-700 border border-amber-100",
    pending:
      "bg-blue-50 text-blue-700 border border-blue-100",
    rejected:
      "bg-rose-50 text-rose-700 border border-rose-100",
    declined:
      "bg-gray-100 text-gray-700 border border-gray-200",
  };

  const labels = {
    accepted: "Active",
    contract_offered: "Waiting User",
    pending: "In Review",
    rejected: "Rejected",
    declined: "Declined",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
        styles[status] ||
        "bg-gray-100 text-gray-700 border border-gray-200"
      }`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
};

export default ContractManagement;
