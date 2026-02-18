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
  ChevronDown,
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row"
      >
        {/* LEFT PANEL */}
        <div className="w-full md:w-96 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
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
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => adjust(setPrice, price, -5, 5)}
                className="px-4 py-3 hover:bg-gray-100 transition"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center font-semibold text-lg text-gray-900">
                {price} <span className="text-sm font-normal text-gray-500">Coins</span>
              </div>
              <button
                onClick={() => adjust(setPrice, price, 5)}
                className="px-4 py-3 hover:bg-gray-100 transition"
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
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => adjust(setAuthorSplit, authorSplit, -5, 0)}
                className="px-4 py-3 hover:bg-gray-100 transition"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center font-semibold text-lg text-gray-900">
                {authorSplit}%
              </div>
              <button
                onClick={() => adjust(setAuthorSplit, authorSplit, 5)}
                className="px-4 py-3 hover:bg-gray-100 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-6 md:p-10 relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <div className="max-w-xl space-y-6 md:space-y-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 pr-8">
              Premium Partnership Agreement
            </h2>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
              Deploying premium monetization for{" "}
              <span className="font-semibold italic">
                {manga?.manga?.title}
              </span>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Platform listing price:</span>
                <span className="font-semibold text-gray-900">{price} Coins</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Creator revenue allocation:</span>
                <span className="font-semibold text-gray-900">{authorSplit}%</span>
              </div>
            </div>

            <button
              onClick={() =>
                onConfirm({
                  offeredPrice: price,
                  split: authorSplit,
                })
              }
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Premium Intake Queue
            </h2>
            <p className="text-gray-500 text-sm">
              Evaluate monetization eligibility and deploy contracts
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by series title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition bg-white"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop Table Header - Hidden on Mobile */}
          <div className="hidden md:grid md:grid-cols-12 bg-gray-50/50 border-b border-gray-100 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Series Details</div>
            <div className="col-span-4">Creator</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredRequests.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <FileText
                  size={48}
                  className="mx-auto mb-4 opacity-20"
                />
                <p className="font-medium">No pending premium requests</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req._id} className="transition-colors hover:bg-gray-50/30">
                  {/* Row / Card Content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center px-4 py-5 md:px-6 md:py-5 gap-4">
                    {/* Series Info */}
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <img
                        src={req.manga?.coverImage}
                        alt=""
                        className="w-14 h-20 md:w-12 md:h-16 object-cover rounded-xl border border-gray-200 shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate text-base md:text-sm">
                          {req.manga?.title}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1.5">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <TrendingUp size={12} />
                            {req.statsAtRequest?.views?.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <FileText size={12} />
                            {req.statsAtRequest?.chapters} CH
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="col-span-1 md:col-span-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 md:font-medium">
                          {req.creator?.username}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {req.creator?.email}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === req._id ? null : req._id)
                        }
                        className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          expandedId === req._id
                            ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        {expandedId === req._id ? "Hide Details" : "Review Request"}
                        <ChevronDown size={14} className={`transition-transform md:hidden ${expandedId === req._id ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED SECTION */}
                  <AnimatePresence>
                    {expandedId === req._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50/80"
                      >
                        <div className="px-4 py-6 md:px-12 md:py-8">
                          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">System Reference</p>
                                <p className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                                  {req._id}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">
                                This series was submitted for premium review with 
                                <span className="font-bold text-gray-900 mx-1">
                                  {req.statsAtRequest?.views}
                                </span> 
                                total interactions.
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => {
                                  setCurrentTicket(req);
                                  setIsContractOpen(true);
                                }}
                                className="flex-1 sm:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-green-100"
                              >
                                Draft Contract
                              </button>

                              <button className="flex-1 sm:flex-none px-6 py-3 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors">
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL OVERLAY */}
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