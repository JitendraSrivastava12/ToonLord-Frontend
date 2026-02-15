import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Bell, BellOff, Activity, Trash2, CheckCheck, Layers, Settings, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from "../UserContext"; 

const NotificationPage = () => {
  const { currentTheme } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('all');

  const isLight = currentTheme === 'light';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/notifications', {
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
    if (!window.confirm("Clear all notifications?")) return;
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/users/notifications/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]); 
    } catch (error) {
      console.error("Clear Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/users/notifications/read', {}, {
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border"
              >
                <CheckCheck size={14} className="text-blue-500" /> Mark all as read
              </button>

              <button 
                onClick={handleClearAll}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                Clear all
              </button>
            </div>
          )}
        </aside>

        {/* MAIN LIST */}
        <main className="lg:col-span-8">
          <div className={`rounded-2xl border overflow-hidden ${styles.card}`}>
            <div className="p-5 border-b flex justify-between items-center">
              <span className={`text-sm font-medium ${styles.subtext}`}>
                Notifications
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
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/10'}`}>
                  <AnimatePresence>
                    {filtered.map((activity, idx) => (
                      <motion.div
                        key={activity._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-6 flex gap-4 transition ${!activity.isRead ? 'bg-blue-500/5' : ''}`}
                      >
                        {!activity.isRead && (
                          <div className="w-1 bg-blue-500 rounded-full" />
                        )}

                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border">
                          {activity.originator?.avatar ? (
                            <img src={activity.originator.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                          ) : (
                            <Layers size={22} className="text-blue-500" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm leading-snug">
                            <span className="font-medium text-blue-500">
                              {activity.originator?.username || 'System'}
                            </span>{" "}
                            {activity.description}
                          </p>
                          <time className={`text-xs ${styles.subtext}`}>
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </time>
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
    </div>
  );
};

export default NotificationPage;
