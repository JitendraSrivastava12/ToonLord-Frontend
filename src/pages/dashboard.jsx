import React, { useState, useContext, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, MessageSquare, Activity, 
  TrendingUp, Heart, Star, Eye, Calendar, User, Search, ChevronDown, 
  MoreHorizontal, ThumbsUp, Menu, X, Loader2, AlertTriangle, ArrowUpRight, 
  CheckCircle, Trash2, Send
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { AppContext } from "../UserContext"; 
import axios from 'axios';
import { useAlert } from "../context/AlertContext";
import { Link } from 'react-router-dom';

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
    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${
      active ? `${themeStyles.activeSidebar} text-white shadow-lg` : 'text-[var(--text-dim)] hover:bg-white/5'
    }`}
  >
    <Icon size={18} />
    <span className="font-black uppercase italic text-[10px] tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ title, value, change, icon: Icon, subtext, themeStyles }) => (
  <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-6 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)]">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[var(--text-dim)] font-black uppercase tracking-tighter text-[9px] italic opacity-70">{title}</p>
      <Icon size={16} className={themeStyles.textAccent} />
    </div>
    <h3 className="text-3xl font-black italic text-[var(--text-main)]">{value}</h3>
    {change && <p className="text-[9px] font-black uppercase mt-2 text-green-400">{change} <span className="text-[var(--text-dim)] lowercase italic opacity-50">vs last month</span></p>}
    {subtext && <p className="text-[9px] text-[var(--text-dim)] font-bold italic mt-2">{subtext}</p>}
  </div>
);

const VIEWS_DATA = [
  { name: 'Jan 20', views: 3200 }, { name: 'Jan 22', views: 5100 },
  { name: 'Jan 24', views: 4800 }, { name: 'Jan 26', views: 9000 },
  { name: 'Jan 28', views: 12000 }, { name: 'Jan 30', views: 8000 },
  { name: 'Feb 02', views: 18000 }, { name: 'Feb 04', views: 15000 },
];

export default function MangaDashboard() {
  const { currentTheme, isRedMode, user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  
  // Comment States
  const [comments, setComments] = useState([]);
  const [commentSearch, setCommentSearch] = useState("");
  const [commentFilter, setCommentFilter] = useState("all");
  const [replyText, setReplyText] = useState({});

  const { showAlert } = useAlert();

  const creatorLogs = useMemo(() => 
    (user?.activityLog || []).filter(log => log.category === 'creator').reverse(), 
  [user]);

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
        axios.get('http://localhost:5000/api/users/my-mangas', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/comments/creator', { headers: { Authorization: `Bearer ${token}` } })
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

  // --- COMMENT ACTIONS ---
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
      await axios.delete(`http://localhost:5000/api/comments/${id}`, {
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
      await axios.post(`http://localhost:5000/api/comments/reply/${parentId}`, 
        { 
          content: replyText[parentId],
          targetId: comment.onModelId?._id,
          targetType: comment.onModel
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReplyText({ ...replyText, [parentId]: "" });
      showAlert("Reply posted successfully", "success");
      fetchData(); // Refresh to show replies (optional)
    } catch (err) { 
      showAlert("Failed to send reply", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <Loader2 className={`animate-spin ${themeStyles.textAccent}`} size={42} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-dim)] animate-pulse">Syncing Database</p>
    </div>
  );

  return (
    <div className={`flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] relative transition-all duration-700 theme-${currentTheme} mt-10`}>
      
      {/* SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50
        w-64 border-r border-[var(--border)] p-6 flex flex-col gap-8 
        bg-[var(--bg-secondary)]/20 backdrop-blur-3xl transition-transform duration-500
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex justify-between items-center px-2">
          <h1 className={`text-xl font-black italic tracking-tighter uppercase ${themeStyles.textAccent}`}>
            Manga<span className="text-[var(--text-main)]">Creator</span>
          </h1>
          <button className="lg:hidden text-[var(--text-dim)]" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
        </div>
        <nav className="flex flex-col gap-2">
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
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
        <header className="mb-12">
          <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter">{activeTab}</h2>
          <div className={`h-1 w-12 mt-4 ${themeStyles.activeSidebar}`}></div>
        </header>

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard themeStyles={themeStyles} title="Total Views" value="506.4k" change="+12.5%" icon={Eye} />
              <StatCard themeStyles={themeStyles} title="Total Likes" value="32,800" change="+18.2%" icon={Heart} />
              <StatCard themeStyles={themeStyles} title="Series" value={seriesList.length} subtext="Active works" icon={BookOpen} />
              <StatCard themeStyles={themeStyles} title="Engagement" value="4.9" subtext="Average rating" icon={Star} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Analytics Chart */}
              <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-8 rounded-3xl border border-[var(--border)]">
                <h4 className="font-black uppercase italic mb-10 flex items-center gap-3 text-xs tracking-[0.2em] opacity-60">
                  <TrendingUp size={18} className={themeStyles.textAccent}/> Analytics Trend
                </h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={VIEWS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-dim)', fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-dim)', fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--bg-secondary)', borderRadius: '15px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)'}} />
                      <Line type="monotone" dataKey="views" stroke={themeStyles.accent} strokeWidth={4} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RECENT COMMENTS (OVERVIEW) */}
              <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-8 rounded-3xl border border-[var(--border)]">
                <h4 className="font-black uppercase italic mb-8 flex items-center gap-3 text-xs tracking-[0.2em] opacity-60">
                  <MessageSquare size={18} className={themeStyles.textAccent}/> Reader Comments
                </h4>
                <div className="space-y-6">
                  {comments.length > 0 ? comments.slice(0, 4).map(comment => (
                    <div key={comment._id} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                        <img src={comment.userId?.profilePicture} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-black italic truncate">{comment.userId?.username}</p>
                          <span className="text-[9px] text-[var(--text-dim)] font-bold shrink-0">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-dim)] line-clamp-1 mt-1 italic opacity-70">"{comment.content}"</p>
                        <p className={`text-[8px] font-black uppercase mt-1 ${themeStyles.textAccent}`}>
                          {comment.onModelId?.title} {comment.onModel === 'chapter' ? `— CH.${comment.onModelId?.chapterNumber}` : ''}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-[var(--text-dim)] text-xs italic opacity-40">No recent interactions.</p>
                  )}
                </div>
              </div>
            </div>

            {/* RECENT FEED */}
            <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-8 rounded-3xl border border-[var(--border)]">
              <h4 className="font-black uppercase italic mb-8 flex items-center gap-3 text-xs tracking-[0.2em] opacity-60">
                <Activity size={18} className={themeStyles.textAccent}/> Recent Feed
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creatorLogs.slice(0, 4).map((log, idx) => {
                  const UI = getActivityUI(log.type);
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className={`p-3 rounded-xl ${UI.bg} ${UI.color}`}><UI.icon size={18}/></div>
                      <div>
                        <p className="text-xs font-black uppercase italic">{log.type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-[var(--text-dim)] font-bold truncate max-w-[200px]">{log.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: MY MANGAS --- */}
        {activeTab === 'My Mangas' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {seriesList.map(manga => (
              <Link to={`/manga/${manga._id}`} key={manga._id}>
                <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-6 rounded-3xl border border-[var(--border)] flex gap-6 hover:border-[var(--accent)]/50 transition-all group">
                  <img src={manga.coverImage} className="w-32 h-44 rounded-2xl object-cover shadow-2xl" alt="" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${manga.status === 'Ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-[var(--text-dim)]'}`}>
                        {manga.status}
                      </span>
                      <MoreHorizontal size={18} className="text-[var(--text-dim)]" />
                    </div>
                    <h3 className="text-xl font-black italic mt-3 uppercase tracking-tighter">{manga.title}</h3>
                    <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase italic opacity-60">{manga.genre}</p>
                    <div className="mt-auto flex gap-6 border-t border-white/5 pt-4">
                      <div><p className="text-xs font-black italic">{manga.views || 0}</p><p className="text-[8px] text-[var(--text-dim)] uppercase font-black">Views</p></div>
                      <div><p className="text-xs font-black italic">{manga.TotalChapter || 0}</p><p className="text-[8px] text-[var(--text-dim)] uppercase font-black">Chapters</p></div>
                      <div><p className="text-xs font-black italic text-yellow-500">{manga.rating || 'N/A'}</p><p className="text-[8px] text-[var(--text-dim)] uppercase font-black">Rating</p></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* --- TAB: COMMENTS (FEEDBACK HUB) --- */}
        {activeTab === 'Comments' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Header & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-secondary)]/10 p-6 rounded-3xl border border-[var(--border)]">
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search users, series, or text..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs outline-none focus:border-[var(--accent)] transition-all"
                    onChange={(e) => setCommentSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-black uppercase outline-none cursor-pointer"
                  onChange={(e) => setCommentFilter(e.target.value)}
                >
                  <option value="all">All Content</option>
                  <option value="manga">Series</option>
                  <option value="chapter">Chapters</option>
                </select>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {filteredComments.length > 0 ? filteredComments.map((comment) => (
                <div key={comment._id} className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl border border-[var(--border)] rounded-[40px] overflow-hidden hover:border-[var(--accent)]/30 transition-all group">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                          <img src={comment.userId?.profilePicture} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg uppercase italic tracking-wide">{comment.userId?.username || "Deleted User"}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-dim)] uppercase">
                              <Calendar size={12}/> {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${comment.onModel === 'manga' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                              {comment.onModelId?.title} {comment.onModel === 'chapter' ? `— CH.${comment.onModelId?.chapterNumber}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteComment(comment._id)} 
                          className="p-3 text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="ml-16 text-[var(--text-main)] text-sm leading-relaxed border-l-2 border-[var(--accent)]/30 pl-6 italic py-1 mb-8">
                      "{comment.content}"
                    </p>

                    <div className="ml-16 relative">
                      <input 
                        type="text" 
                        placeholder="Type a response to this reader..." 
                        value={replyText[comment._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-xs outline-none focus:border-[var(--accent)]/50 italic transition-all"
                      />
                      <button 
                        onClick={() => handleReply(comment)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white ${themeStyles.activeSidebar} shadow-lg active:scale-90 transition-all`}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Footer Info */}
                  <div className="bg-white/[0.02] px-8 py-3 border-t border-white/5 flex items-center gap-6">
                    <div className="flex items-center gap-1 text-[var(--text-dim)] font-bold text-[10px] uppercase">
                      <Heart size={12} className="text-red-500" /> {comment.likes?.length || 0} Likes
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-dim)] font-bold text-[10px] uppercase">
                      <MessageSquare size={12} className="text-blue-500" /> {comment.replies?.length || 0} Replies
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center bg-[var(--bg-secondary)]/5 rounded-[40px] border border-dashed border-[var(--border)]">
                   <MessageSquare className="mx-auto mb-4 opacity-20" size={48} />
                   <p className="text-sm font-black uppercase italic opacity-40">No readers have commented yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: ACTIVITIES (FULL LOG) --- */}
        {activeTab === 'Activities' && (
          <div className="bg-[var(--bg-secondary)]/10 backdrop-blur-2xl p-10 rounded-[40px] border border-[var(--border)] animate-in slide-in-from-right-8 duration-700">
            <div className="relative space-y-12 ml-4">
              {creatorLogs.length > 0 ? creatorLogs.map((log, i) => {
                const UI = getActivityUI(log.type);
                return (
                  <div key={i} className="relative flex gap-8 items-start">
                    {i !== creatorLogs.length - 1 && <div className="absolute left-7 top-14 bottom-[-48px] w-[1px] bg-[var(--border)]"></div>}
                    <div className={`z-10 p-4 rounded-2xl ${UI.bg} ${UI.color} shadow-xl border border-white/5`}>
                      <UI.icon size={22} />
                    </div>
                    <div className="flex-1 flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                      <div>
                        <h5 className="font-black text-lg uppercase italic leading-none">{log.type.replace('_', ' ')}</h5>
                        <p className="text-[var(--text-dim)] text-xs mt-2 italic font-medium">{log.description}</p>
                      </div>
                      <span className="text-[var(--text-dim)] text-[10px] font-black uppercase tracking-widest">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-20 opacity-30">
                  <Activity className="mx-auto mb-4" size={48} />
                  <p className="text-xs uppercase font-black">No creator logs found</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}