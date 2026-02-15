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
  <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-6 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)] group hover:border-[var(--accent)]/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[var(--text-dim)] font-semibold uppercase tracking-tighter text-[9px] opacity-70">{title}</p>
      <Icon size={16} className={themeStyles.textAccent} />
    </div>
    <h3 className="text-3xl font-semibold text-[var(--text-main)] tracking-tighter">{value}</h3>
    {change && <p className="text-[9px] font-semibold uppercase mt-2 text-green-400">{change} <span className="text-[var(--text-dim)] lowercase opacity-50">growth</span></p>}
    {subtext && <p className="text-[9px] text-[var(--text-dim)] font-bold mt-2">{subtext}</p>}
  </div>
);

export default function MangaDashboard() {
  const { currentTheme, isRedMode, user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default false for floating style
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
      const contentMatch = (c.content || "").toLowerCase().includes(search);
      const userMatch = (c.userId?.username || "").toLowerCase().includes(search);
      const titleMatch = (c.onModelId?.title || "").toLowerCase().includes(search);
      const matchesSearch = contentMatch || userMatch || titleMatch;
      const matchesFilter = commentFilter === "all" || c.onModel === commentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [comments, commentSearch, commentFilter]);

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prev => prev.filter(c => c._id !== id));
      showAlert("Comment deleted", "success");
    } catch (err) { 
      showAlert("Delete failed", "error"); 
    }
  };

  const handleReply = async (comment) => {
    const parentId = comment._id;
    if (!replyText[parentId]) return;
    try {
      await axios.post(`${API_URL}/api/comments/reply/${parentId}`, 
        { 
          content: replyText[parentId],
          targetId: comment.onModelId?._id,
          targetType: comment.onModel
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReplyText({ ...replyText, [parentId]: "" });
      showAlert("Reply posted successfully", "success");
      fetchData(); 
    } catch (err) { 
      showAlert("Failed to send reply", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <Loader2 className={`animate-spin ${themeStyles.textAccent}`} size={42} />
      <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[var(--text-dim)] animate-pulse">Establishing Secure Uplink</p>
    </div>
  );

  return (
    <div className={`flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] relative transition-all duration-700 theme-${currentTheme} `}>
      
      {/* --- FLOATING BACKDROP OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- FLOATING SIDEBAR (THE VAULT) --- */}
      <aside className={`
        fixed top-10 bottom-6 left-6 z-[60]
        w-72 border border-white/10 p-8 flex flex-col gap-10
        bg-[var(--bg-secondary)]/30 backdrop-blur-3xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isSidebarOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-[120%] opacity-0 scale-95'}
        lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:translate-x-0 lg:opacity-100 lg:scale-100 lg:ml-6
      `}>
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl    font-bold tracking-tighter uppercase ${themeStyles.textAccent}  `}>
            VAULT<span className="text-[var(--text-main)] not- ">LOG</span>
          </h1>
          <button className="text-[var(--text-dim)] hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X size={22}/>
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {[
            { label: 'Overview', icon: LayoutDashboard },
            { label: 'My Mangas', icon: BookOpen },
            { label: 'Comments', icon: MessageSquare },
            { label: 'Activities', icon: Activity }
          ].map((tab) => (
            <SidebarItem 
              key={tab.label}
              themeStyles={themeStyles} 
              icon={tab.icon} 
              label={tab.label} 
              active={activeTab === tab.label} 
              onClick={() => {setActiveTab(tab.label); setIsSidebarOpen(false);}} 
            />
          ))}
        </nav>

        {/* VAULT STATUS DECORATION */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--text-dim)]">System_Online</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 px-8 py-2 lg:p-12 overflow-x-hidden">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h2 className="text-5xl    font-bold uppercase leading-none tracking-tighter  ">{activeTab}</h2>
            <div className={`h-1.5 w-24 mt-6 ${themeStyles.activeSidebar} rounded-full`}></div>
          </div>
          
          {/* TRIGGER FOR MOBILE/FLOATING VIEW */}
          
        </header>

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'Overview' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard themeStyles={themeStyles} title="Cumulative Views" value={stats.totalViews} change="+2.4%" icon={Eye} />
              <StatCard themeStyles={themeStyles} title="Comments" value={stats.totalComments} icon={MessageSquare} />
              <StatCard themeStyles={themeStyles} title="Deployed Assets" value={seriesList.length} subtext={`${stats.totalChapters} Total Chapters`} icon={BookOpen} />
              <StatCard themeStyles={themeStyles} title="Protocol Score" value={stats.avgRating} subtext="Avg. User Rating" icon={Star} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-10 rounded-[40px] border border-[var(--border)]">
                <h4 className="font-bold uppercase mb-12 flex items-center gap-3 text-[10px] tracking-[0.3em] opacity-40">
                  <TrendingUp size={16} className={themeStyles.textAccent}/> Real-time Flux
                </h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={seriesList.length > 0 ? seriesList.slice(0, 8).map(s => ({ name: s.title.substring(0, 6), views: s.views })) : []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-dim)', fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-dim)', fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--bg-secondary)', borderRadius: '15px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)'}} />
                      <Line type="monotone" dataKey="views" stroke={themeStyles.accent} strokeWidth={4} dot={{ r: 4, fill: themeStyles.accent }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-10 rounded-[40px] border border-[var(--border)]">
                <h4 className="font-bold uppercase mb-10 flex items-center gap-3 text-[10px] tracking-[0.3em] opacity-40">
                  <MessageSquare size={16} className={themeStyles.textAccent}/> Recent Feedbacks
                </h4>
                <div className="space-y-8">
                  {comments.length > 0 ? comments.slice(0, 3).map(comment => (
                    <div key={comment._id} className="flex gap-5 items-start">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0 shadow-lg">
                        <img src={comment.userId?.profilePicture || '/default.png'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold uppercase tracking-tight">{comment.userId?.username}</p>
                          <span className="text-[8px] font-mono opacity-30">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-[var(--text-dim)] line-clamp-1 opacity-70">"{comment.content}"</p>
                        <p className={`text-[9px] font-bold uppercase mt-2 ${themeStyles.textAccent} tracking-widest`}>
                          {comment.onModelId?.title}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-[var(--text-dim)] text-xs opacity-40 uppercase tracking-widest font-bold">Archive Empty</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: MY MANGAS --- */}
        {activeTab === 'My Mangas' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {seriesList.map(manga => (
              <Link to={`/manga/${manga._id}`} key={manga._id}>
                <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-[var(--border)] flex gap-8 hover:border-[var(--accent)]/50 transition-all group shadow-xl">
                  <div className="relative shrink-0">
                    <img src={manga.coverImage} className="w-36 h-52 rounded-2xl object-cover shadow-2xl transition-transform group-hover:scale-105" alt="" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[7px] font-bold uppercase tracking-widest border border-white/10 text-emerald-400">
                       {manga.status}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col py-2">
                    <h3 className="text-2xl font-bold uppercase tracking-tighter leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">{manga.title}</h3>
                    <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-40">{manga.genre || "Uncategorized"}</p>
                    <div className="mt-auto grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                      <div className="text-center border-r border-white/5"><p className="text-sm font-bold tracking-tighter">{manga.views || 0}</p><p className="text-[7px] text-[var(--text-dim)] uppercase font-bold opacity-40 mt-1">Impression</p></div>
                      <div className="text-center border-r border-white/5"><p className="text-sm font-bold tracking-tighter">{manga.TotalChapter || 0}</p><p className="text-[7px] text-[var(--text-dim)] uppercase font-bold opacity-40 mt-1">Sequence</p></div>
                      <div className="text-center"><p className="text-sm font-bold tracking-tighter text-amber-500">{manga.rating || '0.0'}</p><p className="text-[7px] text-[var(--text-dim)] uppercase font-bold opacity-40 mt-1">Valuation</p></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* --- TAB: COMMENTS --- */}
        {activeTab === 'Comments' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-secondary)]/10 p-8 rounded-[2.5rem] border border-[var(--border)]">
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] opacity-40" size={16} />
                  <input 
                    type="text" 
                    placeholder="SCANNING_FOR_KEYWORD..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--accent)] transition-all"
                    onChange={(e) => setCommentSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:bg-white/10 transition-all"
                  onChange={(e) => setCommentFilter(e.target.value)}
                >
                  <option value="all">Unified Content</option>
                  <option value="manga">Global Series</option>
                  <option value="chapter">Local Chapters</option>
                </select>
              </div>
            </div>

            <div className="space-y-8">
              {filteredComments.length > 0 ? filteredComments.map((comment) => (
                <div key={comment._id} className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl border border-[var(--border)] rounded-[3rem] overflow-hidden hover:border-[var(--accent)]/30 transition-all group shadow-2xl">
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 shadow-2xl">
                          <img src={comment.userId?.profilePicture || '/default.png'} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h3 className=" font-bold text-xl uppercase tracking-tighter">{comment.userId?.username || "OPERATIVE"}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-2 text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest opacity-40">
                              <Calendar size={12}/> {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${comment.onModel === 'manga' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                              {comment.onModelId?.title} {comment.onModel === 'chapter' ? `// CH.${comment.onModelId?.chapterNumber}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteComment(comment._id)} className="p-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-md">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p className="ml-20 text-[var(--text-main)] text-base font-medium leading-relaxed border-l-4 border-[var(--accent)]/20 pl-8 py-2 mb-10">
                      "{comment.content}"
                    </p>
                    <div className="ml-20 relative">
                      <input 
                        type="text" 
                        placeholder="TRANSMIT_RESPONSE..." 
                        value={replyText[comment._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--accent)] transition-all"
                      />
                      <button 
                        onClick={() => handleReply(comment)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl text-white ${themeStyles.activeSidebar} shadow-xl active:scale-95 transition-all`}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center bg-[var(--bg-secondary)]/5 rounded-[40px] border border-dashed border-[var(--border)]">
                   <MessageSquare className="mx-auto mb-6 opacity-10" size={64} />
                   <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Neural History Empty</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: ACTIVITIES --- */}
        {activeTab === 'Activities' && (
          <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-[var(--border)] animate-in slide-in-from-right-8 duration-700">
            <div className="relative space-y-12 ml-4">
              {creatorLogs.length > 0 ? creatorLogs.map((log, i) => {
                const UI = getActivityUI(log.type);
                return (
                  <div key={i} className="relative flex gap-10 items-start group">
                    {i !== creatorLogs.length - 1 && <div className="absolute left-8 top-16 bottom-[-55px] w-[2px] bg-white/5"></div>}
                    <div className={`z-10 p-5 rounded-[1.5rem] ${UI.bg} ${UI.color} shadow-2xl border border-white/5 group-hover:scale-110 transition-transform`}>
                      <UI.icon size={24} />
                    </div>
                    <div className="flex-1 flex justify-between items-center bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                      <div>
                        <h5 className=" font-bold text-xl uppercase tracking-tighter leading-none">{log.type.replace('_', ' ')}</h5>
                        <p className="text-[var(--text-dim)] text-sm mt-3 font-medium opacity-60 leading-relaxed">{log.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em]">VERIFIED</span>
                        <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest mt-1">{new Date(log.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-32 text-center opacity-20">
                  <Activity className="mx-auto mb-6" size={64} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em]">No System Records</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- FLOATING VAULT TRIGGER BUTTON --- */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed bottom-10 right-10 z-[50] p-5 rounded-full border backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:rotate-12 group
          ${isRedMode ? 'bg-red-600/20 border-red-500/50 hover:bg-red-600 shadow-red-500/30' : 'bg-[var(--accent)]/20 border-[var(--accent)]/50 hover:bg-[var(--accent)] shadow-[var(--accent-glow)]'}
        `}
      >
        <Zap className="text-white group-hover:fill-white transition-all" size={28} />
        {/* Visual Pulse for "Vault available" */}
        <span className="absolute inset-0 rounded-full animate-ping bg-white/20"></span>
      </button>
    </div>
  );
}