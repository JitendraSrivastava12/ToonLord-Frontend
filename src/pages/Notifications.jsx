import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  MessageSquare, Heart, Bookmark, Star, CheckCircle, 
  Loader2, Settings, BellOff, ChevronRight, Hash, Layers, 
  ArrowRight, BellRing, Activity, Trash2, CheckCheck 
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
      console.error("Neural Fetch Error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleClearAll = async () => {
    if (!window.confirm("Purge all social and system logs?")) return;
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/users/notifications/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]); 
      // Sync with NavBar by reloading or refreshing user context
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
      
      // Update local state for immediate UI feedback
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Force NavBar update (Bell icon count)
      window.location.reload();
    } catch (error) {
      console.error("Read Error:", error);
    }
  };

  const getThemeColor = (type) => {
    switch (type) {
      case 'received_comment': return '#3b82f6';
      case 'received_like': return '#ef4444';
      case 'milestone_reached': return '#f59e0b';
      default: return isLight ? '#2563eb' : '#60a5fa';
    }
  };

  // --- STRICT FILTER LOGIC (Matches NavBar) ---
  const filtered = notifications.filter(n => {
    const allowedCategories = ['notification', 'social', 'system'];
    if (!allowedCategories.includes(n.category)) return false;

    if (filter === 'unread') return !n.isRead;
    if (filter === 'system') return n.category === 'notification' || n.category === 'system';
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
    <div className={`min-h-screen ${styles.bg} ${styles.text} transition-colors duration-700 font-sans`}>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: isLight ? 0.4 : 0.15 }}
          transition={{ duration: 10, repeat: Infinity }}
          className={`absolute top-[-10%] right-[-5%] w-[600px] h-[600px] blur-[120px] rounded-full ${isLight ? 'bg-blue-200' : 'bg-blue-600/20'}`} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-32 px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${styles.accent}`}>
                  <BellRing className={isLight ? 'text-blue-600' : 'text-blue-400'} size={20} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${styles.subtext}`}>Neural Sync</span>
              </div>
              <h1 className="text-7xl font-black tracking-tighter mb-4 italic leading-none text-blue-600">INBOX</h1>
            </motion.div>

            <nav className="flex flex-col gap-2 pt-4">
              {['all', 'unread', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all duration-500 group border ${
                    filter === t 
                    ? `${styles.navActive} border-transparent shadow-2xl scale-[1.02]` 
                    : `border-transparent ${styles.navHover} ${styles.subtext}`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Activity size={14} className={filter === t ? 'opacity-100' : 'opacity-30'} />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em]">{t}</span>
                  </div>
                  {filter === t && <motion.div layoutId="pill" className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                </button>
              ))}
            </nav>

            {notifications.length > 0 && (
              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <button 
                  onClick={handleMarkAllRead}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-white/10 hover:bg-white/5'}`}
                >
                  <CheckCheck size={14} className="text-blue-500" /> Mark All Read
                </button>
                <button 
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                  Purge Registry
                </button>
              </div>
            )}
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-8">
            <div className={`backdrop-blur-3xl rounded-[3.5rem] border shadow-2xl overflow-hidden ${styles.card}`}>
              <div className={`p-8 border-b flex justify-between items-center bg-white/[0.01] ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                <span className={`text-[10px] font-bold tracking-[0.4em] uppercase ${styles.subtext}`}>Stream_Active</span>
                <Settings size={18} className={styles.subtext} />
              </div>

              <div className="min-h-[600px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[600px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[600px] opacity-30">
                    <BellOff size={64} className="mb-6" />
                    <p className="text-xs font-black uppercase tracking-widest">No Signals Detected</p>
                  </div>
                ) : (
                  <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/5'}`}>
                    <AnimatePresence mode="popLayout">
                      {filtered.map((activity, idx) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={activity._id || idx}
                          className={`group relative p-10 flex gap-8 transition-all ${!activity.isRead ? 'bg-blue-500/[0.02]' : 'hover:bg-white/[0.01]'}`}
                        >
                          {!activity.isRead && (
                            <div className="absolute left-0 top-8 bottom-8 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          )}

                          <div className="relative shrink-0">
                            <div className={`w-20 h-20 rounded-[2rem] overflow-hidden border-2 flex items-center justify-center transition-transform group-hover:scale-105 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-white/10'}`}>
                              {activity.originator?.avatar ? (
                                <img src={activity.originator.avatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div style={{ color: getThemeColor(activity.type) }}><Layers size={28} /></div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: getThemeColor(activity.type) }}>
                                  {activity.type?.replace('_', ' ')}
                                </h4>
                                <p className={`text-xl font-medium tracking-tight leading-tight ${styles.text} ${!activity.isRead ? 'font-bold' : 'opacity-80'}`}>
                                  <span className="font-black italic underline decoration-blue-500/20 text-blue-500">{activity.originator?.username || 'System'}</span> {activity.description}
                                </p>
                              </div>
                              <time className={`text-[10px] font-mono font-bold ${styles.subtext}`}>
                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </time>
                            </div>

                            {activity.contentSnippet && (
                              <div className={`mt-4 p-5 rounded-3xl border text-[13px] italic ${isLight ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                                "{activity.contentSnippet}"
                              </div>
                            )}
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