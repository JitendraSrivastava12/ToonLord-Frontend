import React, { useState, useContext, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, MessageSquare, Activity, 
  TrendingUp, Heart, Star, Eye, Calendar, User, Search, ChevronDown, 
  MoreHorizontal, ThumbsUp, Menu, X, Loader2, AlertTriangle, ArrowUpRight, 
  CheckCircle, Trash2, Send, Zap
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { AppContext } from "../UserContext"; 
import axios from 'axios';
import { useAlert } from "../context/AlertContext";
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// --- HELPER: Map Activity Type to UI ---
const getActivityUI = (type) => {
  const map = {
    manga_created: { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    chapter_uploaded: { icon: ArrowUpRight, color: 'text-green-500', bg: 'bg-green-500/10' },
    received_comment: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    received_like: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    milestone_reached: { icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    series_completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  };
  return map[type] || { icon: Activity, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' };
};

const SidebarItem = ({ icon: Icon, label, active, onClick, themeStyles }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300  ${
      active ? `${themeStyles.activeSidebar} text-white shadow-lg scale-[1.02]` : 'text-[var(--text-dim)] hover:bg-white/5'
    }`}
  >
    <Icon size={18} />
    <span className="font-semibold uppercase text-[10px] tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ title, value, change, icon: Icon, subtext, themeStyles }) => (
  <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)] group hover:border-[var(--accent)]/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[var(--text-dim)] font-semibold uppercase tracking-tighter text-[9px] opacity-70">{title}</p>
      <Icon size={16} className={themeStyles.textAccent} />
    </div>
    <h3 className="text-2xl md:text-3xl font-semibold text-[var(--text-main)] tracking-tighter">{value}</h3>
    {change && <p className="text-[9px] font-semibold uppercase mt-2 text-green-400">{change} <span className="text-[var(--text-dim)] lowercase opacity-50">growth</span></p>}
    {subtext && <p className="text-[9px] text-[var(--text-dim)] font-bold mt-2">{subtext}</p>}
  </div>
);

export default function MangaDashboard() {
  const { currentTheme, isRedMode, user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentSearch, setCommentSearch] = useState("");
  const [commentFilter, setCommentFilter] = useState("all");
  const [replyText, setReplyText] = useState({});
  const { showAlert } = useAlert();

  const creatorLogs = useMemo(() => 
    (user?.activityLog || []).filter(log => log.category === 'creator').reverse(), 
  [user]);

  const stats = useMemo(() => {
    const totalViews = seriesList.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
    const totalCommentsCount = comments.length; 
    const totalChapters = seriesList.reduce((acc, curr) => acc + (Number(curr.TotalChapter) || 0), 0);
    const ratedSeries = seriesList.filter(s => s.rating > 0);
    const avgRating = ratedSeries.length 
      ? (ratedSeries.reduce((a, b) => a + b.rating, 0) / ratedSeries.length).toFixed(1) 
      : "0.0";

    return {
      totalViews: totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews,
      totalComments: totalCommentsCount.toLocaleString(),
      avgRating,
      totalChapters
    };
  }, [seriesList, comments]);

  const themeStyles = useMemo(() => ({
    accent: isRedMode ? '#ef4444' : 'var(--accent)',
    textAccent: isRedMode ? 'text-red-500' : 'text-[var(--accent)]',
    activeSidebar: isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]',
    button: isRedMode ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-[var(--accent)] hover:opacity-90 shadow-[var(--accent-glow)]'
  }), [isRedMode]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [seriesRes, commentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/my-mangas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/comments/creator`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSeriesList(seriesRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredComments = useMemo(() => {
    return comments.filter(c => {
      const search = commentSearch.toLowerCase();
      const matchesSearch = (c.content || "").toLowerCase().includes(search) || 
                            (c.userId?.username || "").toLowerCase().includes(search) || 
                            (c.onModelId?.title || "").toLowerCase().includes(search);
      const matchesFilter = commentFilter === "all" || c.onModel === commentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [comments, commentSearch, commentFilter]);

  const handleReply = async (comment) => {
    const parentId = comment._id;
    if (!replyText[parentId]) return;
    try {
      await axios.post(`${API_URL}/api/comments/reply/${parentId}`, 
        { content: replyText[parentId], targetId: comment.onModelId?._id, targetType: comment.onModel },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReplyText({ ...replyText, [parentId]: "" });
      showAlert("Reply posted successfully", "success");
      fetchData(); 
    } catch (err) { showAlert("Failed to send reply", "error"); }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prev => prev.filter(c => c._id !== id));
      showAlert("Comment deleted", "success");
    } catch (err) { showAlert("Delete failed", "error"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4">
      <Loader2 className={`animate-spin ${themeStyles.textAccent}`} size={42} />
      <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[var(--text-dim)] animate-pulse mt-4 text-center">Establishing Secure Uplink</p>
    </div>
  );

  return (
    <div className={`flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] relative theme-${currentTheme}`}>
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-4 bottom-4 left-4 z-[60] w-[280px] border border-white/10 p-6 flex flex-col gap-8
        bg-[var(--bg-secondary)]/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl transition-all duration-500
        ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0 lg:translate-x-0 lg:opacity-100'}
        lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:ml-6
      `}>
        <div className="flex justify-between items-center">
          <h1 className={`text-xl font-bold tracking-tighter uppercase ${themeStyles.textAccent}`}>
            VAULT<span className="text-[var(--text-main)]">LOG</span>
          </h1>
          <button className="lg:hidden text-[var(--text-dim)]" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
        </div>

        <nav className="flex flex-col gap-2">
          {['Overview', 'My Mangas', 'Comments', 'Activities'].map((label) => (
            <SidebarItem 
              key={label}
              themeStyles={themeStyles} 
              icon={label === 'Overview' ? LayoutDashboard : label === 'My Mangas' ? BookOpen : label === 'Comments' ? MessageSquare : Activity} 
              label={label} 
              active={activeTab === label} 
              onClick={() => {setActiveTab(label); setIsSidebarOpen(false);}} 
            />
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full px-4 py-8 lg:px-12 lg:py-12 overflow-x-hidden">
        <header className="mb-8 lg:mb-12 flex justify-between items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">{activeTab}</h2>
            <div className={`h-1 w-16 md:w-24 mt-3 md:mt-6 ${themeStyles.activeSidebar} rounded-full`}></div>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white/5 rounded-2xl text-[var(--text-dim)]"><Menu size={24}/></button>
        </header>

        {/* --- OVERVIEW --- */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <StatCard themeStyles={themeStyles} title="Views" value={stats.totalViews} icon={Eye} />
              <StatCard themeStyles={themeStyles} title="Comments" value={stats.totalComments} icon={MessageSquare} />
              <StatCard themeStyles={themeStyles} title="Series" value={seriesList.length} icon={BookOpen} />
              <StatCard themeStyles={themeStyles} title="Score" value={stats.avgRating} icon={Star} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
              <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] border border-[var(--border)]">
                <h4 className="font-bold uppercase mb-8 flex items-center gap-3 text-[10px] tracking-widest opacity-40"><TrendingUp size={16}/> Flux</h4>
                <div className="h-64"><ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesList.slice(0, 8).map(s => ({ name: s.title.substring(0, 5), views: s.views }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fontSize: 9, fill: 'var(--text-dim)'}} axisLine={false} tickLine={false} />
                    <Line type="monotone" dataKey="views" stroke={themeStyles.accent} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer></div>
              </div>

              <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] border border-[var(--border)]">
                <h4 className="font-bold uppercase mb-8 flex items-center gap-3 text-[10px] tracking-widest opacity-40"><MessageSquare size={16}/> Feed</h4>
                <div className="space-y-6">
                  {comments.length > 0 ? comments.slice(0, 3).map(c => (
                    <div key={c._id} className="flex gap-4 items-center">
                      <img src={c.userId?.profilePicture || '/default.png'} className="w-10 h-10 rounded-xl object-cover border border-white/5" />
                      <div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{c.userId?.username}</p><p className="text-[10px] text-[var(--text-dim)] truncate opacity-70 italic">"{c.content}"</p></div>
                    </div>
                  )) : <p className="text-center py-6 text-[var(--text-dim)] text-[10px] uppercase font-bold opacity-30 tracking-widest">No Logs</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MY MANGAS --- */}
        {activeTab === 'My Mangas' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
            {seriesList.map(manga => (
              <Link to={`/manga/${manga._id}`} key={manga._id}>
                <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-[var(--border)] flex flex-col sm:flex-row gap-6 hover:border-[var(--accent)]/50 transition-all group overflow-hidden shadow-xl">
                  {/* Fixed Cover Image Zoom */}
                  <div className="relative w-full sm:w-36 h-56 sm:h-52 bg-white/5 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                    {/* Background Blur to fill gaps */}
                    <img src={manga.coverImage} className="absolute inset-0 w-full h-full object-cover blur-lg opacity-20" alt="" />
                    {/* The Actual Image */}
                    <img 
                      src={manga.coverImage} 
                      className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                      alt={manga.title} 
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[7px] font-bold uppercase tracking-widest border border-white/10 text-emerald-400">
                       {manga.status}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col py-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">{manga.title}</h3>
                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">{manga.genre || "Uncategorized"}</p>
                    <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                      <div className="text-center border-r border-white/5"><p className="text-xs font-bold">{manga.views || 0}</p><p className="text-[7px] uppercase font-bold opacity-40">Views</p></div>
                      <div className="text-center border-r border-white/5"><p className="text-xs font-bold">{manga.TotalChapter || 0}</p><p className="text-[7px] uppercase font-bold opacity-40">Chs</p></div>
                      <div className="text-center"><p className="text-xs font-bold text-amber-500">{manga.rating || '0.0'}</p><p className="text-[7px] uppercase font-bold opacity-40">Rate</p></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* --- COMMENTS --- */}
        {activeTab === 'Comments' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 bg-[var(--bg-secondary)]/10 p-5 md:p-8 rounded-[2rem] border border-[var(--border)]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] opacity-40" size={16} />
                <input type="text" placeholder="SCAN ARCHIVE..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-[10px] font-bold outline-none focus:border-[var(--accent)]/50 transition-all uppercase tracking-widest" onChange={(e) => setCommentSearch(e.target.value)} />
              </div>
              <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer" onChange={(e) => setCommentFilter(e.target.value)}>
                <option value="all">Unified</option>
                <option value="manga">Series</option>
                <option value="chapter">Chapters</option>
              </select>
            </div>

            <div className="space-y-6">
              {filteredComments.map((comment) => (
                <div key={comment._id} className="bg-[var(--bg-secondary)]/10 border border-[var(--border)] rounded-[2.5rem] p-5 md:p-8 shadow-xl hover:border-[var(--accent)]/30 transition-all group">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={comment.userId?.profilePicture || '/default.png'} className="w-12 h-12 rounded-2xl shrink-0 object-cover border border-white/10" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm uppercase tracking-tighter truncate">{comment.userId?.username || "OPERATIVE"}</h3>
                        <p className="text-[8px] opacity-40 font-bold uppercase mt-1 text-[var(--accent)] truncate">{comment.onModelId?.title}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteComment(comment._id)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                  <p className="text-sm border-l-4 border-[var(--accent)]/30 pl-6 py-1 mb-8 text-[var(--text-dim)] italic font-medium">"{comment.content}"</p>
                  <div className="relative">
                    <input type="text" placeholder="REPLY TO OPERATIVE..." value={replyText[comment._id] || ""} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-[9px] font-bold uppercase tracking-widest outline-none focus:border-[var(--accent)]/50 transition-all" onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })} />
                    <button onClick={() => handleReply(comment)} className={`absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg text-white ${themeStyles.activeSidebar} shadow-lg active:scale-95 transition-all`}><Send size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ACTIVITIES --- */}
        {activeTab === 'Activities' && (
          <div className="bg-[var(--bg-secondary)]/10 p-6 md:p-10 rounded-[2.5rem] border border-[var(--border)] animate-in slide-in-from-right-4">
            <div className="space-y-8 relative">
              {creatorLogs.map((log, i) => {
                const UI = getActivityUI(log.type);
                return (
                  <div key={i} className="flex gap-4 md:gap-8 items-start relative">
                    <div className={`z-10 p-3.5 md:p-4 rounded-xl ${UI.bg} ${UI.color} shrink-0 border border-white/5`}><UI.icon size={20} /></div>
                    <div className="flex-1 bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                      <h5 className="font-bold text-sm uppercase tracking-widest">{log.type.replace('_', ' ')}</h5>
                      <p className="text-[10px] text-[var(--text-dim)] mt-2 font-medium leading-relaxed opacity-70">{log.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[8px] font-bold text-emerald-500 opacity-60">VERIFIED_LOG</span>
                        <p className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">{new Date(log.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* --- FLOATING TRIGGER --- */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed bottom-6 right-6 z-[50] p-4 rounded-full border shadow-2xl lg:hidden active:scale-90 transition-transform ${isRedMode ? 'bg-red-600 border-red-400' : 'bg-[var(--accent)] border-white/20'}`}
      >
        <Zap className="text-white fill-white" size={24} />
      </button>
    </div>
  );
}