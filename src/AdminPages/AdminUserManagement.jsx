import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserX,
  UserCheck,
  Search,
  AlertTriangle,
  X,
  ShieldAlert,
  ChevronRight,
  History,
  Ban,
  RotateCcw,
  CheckCircle2,
  Info,
  Download,
  Mail,
  Trash2,
  ShieldCheck,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { useAlert } from "../context/AlertContext";

// --- Action Confirm Modal (Custom replacement for window.confirm) ---
const ActionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionLabel,
  variant = "danger",
}) => {
  if (!isOpen) return null;

  const themes = {
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={`p-4 rounded-3xl ${variant === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
          >
            <AlertTriangle size={32} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed px-2">
              {message}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 pt-4">
            <button
              onClick={onConfirm}
              className={`w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${themes[variant]}`}
            >
              {actionLabel}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Abort Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Responsive Manage User Modal ---
const ManageUserModal = ({
  user,
  isOpen,
  onClose,
  onUpdateStatus,
  onDeleteTrigger,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-8 pb-0 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-8 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                alt={user.name}
              />
              <div
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                  user.status === "active"
                    ? "bg-emerald-500"
                    : user.status === "banned"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                }`}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                {user.name}
              </h2>
              <p className="text-sm font-medium text-slate-400 flex items-center justify-center gap-1 mt-1">
                <Mail size={14} /> {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 pt-10 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Governance & Oversight
            </p>
            {user.status === "active" && (
              <div className="grid grid-cols-1 gap-3">
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4 text-xs text-emerald-800 font-medium leading-relaxed">
                  <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                  This account is currently in good standing with no active violations.
                </div>
                <button
                  onClick={() => onUpdateStatus(user.id, "suspended")}
                  className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all group"
                >
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                    <History size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">
                      Temporary Suspension
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Restrict Access Periodically
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onUpdateStatus(user.id, "banned")}
                  className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-rose-400 hover:bg-rose-50 transition-all group"
                >
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                    <Ban size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">
                      Permanent Deactivation
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Revoke Identity Privileges
                    </p>
                  </div>
                </button>
              </div>
            )}
            {user.status === "suspended" && (
              <div className="grid grid-cols-1 gap-3">
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4 text-xs text-amber-800 font-medium leading-relaxed">
                  <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                  <div>
                    Restricted account due to <strong>{user.reports} report flags</strong>.
                    <p className="mt-1 opacity-80">
                      Status: Limited Access (Read-Only)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onUpdateStatus(user.id, "active")}
                  className="flex items-center gap-4 p-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all group"
                >
                  <div className="p-3 bg-white/10 rounded-xl">
                    <RotateCcw size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Restore Privileges</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Return to Active Status
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => onUpdateStatus(user.id, "banned")}
                  className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-rose-400 hover:bg-rose-50 transition-all group"
                >
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                    <Ban size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">
                      Escalate to Permanent Ban
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Final Blacklist Action
                    </p>
                  </div>
                </button>
              </div>
            )}
            {user.status === "banned" && (
              <div className="grid grid-cols-1 gap-3 text-xs text-rose-800 font-medium leading-relaxed">
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4">
                  <UserX className="text-rose-600 shrink-0" size={20} />
                  This user has been formally excluded from all platform services.
                </div>
                <button
                  onClick={() => onUpdateStatus(user.id, "active")}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Reactivate Registry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-8 flex justify-between items-center border-t border-slate-100 shrink-0">
          <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            <Info size={14} /> View Audit Logs
          </button>
          <button
            onClick={() => onDeleteTrigger(user)}
            className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
          >
            <Trash2 size={14} /> Remove User Record
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Roles");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Confirmation States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToPurge, setUserToPurge] = useState(null);

  const { showAlert } = useAlert();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedData = response.data.users.map((u) => ({
        id: u._id,
        name: u.username,
        email: u.email,
        role: u.role,
        status: u.status || "active",
        lastActivity: new Date(u.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        reports: u.reports || 0,
        avatar: u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=random`,
      }));
      setUsers(mappedData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `http://localhost:5000/api/users/manage-status`,
        { userId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );
      setIsModalOpen(false);
      showAlert(
        `Registry updated: ${newStatus.toUpperCase()}`,
        "success",
      );
    } catch (err) {
      showAlert(err.response?.data?.message || "Protocol sync failed", "error");
    }
  };

  const handleDeleteTrigger = (user) => {
    setUserToPurge(user);
    setIsConfirmOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!userToPurge) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5000/api/users/delete/${userToPurge.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsers(users.filter((u) => u.id !== userToPurge.id));
      setIsConfirmOpen(false);
      setIsModalOpen(false);
      showAlert("Success: Data record successfully removed.", "success");
    } catch (err) {
      showAlert(
        err.response?.data?.message || "Execution failed: Connection error",
        "error",
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "Authors")
      return matchesSearch && user.role === "author";
    if (activeFilter === "Readers")
      return matchesSearch && user.role === "reader";
    return matchesSearch;
  });

  // --- CSV Export Implementation ---
  const handleExportList = () => {
    if (filteredUsers.length === 0) {
      showAlert("No records found for export.", "error");
      return;
    }

    const headers = [
      "ID",
      "Username",
      "Email",
      "Role",
      "Status",
      "Last Activity",
      "Reports",
    ];
    const csvRows = filteredUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.status,
      u.lastActivity,
      u.reports,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ToonLord_User_Directory_${date}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert(
      `Registry exported: ${filteredUsers.length} records processed.`,
      "success",
    );
  };

  const stats = [
    {
      label: "Active Members",
      count: users.filter((u) => u.status === "active").length,
      icon: <UserCheck size={20} />,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Flagged Accounts",
      count: users.filter((u) => u.status === "suspended").length,
      icon: <AlertTriangle size={20} />,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Blacklisted",
      count: users.filter((u) => u.status === "banned").length,
      icon: <UserX size={20} />,
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
    {
      label: "Total Directory",
      count: users.length,
      icon: <Users size={20} />,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Synchronizing User Directory
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              User Management
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Administrative oversight and community safety controls
            </p>
          </div>
          <button
            onClick={handleExportList}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Download size={16} /> Export Directory
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5"
            >
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.text} shrink-0`}
              >
                {stat.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Table Container */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* Controls Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col lg:flex-row gap-6 justify-between items-center bg-slate-50/30">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                placeholder="Search by identity or email..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-6 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {["All Roles", "Authors", "Readers"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeFilter === filter
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Identity</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Activity</th>
                  <th className="px-8 py-5">Flags</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={user.avatar}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                          alt=""
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full border tracking-widest ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : user.status === "banned"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium">
                      <p className="text-slate-900">{user.lastActivity}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 uppercase font-bold">
                        {user.role}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`text-xs font-bold ${user.reports > 3 ? "text-rose-500" : "text-slate-300"}`}
                      >
                        {user.reports}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Primary Management Modal */}
      <ManageUserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteTrigger={handleDeleteTrigger}
      />

      {/* Secondary Confirmation Modal */}
      <ActionConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteDelete}
        title="Delete User Data"
        message={`Warning: This will permanently remove ${userToPurge?.name} and all associated records from the directory. This process is non-reversible.`}
        actionLabel="Remove Record"
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;