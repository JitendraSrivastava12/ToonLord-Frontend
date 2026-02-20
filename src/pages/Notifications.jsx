import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Bell, BellOff, Activity, Trash2, CheckCheck, Layers, Settings, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from "../UserContext"; 

const API_URL = import.meta.env.VITE_API_URL;

/* ---------------- CUSTOM MODAL COMPONENT ---------------- */
const ClearConfirmModal = ({ isOpen, onConfirm, onCancel, isProcessing, isLight }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`w-full max-w-sm border rounded-[2.5rem] p-8 shadow-2xl text-center relative ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-white/10'
        }`}
      >
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={28} className="text-red-500" />
        </div>

        <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Clear Inbox?
        </h3>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          This will permanently delete all notifications from your record. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className={`flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-[1.5] py-4 rounded-2xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- MAIN PAGE COMPONENT ---------------- */
const NotificationPage = () => {
  const { currentTheme } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showClearModal, setShowClearModal] = useState(false);

  const isLight = currentTheme === 'light';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) { 
      console.error("Fetch Error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleClearAll = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/notifications/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]); 
      setShowClearModal(false);
    } catch (error) {
      console.error("Clear Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/users/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Read Error:", error);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'system') return n.category === 'system';
    return true;
  });

  const styles = {
    bg: isLight ? 'bg-slate-50' : 'bg-[#0b0b0b]',
    card: isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10',
    text: isLight ? 'text-slate-900' : 'text-white',
    subtext: isLight ? 'text-slate-500' : 'text-gray-400',
    navActive: isLight ? 'bg-slate-900 text-white' : 'bg-white text-black',
    navHover: isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5',
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto pt-12 px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Bell size={18} className="text-blue-500" />
              <span className={`text-sm font-medium ${styles.subtext}`}>
                Notifications
              </span>
            </div>
            <h1 className="text-3xl font-semibold">
              Inbox
            </h1>
          </div>

          <nav className="flex flex-col gap-2">
            {['all', 'unread', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex items-center justify-between px-5 py-3 rounded-xl transition border text-sm
                  ${filter === t 
                    ? `${styles.navActive}` 
                    : `${styles.navHover} ${styles.subtext}`
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={14} />
                  <span className="capitalize">{t}</span>
                </div>
              </button>
            ))}
          </nav>

          {notifications.length > 0 && (
            <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
              <button 
                onClick={handleMarkAllRead}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition ${
                  isLight ? 'bg-white hover:bg-slate-50' : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <CheckCheck size={14} className="text-blue-500" /> Mark all as read
              </button>

              <button 
                onClick={() => setShowClearModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          )}
        </aside>

        {/* MAIN LIST */}
        <main className="lg:col-span-8">
          <div className={`rounded-[2.5rem] border overflow-hidden shadow-xl ${styles.card}`}>
            <div className="p-6 border-b flex justify-between items-center bg-white/5 backdrop-blur-md">
              <span className={`text-xs font-bold uppercase tracking-widest ${styles.subtext}`}>
                Live Feed
              </span>
              <Settings size={16} className={styles.subtext} />
            </div>

            <div className="min-h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center h-[500px]">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] opacity-40">
                  <BellOff size={48} className="mb-4" />
                  <p className="text-sm">No notifications found</p>
                </div>
              ) : (
                <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/10'}`}>
                  <AnimatePresence>
                    {filtered.map((activity, idx) => (
                      <motion.div
                        key={activity._id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`p-6 flex gap-4 transition group ${!activity.isRead ? 'bg-blue-500/5' : ''}`}
                      >
                        {!activity.isRead && (
                          <div className="w-1 bg-blue-500 rounded-full h-12 self-center" />
                        )}

                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0 overflow-hidden">
                          {activity.originator?.avatar ? (
                            <img src={activity.originator.avatar} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="bg-blue-500/10 w-full h-full flex items-center justify-center">
                              <Layers size={20} className="text-blue-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">
                            <span className="font-bold text-blue-500">
                              {activity.originator?.username || 'System'}
                            </span>{" "}
                            <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>
                              {activity.description}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Activity size={10} className="text-gray-500" />
                            <time className={`text-[10px] font-medium uppercase tracking-tighter ${styles.subtext}`}>
                              {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </time>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        <ClearConfirmModal 
          isOpen={showClearModal}
          isProcessing={isProcessing}
          isLight={isLight}
          onConfirm={handleClearAll}
          onCancel={() => setShowClearModal(false)}
        />
      </AnimatePresence>
    </div>
  );
};

export default NotificationPage;