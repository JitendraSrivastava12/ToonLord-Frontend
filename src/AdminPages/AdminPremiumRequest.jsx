import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Search,
  FileText,
  CheckCircle,
  TrendingUp,
  X,
  Plus,
  Minus,
  Loader2,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { useAlert } from "../context/AlertContext";

/* ============================
   CONTRACT MODAL (Upgraded)
============================ */
const API_URL = import.meta.env.VITE_API_URL;
const ContractModal = ({
  isOpen,
  onClose,
  manga,
  onConfirm,
  loading,
}) => {
  const [price, setPrice] = useState(20);
  const [authorSplit, setAuthorSplit] = useState(70);

  if (!isOpen) return null;

  const adjust = (setter, val, step, min = 0) => {
    const newVal = parseFloat((val + step).toFixed(2));
    if (newVal >= min) setter(newVal);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row"
      >
        {/* LEFT PANEL */}
        <div className="w-full md:w-96 bg-gray-50 border-r border-gray-200 p-8 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Contract Terms
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Configure valuation and revenue split
            </p>
          </div>

          {/* PRICE */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-2">
              <Sparkles size={12} /> Retail Price
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => adjust(setPrice, price, -5, 5)}
                className="px-4 py-3 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center font-semibold text-lg text-gray-900">
                {price} Coins
              </div>
              <button
                onClick={() => adjust(setPrice, price, 5)}
                className="px-4 py-3 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* SPLIT */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-2">
              <BarChart3 size={12} /> Creator Revenue Share
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => adjust(setAuthorSplit, authorSplit, -5, 0)}
                className="px-4 py-3 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center font-semibold text-lg text-gray-900">
                {authorSplit}%
              </div>
              <button
                onClick={() => adjust(setAuthorSplit, authorSplit, 5)}
                className="px-4 py-3 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-10 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <div className="max-w-xl space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Premium Partnership Agreement
            </h2>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
              Deploying premium monetization for{" "}
              <span className="font-semibold">
                {manga?.manga?.title}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                Platform listing price:{" "}
                <span className="font-semibold text-gray-900">
                  {price} Coins
                </span>
              </p>
              <p>
                Creator revenue allocation:{" "}
                <span className="font-semibold text-gray-900">
                  {authorSplit}%
                </span>
              </p>
            </div>

            <button
              onClick={() =>
                onConfirm({
                  offeredPrice: price,
                  split: authorSplit,
                })
              }
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} /> Confirm & Issue Contract
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ============================
   MAIN PAGE (Upgraded)
============================ */

const MangaPremiumRequests = () => {
  const { showAlert } = useAlert();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${API_URL}/admin/premium-queue`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(res.data);
    } catch {
      showAlert("Queue sync failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirmContract = async (contractData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/issue-contract`,
        {
          requestId: currentTicket._id,
          offeredPrice: contractData.offeredPrice,
          note: `Contract issued: ${contractData.split}% split.`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("Contract issued", "success");
      setIsContractOpen(false);
      fetchRequests();
    } catch {
      showAlert("Contract failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((req) =>
    req.manga?.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2
          className="animate-spin text-blue-600"
          size={48}
        />
        <p className="text-gray-400 text-sm mt-2">
          Loading Premium Queue...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Premium Intake Queue
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Evaluate monetization eligibility and deploy contracts
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/3 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">Series</th>
                <th className="px-6 py-4 text-left">Creator</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <div className="py-20 text-center text-gray-400">
                      <FileText
                        size={40}
                        className="mx-auto mb-3 opacity-30"
                      />
                      No pending premium requests
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <React.Fragment key={req._id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={req.manga?.coverImage}
                            className="w-12 h-16 object-cover rounded-lg border border-gray-100 shadow-sm"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {req.manga?.title}
                            </p>
                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <TrendingUp size={10} />
                                {req.statsAtRequest?.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText size={10} />
                                {req.statsAtRequest?.chapters} CH
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900">
                          {req.creator?.username}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {req.creator?.email}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === req._id
                                ? null
                                : req._id
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            expandedId === req._id
                              ? "bg-gray-900 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {expandedId === req._id
                            ? "Close"
                            : "Review"}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED CARD */}
                    <AnimatePresence>
                      {expandedId === req._id && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td
                            colSpan={3}
                            className="px-6 py-6 bg-gray-50"
                          >
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:justify-between gap-6">
                              <div className="text-sm text-gray-600 space-y-2">
                                <p>
                                  Request ID:{" "}
                                  <span className="font-mono text-gray-800">
                                    {req._id}
                                  </span>
                                </p>
                                <p>
                                  Engagement snapshot:{" "}
                                  {req.statsAtRequest?.views} interactions
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  onClick={() => {
                                    setCurrentTicket(req);
                                    setIsContractOpen(true);
                                  }}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition"
                                >
                                  Draft Contract
                                </button>

                                <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition">
                                  Decline
                                </button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isContractOpen && (
          <ContractModal
            isOpen={isContractOpen}
            onClose={() => setIsContractOpen(false)}
            manga={currentTicket}
            loading={submitting}
            onConfirm={handleConfirmContract}
          />
        )}
      </div>
    </div>
  );
};

export default MangaPremiumRequests;
