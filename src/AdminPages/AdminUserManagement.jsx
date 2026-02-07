import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserX, UserCheck, Search, AlertTriangle, 
  X, ShieldAlert, ChevronRight, History, Ban, 
  RotateCcw, CheckCircle2, Info, Download,
  Mail, Trash2
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

// --- Action Confirm Modal (Custom replacement for window.confirm) ---
const ActionConfirmModal = ({ isOpen, onClose, onConfirm, title, message, actionLabel, variant = 'danger' }) => {
  if (!isOpen) return null;
  
  const themes = {
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200",
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-3xl ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
            <AlertTriangle size={32} />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs font-bold text-gray-400 mt-2 leading-relaxed px-2">
              {message}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 pt-4">
            <button 
              onClick={onConfirm} 
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${themes[variant]}`}
            >
              {actionLabel}
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all"
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
const ManageUserModal = ({ user, isOpen, onClose, onUpdateStatus, onDeleteTrigger }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-8 pb-0 text-center relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-8 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src={user.avatar || 'https://via.placeholder.com/150'} 
                className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-xl object-cover" 
                alt={user.name} 
              />
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white shadow-sm ${
                user.status === 'active' ? 'bg-green-500' : 
                user.status === 'banned' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{user.name}</h2>
              <p className="text-sm font-bold text-gray-400 flex items-center justify-center gap-1">
                <Mail size={14} /> {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 pt-10 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Security Controls</p>
            
            {user.status === 'active' && (
              <div className="grid grid-cols-1 gap-3">
                <div className="p-5 bg-green-50/50 border border-green-100 rounded-[2rem] flex gap-4 text-xs text-green-800 font-bold leading-relaxed">
                  <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                  Account is healthy. No recent violations detected.
                </div>
                <button 
                  onClick={() => onUpdateStatus(user.id, 'suspended')}
                  className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
                >
                  <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-600 shadow-sm"><History size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">Issue Suspension</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temporary Lock</p>
                  </div>
                </button>
                <button 
                  onClick={() => onUpdateStatus(user.id, 'banned')}
                  className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-red-400 hover:bg-red-50 transition-all group"
                >
                  <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm"><Ban size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">Permanent Ban</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blacklist Identity</p>
                  </div>
                </button>
              </div>
            )}

            {user.status === 'suspended' && (
              <div className="grid grid-cols-1 gap-3">
                <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-[2rem] flex gap-4 text-xs text-yellow-800 font-bold leading-relaxed">
                  <ShieldAlert className="text-yellow-600 shrink-0" size={20} />
                  Restricted due to <strong>{user.reports} reports</strong>. User is currently in "read-only" mode.
                </div>
                <button 
                  onClick={() => onUpdateStatus(user.id, 'active')}
                  className="flex items-center gap-4 p-5 bg-gray-900 text-white rounded-[2rem] hover:bg-black transition-all"
                >
                  <div className="p-3 bg-white/10 rounded-2xl"><RotateCcw size={20} /></div>
                  <p className="text-sm font-black">Lift Restriction</p>
                </button>
              </div>
            )}

            {user.status === 'banned' && (
              <div className="grid grid-cols-1 gap-3 text-xs text-red-800 font-bold leading-relaxed">
                <div className="p-5 bg-red-50 border border-red-100 rounded-[2rem] flex gap-4">
                  <UserX className="text-red-600 shrink-0" size={20} />
                  This user is completely barred from platform services.
                </div>
                <button 
                  onClick={() => onUpdateStatus(user.id, 'active')}
                  className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Reactivate Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-8 flex justify-between items-center border-t border-gray-100 shrink-0">
          <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            <Info size={14} /> Audit Logs
          </button>
          <button 
            onClick={() => onDeleteTrigger(user)} 
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} /> Delete User Data
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Roles');
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
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mappedData = response.data.users.map(u => ({
        id: u._id,
        name: u.username,
        email: u.email,
        role: u.role,
        status: u.status || 'active',
        lastActivity: new Date(u.updatedAt).toLocaleDateString(),
        reports: u.reports || 0,
        avatar: u.profilePicture || `https://i.pravatar.cc/150?u=${u._id}`
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
      const token = localStorage.getItem('adminToken');
      await axios.patch(`http://localhost:5000/api/users/manage-status`, 
        { userId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setIsModalOpen(false);
      showAlert(`Security level updated: ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Status sync failed", "error");
    }
  };

  const handleDeleteTrigger = (user) => {
    setUserToPurge(user);
    setIsConfirmOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!userToPurge) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/users/delete/${userToPurge.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== userToPurge.id));
      setIsConfirmOpen(false);
      setIsModalOpen(false);
      showAlert("Terminal: User record purged successfully.", "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Purge failed: Server error", "error");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'Authors') return matchesSearch && user.role === 'author';
    if (activeFilter === 'Readers') return matchesSearch && user.role === 'reader';
    return matchesSearch;
  });

  // --- CSV Export Implementation ---
  const handleExportList = () => {
    if (filteredUsers.length === 0) {
      showAlert("No users found to export.", "error");
      return;
    }

    // Prepare CSV data
    const headers = ["ID", "Username", "Email", "Role", "Status", "Last Activity", "Reports"];
    const csvRows = filteredUsers.map(u => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`, // Handle quotes in names
      u.email,
      u.role,
      u.status,
      u.lastActivity,
      u.reports
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `ToonLord_Users_${activeFilter.replace(' ', '_')}_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert(`Exported ${filteredUsers.length} records successfully.`, "success");
  };

  const stats = [
    { label: "Active", count: users.filter(u => u.status === 'active').length, icon: <UserCheck size={20} />, bg: "bg-green-50", text: "text-green-600" },
    { label: "Alerts", count: users.filter(u => u.status === 'suspended').length, icon: <AlertTriangle size={20} />, bg: "bg-yellow-50", text: "text-yellow-600" },
    { label: "Banned", count: users.filter(u => u.status === 'banned').length, icon: <UserX size={20} />, bg: "bg-red-50", text: "text-red-600" },
    { label: "Total", count: users.length, icon: <Users size={20} />, bg: "bg-blue-50", text: "text-blue-600" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing User Database</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">User Management</h1>
            <p className="text-gray-400 text-sm font-bold">Control access and safety for ToonLord</p>
          </div>
          <button 
            onClick={handleExportList}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border border-gray-200 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            <Download size={16} /> Export List
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl sm:text-4xl font-black">{stat.count}</p>
              </div>
              <div className={`p-4 rounded-[1.5rem] ${stat.bg} ${stat.text} shadow-sm`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Content Table Container */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Controls Header */}
          <div className="p-6 sm:p-8 border-b border-gray-50 flex flex-col lg:flex-row gap-6 justify-between items-center">
             <div className="relative w-full lg:max-w-md">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  className="w-full bg-gray-50/80 border-none rounded-[1.5rem] pl-14 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                {['All Roles', 'Authors', 'Readers'].map((filter) => (
                  <button 
                    key={filter} 
                    onClick={() => setActiveFilter(filter)}
                    className={`shrink-0 px-6 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeFilter === filter ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}>
                    {filter}
                  </button>
                ))}
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-gray-50">
                  <th className="px-10 py-6">User Identity</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Last Active</th>
                  <th className="px-10 py-6">Reports</th>
                  <th className="px-10 py-6 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-white" alt="" />
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">{user.name}</p>
                          <p className="text-xs text-gray-400 font-bold mt-1 tracking-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border tracking-widest shadow-sm ${
                        user.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                        user.status === 'banned' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-xs font-bold">
                      <p className="text-gray-900">{user.lastActivity}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5 uppercase">{user.role}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`text-sm font-black ${user.reports > 5 ? 'text-red-500' : 'text-gray-300'}`}>
                        {user.reports}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all"
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
        title="Confirm Purge"
        message={`This will permanently erase ${userToPurge?.name}'s account and all associated data from the terminal. This action cannot be undone.`}
        actionLabel="Purge Database Record"
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;