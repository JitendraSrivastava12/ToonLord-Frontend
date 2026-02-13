import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Bell, Heart, MessageSquare, Star, CheckCircle,
  Loader2, Settings, BellOff, Activity,
  Trash2, CheckCheck, Layers
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
      window.location.reload(); 
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
      window.location.reload();
    } catch (error) {
      console.error("Read Error:", error);
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'received_comment': return '#3b82f6';
      case 'received_like': return '#ef4444';
      case 'milestone_reached': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'system') return n.category === 'system';
    return true;
  });

  const styles = {
    bg: isLight ? 'bg-[#f8fafc]' : 'bg-[#050505]',
    card: isLight ? 'bg-white/70 border-slate-200' : 'bg-white/[0.03] border-white/10',
    text: isLight ? 'text-slate-900' : 'text-white',
    subtext: isLight ? 'text-slate-500' : 'text-gray-500',
    navActive: isLight ? 'bg-slate-900 text-white' : 'bg-white text-black',
    navHover: isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5',
    accent: isLight ? 'bg-blue-600/10' : 'bg-blue-600/5',
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} transition-colors duration-700`}>

      <div className="relative z-10 max-w-7xl mx-auto pt-10 px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${styles.accent}`}>
                  <Bell className="text-blue-500" size={20} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${styles.subtext}`}>
                  Notifications
                </span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter mb-4 text-blue-600">
                Inbox
              </h1>
            </div>

            <nav className="flex flex-col gap-2 pt-4">
              {['all', 'unread', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex items-center justify-between px-6 py-5 rounded-2xl transition-all border
                    ${filter === t 
                      ? `${styles.navActive} border-transparent shadow-lg` 
                      : `border-transparent ${styles.navHover} ${styles.subtext}`
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity size={14} />
                    <span className="text-[11px] font-black uppercase tracking-wider">{t}</span>
                  </div>
                </button>
              ))}
            </nav>

            {notifications.length > 0 && (
              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <button 
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                >
                  <CheckCheck size={14} className="text-blue-500" /> Mark all as read
                </button>
                <button 
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* MAIN LIST */}
          <div className="lg:col-span-8">
            <div className={`rounded-3xl border shadow-xl overflow-hidden ${styles.card}`}>
              <div className="p-6 border-b flex justify-between items-center">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${styles.subtext}`}>
                  Notifications
                </span>
                <Settings size={18} className={styles.subtext} />
              </div>

              <div className="min-h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[600px] opacity-30">
                    <BellOff size={64} className="mb-6" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      No notifications
                    </p>
                  </div>
                ) : (
                  <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/5'}`}>
                    <AnimatePresence>
                      {filtered.map((activity, idx) => (
                        <motion.div
                          key={activity._id || idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group p-8 flex gap-6 transition-all ${!activity.isRead ? 'bg-blue-500/[0.02]' : 'hover:bg-white/[0.01]'}`}
                        >
                          {!activity.isRead && (
                            <div className="w-1 bg-blue-500 rounded-full" />
                          )}

                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center border">
                            {activity.originator?.avatar ? (
                              <img src={activity.originator.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                            ) : (
                              <Layers size={28} style={{ color: getColor(activity.type) }} />
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: getColor(activity.type) }}>
                              {activity.type?.replace('_', ' ')}
                            </h4>
                            <p className={`text-lg leading-snug ${styles.text}`}>
                              <span className="font-bold text-blue-500">
                                {activity.originator?.username || 'System'}
                              </span>{" "}
                              {activity.description}
                            </p>
                            <time className={`text-[10px] font-mono ${styles.subtext}`}>
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
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
