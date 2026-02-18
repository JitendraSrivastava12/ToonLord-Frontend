import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MapPin, Loader2, Edit3, 
  Zap, Activity, Clock, BookOpen, 
  Phone, Link as LinkIcon,
  CheckCircle2, ChevronRight, X, ScrollText, MessageSquare, Heart,
  Star, History, ShieldCheck, AlertTriangle, FileUp, Trash2, Plus, Cpu, Scale, Fingerprint, Users, UserPlus, Globe, Trophy, Search, Crown
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import axios from 'axios';
import { AppContext } from "../UserContext";
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
const ProfilePage = () => {
  const navigate = useNavigate();
  const { isRedMode, currentTheme, user, setUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const {showAlert}=useAlert();
  // Data States
  const [myMangas, setMyMangas] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  
  // --- NEW: Live Search State ---
  const [searchQuery, setSearchQuery] = useState("");

  // Loading States
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // --- View More Pagination State ---
  const [visibleCounts, setVisibleCounts] = useState({
    activity: 3,
    mangas: 6,
    comments: 3,
    reports: 3,
    followers: 8,
    following: 8
  });
  const INCREMENT = 5;

  const handleViewMore = (key) => {
    setVisibleCounts(prev => ({ ...prev, [key]: prev[key] + INCREMENT }));
  };

  const [isContractOpen, setIsContractOpen] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [signature, setSignature] = useState('');

  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const theme = {
    primary: isRedMode ? 'bg-red-500' : 'bg-emerald-500',
    text: isRedMode ? 'text-red-500' : 'text-emerald-500',
    dynamicBorder: "border-[var(--text-main)]/10",
    accentBorder: isRedMode ? 'border-red-500/40' : 'border-emerald-500/40',
    button: isRedMode ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600',
    card: "bg-[var(--card-bg)] shadow-xl",
    input: "bg-[var(--text-main)]/[0.03] text-[var(--text-main)]"
  };

  // Initial Profile & Manga Fetch
  useEffect(() => {
    const initProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setFetching(false); return; }
      try {
        const [userRes, mangaRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/getMe`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/users/my-mangas`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (userRes.data.success) {
            setUser(userRes.data.user);
            localStorage.setItem('user', JSON.stringify(userRes.data.user));
        }
        setMyMangas(Array.isArray(mangaRes.data) ? mangaRes.data : (mangaRes.data.mangas || []));
      } catch (err) { 
        console.error("Initialization failed", err); 
      } finally { 
        setFetching(false); 
      }
    };
    initProfile();
  }, [setUser, API_URL]);

  // --- NEW: Fetch Connections logic (Followers/Following) ---
  useEffect(() => {
    const fetchConnections = async () => {
      if (activeTab !== 'Followers' && activeTab !== 'Following') return;
      setConnectionsLoading(true);
      setSearchQuery(""); // Clear search on tab switch
      try {
        const token = localStorage.getItem('token');
        const type = activeTab.toLowerCase(); 
        const res = await axios.get(`${API_URL}/api/users/me/${type}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (activeTab === 'Followers') setFollowersList(res.data);
        else setFollowingList(res.data);
      } catch (err) {
        console.error("Error fetching connections", err);
      } finally {
        setConnectionsLoading(false);
      }
    };
    fetchConnections();
  }, [activeTab, API_URL]);

  // --- NEW: Live Search Filtering Logic ---
  const filteredFollowers = followersList.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFollowing = followingList.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch Comments logic
  useEffect(() => {
    const fetchUserComments = async () => {
      if (activeTab !== 'Comments') return;
      setCommentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/comments/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyComments(res.data);
      } catch (err) {
        console.error("Error fetching comments", err);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchUserComments();
  }, [activeTab, API_URL]);

  // Fetch Reports logic
  useEffect(() => {
    const fetchMyReports = async () => {
      if (activeTab !== 'Reports') return;
      setReportsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/reports/my-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyReports(res.data);
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchMyReports();
  }, [activeTab, API_URL]);

  const [form, setForm] = useState({ username: '', bio: '', location: '', mobile: '', preview: '', file: null });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '', bio: user.bio || '',
        location: user.location || '', mobile: user.mobile || '',
        preview: user.profilePicture || '', file: null
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('bio', form.bio);
      formData.append('location', form.location);
      formData.append('mobile', form.mobile);
      if (form.file) formData.append('profilePicture', form.file);

      const res = await axios.patch(`${API_URL}/api/users/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setIsEditing(false);
      }
    } catch (err) {
      showAlert("Failed to update profile",'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAuthor = async () => {
    if (!hasReadTerms || signature.toUpperCase() !== 'I ACCEPT') return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/users/request-author`, { confirmationText: signature }, { headers: { Authorization: `Bearer ${token}` }});
      setUser({ ...user, authorRequestPending: true });
      setIsContractOpen(false);
    } catch (err) { 
        showAlert("Error submitting request.",'error'); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyComments(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      showAlert("Failed to delete comment",'error');
    }
  };

  const filteredLogs = user?.activityLog?.filter(log => 
    log.category === 'reader' || log.category === 'system'
  ) || [];

  if (fetching) return (
    <div className={`min-h-screen flex items-center justify-center bg-[var(--bg-primary)] theme-${currentTheme}`}>
      <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] pb-20 font-sans selection:bg-emerald-500/30 theme-${currentTheme}`}>
      
      {/* 1. HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 pt-2 md:pt-10">
        <div className={`${theme.card} rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 border ${theme.dynamicBorder}`}>
          
          {/* PROFILE IMAGE WITH VIP LOGIC */}
          <div className="relative group flex items-center justify-center">
            {user?.vipStatus?.isVip ? (
              /* VIP PREMIUM BORDER */
              <div className="p-1 rounded-full bg-gradient-to-tr from-amber-400 via-amber-600 to-amber-300 shadow-[0_0_30px_rgba(217,119,6,0.15)]">
                <div className="bg-[var(--card-bg)] p-1 rounded-full">
                  <img 
                    src={form.preview || '/default.png'} 
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover shadow-2xl transition-all" 
                  />
                </div>
                {/* LARGE VIP CROWN BADGE */}
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 border-4 border-[var(--card-bg)] z-10 shadow-xl">
                  <Crown size={16} className="text-white fill-white" />
                </div>
              </div>
            ) : (
              /* STANDARD BORDER */
              <>
                <img 
                  src={form.preview || '/default.png'} 
                  alt="Profile"
                  className={`w-28 h-28 rounded-full border-4 ${isRedMode ? 'border-red-500/20' : 'border-emerald-500/20'} object-cover shadow-2xl transition-all group-hover:${theme.accentBorder}`} 
                />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className={`absolute bottom-0 right-0 p-2 bg-[var(--card-bg)] border ${theme.dynamicBorder} rounded-full text-[var(--text-main)] hover:${theme.text} transition-all shadow-lg`}
                >
                  <Camera size={14} />
                </button>
              </>
            )}

            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => setForm({...form, file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})} 
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight uppercase font-mono">{user?.username}</h1>
              <span className={`px-2 py-0.5 ${isRedMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} text-[10px] font-bold uppercase rounded border`}>
                {user?.role || 'Reader'}
              </span>
              {user?.vipStatus?.isVip && (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]  font-bold uppercase rounded border tracking-widest">
                  VIP_{user.vipStatus.plan}
                </span>
              )}
            </div>
            
            {/* FOLLOWER STATS */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-2">
               <div className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setActiveTab('Followers')}>
                  <span className={`text-lg  font-bold font-mono leading-none ${theme.text}`}>{user?.followers?.length || 0}</span>
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest">Followers</span>
               </div>
               <div className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setActiveTab('Following')}>
                  <span className={`text-lg  font-bold font-mono leading-none ${theme.text}`}>{user?.following?.length || 0}</span>
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-widest">Following</span>
               </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-medium text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 font-mono"><MapPin size={14}/> {user?.location || 'Not Set'}</span>
              <span className="flex items-center gap-1.5 font-mono"><Fingerprint size={14}/> UID-{user?._id?.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setIsEditing(!isEditing)} className={`px-5 py-2.5 rounded-xl bg-[var(--text-main)]/[0.05] border ${theme.dynamicBorder} text-sm font-bold hover:bg-[var(--text-main)]/[0.08] transition-all flex items-center gap-2`}>
              <Edit3 size={16} /> {isEditing ? "Cancel" : "Edit"}
            </button>
            <button className={`px-5 py-2.5 rounded-xl ${theme.button} text-white text-sm font-bold shadow-lg transition-all`}>
              Share
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className={`flex gap-8 mt-8 border-b ${theme.dynamicBorder} px-4 overflow-x-auto no-scrollbar`}>
          {['Overview', 'Followers', 'Following', 'Upload List', 'Comments', 'Reports'].map(tab => (
            <button 
              key={tab} 
              onClick={() => {setActiveTab(tab); setIsEditing(false);}}
              className={`pb-4 text-[11px]  font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? theme.text : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              {tab}
              {activeTab === tab && <motion.div layoutId="line" className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme.primary}`} />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT AREA */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="edit-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
                <h2 className="text-xl font-bold mb-6">Update Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Username" value={form.username} onChange={v => setForm({...form, username: v})} />
                  <Input label="Location" value={form.location} onChange={v => setForm({...form, location: v})} />
                  <Input label="Phone" value={form.mobile} onChange={v => setForm({...form, mobile: v})} />
                  <Input label="Email Address" value={user?.email} disabled />
                  <div className="md:col-span-2">
                    <label className="text-[10px]  font-bold text-[var(--text-muted)] uppercase mb-2 block ml-1">Biography</label>
                    <textarea 
                      value={form.bio} 
                      onChange={e => setForm({...form, bio: e.target.value})} 
                      className={`w-full ${theme.input} rounded-2xl p-4 text-sm font-bold outline-none transition-all border ${theme.dynamicBorder} focus:${theme.accentBorder} h-32 resize-none`} 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className={`w-full mt-8 py-4 ${theme.button} text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2`}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Save Changes
                </button>
              </motion.div>
            ) : (
              <>
                {activeTab === 'Overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-tight">Personal Details</h3>
                        <button onClick={() => setIsEditing(true)} className={`text-[10px]  font-bold uppercase tracking-widest ${theme.text} hover:opacity-80`}>Update Info</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <DetailItem label="Email Address" value={user?.email || 'Not provided'} isVerified />
                        <DetailItem label="Phone" value={user?.mobile || 'Not provided'} />
                        <div className="md:col-span-2">
                          <p className="text-[10px]  font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Bio</p>
                          <p className="text-sm text-[var(--text-main)] leading-relaxed italic opacity-80">
                            {user?.bio ? `"${user.bio}"` : "History purged or not yet established."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`${theme.card} rounded-[2.5rem] p-8 border ${theme.dynamicBorder}`}>
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-[var(--text-main)]/[0.05] ${theme.text}`}>
                            <Activity size={18} />
                          </div>
                          <h3 className="text-lg font-bold uppercase tracking-tight">Real-time Activity</h3>
                        </div>
                        <span className="text-[10px]  font-bold opacity-30 tracking-[0.4em]">LIVE_FEED</span>
                      </div>
                      <motion.div layout className="space-y-2">
                        {filteredLogs.length > 0 ? (
                          <>
                            {filteredLogs.slice(0, visibleCounts.activity).map((log, i) => (
                              <ActivityRow key={i} log={log} isRedMode={isRedMode} />
                            ))}
                            {filteredLogs.length > visibleCounts.activity && (
                              <button 
                                onClick={() => handleViewMore('activity')}
                                className={`w-full py-3 mt-4 text-[10px]  font-bold uppercase tracking-widest border border-dashed ${theme.dynamicBorder} rounded-xl hover:bg-[var(--text-main)]/[0.02] transition-all opacity-60 hover:opacity-100 flex items-center justify-center gap-2`}
                              >
                                <Plus size={12} /> Load older activities
                              </button>
                            )}
                          </>
                        ) : (
                          <div className={`text-center py-12 border border-dashed ${theme.dynamicBorder} rounded-2xl flex flex-col items-center gap-3`}>
                            <div className="p-3 bg-[var(--text-main)]/[0.03] rounded-full text-[var(--text-muted)]">
                                <History size={24} />
                            </div>
                            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">No Recent Activity</p>
                            <p className="text-xs text-[var(--text-muted)] opacity-60">Your interaction history will appear here.</p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Followers/Following TABS with SEARCH */}
                {(activeTab === 'Followers' || activeTab === 'Following') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-tight">{activeTab} Database</h3>
                        <div className="relative w-full md:w-64">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Filter ${activeTab}...`}
                                className={`w-full ${theme.input} pl-10 pr-4 py-2.5 rounded-xl border ${theme.dynamicBorder} text-[10px]  font-bold uppercase tracking-widest outline-none focus:${theme.accentBorder} transition-all`}
                            />
                        </div>
                    </div>

                    {connectionsLoading ? (
                      <div className="py-20 flex justify-center"><Loader2 className={`animate-spin ${theme.text}`} /></div>
                    ) : (activeTab === 'Followers' ? filteredFollowers : filteredFollowing).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeTab === 'Followers' ? filteredFollowers : filteredFollowing).slice(0, visibleCounts[activeTab.toLowerCase()]).map(u => (
                          <UserCard key={u._id} targetUser={u} theme={theme} onNavigate={() => navigate(`/profile/${u._id}`)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4 uppercase  font-bold tracking-widest">
                        <Users size={48} />
                        <p className="text-sm">{searchQuery ? "No operatives found" : "Archive Empty"}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'Upload List' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-tight">Uploaded Works</h3>
                        <span className={`px-2 py-1 rounded bg-[var(--text-main)]/[0.05] text-[10px] font-bold`}>{myMangas.length} TITLES</span>
                    </div>
                    {myMangas.length > 0 ? (
                      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myMangas.slice(0, visibleCounts.mangas).map((manga, i) => (
                           <div 
                              key={manga._id} 
                              onClick={() => navigate(`/manga/${manga._id}`)}
                              className={`p-4 rounded-2xl border ${theme.dynamicBorder} flex items-center gap-4 hover:bg-[var(--text-main)]/[0.02] transition-all cursor-pointer group`}
                           >
                             <div className="w-14 h-20 rounded-xl bg-[var(--text-main)]/10 overflow-hidden border border-white/5">
                                 {manga.coverImage && <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />}
                             </div>
                             <div className="flex-1 min-w-0">
                               <h4 className="text-sm font-bold uppercase tracking-tight truncate">{manga.title}</h4>
                               <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--text-main)]/5 border border-[var(--text-main)]/10 font-bold uppercase mt-1 inline-block">{manga.status || 'Active'}</span>
                             </div>
                             <ChevronRight size={16} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                           </div>
                        ))}
                        {myMangas.length > visibleCounts.mangas && (
                          <button 
                            onClick={() => handleViewMore('mangas')}
                            className={`py-4 rounded-2xl border-2 border-dotted ${theme.dynamicBorder} text-[10px]  font-bold uppercase tracking-tighter ${theme.text} hover:bg-[var(--text-main)]/[0.02] transition-all flex items-center justify-center gap-2`}
                          >
                            <Plus size={14} /> View More Titles
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                        <FileUp className="text-[var(--text-muted)] opacity-20" size={48} />
                        <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Archive Empty</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'Comments' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-8">My Conversations</h3>
                    
                    {commentsLoading ? (
                      <div className="py-20 flex justify-center"><Loader2 className={`animate-spin ${theme.text}`} /></div>
                    ) : myComments.length > 0 ? (
                      <motion.div layout className="space-y-4">
                        {myComments.slice(0, visibleCounts.comments).map((comment) => (
                          <div key={comment._id} className={`p-5 rounded-2xl border ${theme.dynamicBorder} bg-[var(--text-main)]/[0.02] group hover:bg-[var(--text-main)]/[0.04] transition-all`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                {comment.context?.image && (
                                  <img src={comment.context.image} className="w-8 h-10 object-cover rounded-md border border-[var(--text-main)]/10" alt="Target" />
                                )}
                                <div>
                                  <p className={`text-[10px]  font-bold uppercase tracking-widest ${theme.text}`}>
                                    {comment.context?.title}
                                  </p>
                                  <span className="text-[10px] font-mono opacity-40">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteComment(comment._id)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            
                            <p className="text-sm text-[var(--text-main)] opacity-80 leading-relaxed italic border-l-2 pl-4 border-[var(--text-main)]/10">
                              "{comment.content}"
                            </p>
                            
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
                                  <Heart size={12} className={comment.likes?.length > 0 ? "fill-red-500 text-red-500" : ""} />
                                  {comment.likes?.length || 0}
                                </div>
                            </div>
                          </div>
                        ))}
                        {myComments.length > visibleCounts.comments && (
                          <div className="pt-4 flex justify-center">
                            <button 
                              onClick={() => handleViewMore('comments')}
                              className={`px-8 py-3 rounded-full bg-[var(--text-main)]/[0.05] text-[10px]  font-bold uppercase tracking-widest hover:${theme.primary} hover:text-white transition-all shadow-sm flex items-center gap-2`}
                            >
                              <Plus size={12} /> Show More Comments
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                        <MessageSquare className="text-[var(--text-muted)] opacity-20" size={48} />
                        <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">No Conversations Yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'Reports' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-bold uppercase tracking-tight">My Submissions</h3>
                      <span className={`px-2 py-1 rounded bg-[var(--text-main)]/[0.05] text-[10px] font-bold`}>{myReports.length} FILED</span>
                    </div>

                    {reportsLoading ? (
                      <div className="py-20 flex justify-center"><Loader2 className={`animate-spin ${theme.text}`} /></div>
                    ) : myReports.length > 0 ? (
                      <motion.div layout className="space-y-4">
                        {myReports.slice(0, visibleCounts.reports).map((report) => (
                          <div key={report._id} className={`p-5 rounded-2xl border ${theme.dynamicBorder} bg-[var(--text-main)]/[0.02] group`}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className={`text-[10px]  font-bold uppercase tracking-widest ${theme.text} mb-1`}>
                                  {report.targetType} Report — {report.reason}
                                </p>
                                <p className="text-xs font-bold opacity-60 uppercase tracking-tighter">
                                  Target: {report.parentManga?.title || "Community Item"} 
                                </p>
                              </div>
                              <StatusBadge status={report.status} />
                            </div>

                            <p className="text-sm text-[var(--text-main)] opacity-80 leading-relaxed italic border-l-2 pl-4 border-[var(--text-main)]/10">
                              "{report.details || "No additional details provided."}"
                            </p>

                            <div className="mt-4 flex items-center justify-between text-[10px] font-mono opacity-40">
                              <span>REF_ID: {report._id.slice(-8).toUpperCase()}</span>
                              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}

                        {myReports.length > visibleCounts.reports && (
                          <button 
                            onClick={() => handleViewMore('reports')}
                            className={`w-full py-4 rounded-2xl border-2 border-dotted ${theme.dynamicBorder} text-[10px]  font-bold uppercase tracking-tighter ${theme.text} hover:bg-[var(--text-main)]/[0.02] transition-all flex items-center justify-center gap-2`}
                          >
                            <Plus size={14} /> View Older Reports
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                        <ShieldCheck className="text-[var(--text-muted)] opacity-20" size={48} />
                        <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Clear Record</p>
                        <p className="text-xs text-[var(--text-muted)] opacity-60">You haven't submitted any reports yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                
              </>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT AREA - SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          {/* --- VIP ACTIVATION PROTOCOL --- */}
          {!user?.vipStatus?.isVip && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${theme.card} rounded-3xl p-8 relative overflow-hidden group border-2 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]`}
            >
              {/* Holographic Background Effect */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[50px] pointer-events-none" 
              />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-amber-500/20">
                  <Crown size={24} className="fill-amber-500" />
                </div>
                
                <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase text-amber-500">Unlock VIP Mode</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold leading-relaxed mb-6 uppercase tracking-[0.2em] opacity-70">
                  Execute premium subscription protocol.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> 
                    <span className="group-hover/item:text-amber-500 transition-colors">Ad-Free Link Established</span>
                  </li>
                  <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> 
                    <span className="group-hover/item:text-amber-500 transition-colors">Exclusive Premium Sigils</span>
                  </li>
                  <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> 
                    <span className="group-hover/item:text-amber-500 transition-colors">Early Access Permissions</span>
                  </li>
                </ul>

                <button 
                  onClick={() => navigate('/subscription')}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Authorize Payment <Zap size={16} fill="white" />
                </button>
              </div>
            </motion.div>
          )}
          {user?.role !== 'author' && !user?.authorRequestPending && (
            <div className={`${theme.card} rounded-3xl p-8 relative overflow-hidden group border ${theme.dynamicBorder}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${isRedMode ? 'bg-red-500/10' : 'bg-emerald-500/10'} blur-[60px] transition-all group-hover:blur-[80px]`} />
              <div className={`w-10 h-10 ${isRedMode ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'} rounded-xl flex items-center justify-center mb-6`}>
                <Zap size={20} fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold mb-3">Become an Author</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">Publish your own works and build an audience.</p>
              <ul className="space-y-3 mb-8">
                <CheckItem text="Unlimited uploads" />
                <CheckItem text="Creator analytics" />
                <CheckItem text="Monetization tools" />
              </ul>
              <button 
                onClick={() => setIsContractOpen(true)}
                className={`w-full py-4 ${theme.button} text-white shadow-lg  font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95`}
              >
                Apply Now <ChevronRight size={16} />
              </button>
            </div>
          )}

          {user?.authorRequestPending && user?.role !== 'author' && (
            <div className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder} bg-blue-500/5`}>
               <div className="flex items-center gap-3 mb-4">
                 <Clock className="text-blue-500" size={20} />
                 <h3 className="text-sm font-bold uppercase tracking-tight">Application Pending</h3>
               </div>
               <p className="text-xs text-[var(--text-muted)] leading-relaxed">Your dossier is currently under review. You will be notified once the connection is established.</p>
            </div>
          )}

          <div className={`${theme.card} rounded-3xl p-8 border ${theme.dynamicBorder}`}>
            <h3 className="text-xs  font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Account Verification</h3>
            <div className="p-4 bg-[var(--text-main)]/[0.03] rounded-2xl border border-dashed ${theme.dynamicBorder} text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--text-main)]/[0.05] ${theme.text}`}>
                <ShieldCheck size={24} />
              </div>
              <p className="text-[10px]  font-bold uppercase tracking-widest mb-1">Status: Operational</p>
              <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">All security protocols are active and current.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      <AnimatePresence>
        {isContractOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContractOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 50, opacity: 0 }} 
              className={`relative w-full max-w-2xl bg-[#fdfdfd] text-slate-900 rounded-sm shadow-2xl overflow-hidden flex flex-col h-[90vh]`}
            >
                <div className="p-8 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Scale className="text-slate-800" size={24} />
                    <div>
                        <h3 className="text-xl font-serif  font-bold uppercase tracking-tighter">Content Creator Agreement</h3>
                        <p className="text-[9px] font-mono uppercase text-slate-500 tracking-widest">Document ref: TL-AUTH-2026-X</p>
                    </div>
                  </div>
                  <button onClick={() => setIsContractOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-900"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 font-serif leading-relaxed text-sm space-y-6 bg-white text-justify">
                    <div className="text-center mb-8">
                        <h4 className="font-bold underline uppercase">Section I: Declaration of Originality</h4>
                    </div>
                    <p>I, the undersigned, acting as the Content Creator (hereafter referred to as "Author"), hereby declare that all graphical works and narrative scripts uploaded to the <strong>ToonLord Platform</strong> are my exclusive intellectual property.</p>
                    <div className="bg-slate-50 p-6 border-l-4 border-slate-300 italic text-left">
                        "The Author retains 70% of all Gross Digital Revenue generated through the platform. ToonLord handles hosting and global distribution."
                    </div>
                    <h5 className="font-bold uppercase underline mt-8">Section II: Prohibited Conduct</h5>
                    <ul className="list-decimal pl-5 space-y-3">
                        <li>The distribution of AI-generated content without explicit tagging.</li>
                        <li>Infringement upon third-party trademarks or character designs.</li>
                        <li>Intentional manipulation of engagement metrics.</li>
                    </ul>
                </div>

                <div className="p-8 bg-slate-50 border-t-2 border-slate-900">
                  <label className="flex items-start gap-3 mb-6 cursor-pointer select-none group">
                    <div className="mt-1">
                        <input type="checkbox" checked={hasReadTerms} onChange={e => setHasReadTerms(e.target.checked)} className={`w-4 h-4 accent-slate-900`} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 text-left">I have meticulously reviewed the Terms and acknowledge that this agreement is legally binding under digital jurisdiction.</span>
                  </label>
                  <div className="relative mb-6">
                    <p className="absolute -top-2.5 left-4 bg-slate-50 px-2 text-[10px]  font-bold uppercase text-slate-400">Digital Signature</p>
                    <input 
                        type="text" 
                        placeholder="PLEASE TYPE 'I ACCEPT' TO VALIDATE" 
                        value={signature} 
                        onChange={e => setSignature(e.target.value)} 
                        className={`w-full bg-transparent border-2 border-slate-300 p-4 font-mono text-sm uppercase tracking-[0.3em] outline-none focus:border-slate-900 transition-all text-center`} 
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsContractOpen(false)} className="px-6 py-4 text-xs  font-bold uppercase text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
                    <button 
                      onClick={handleRequestAuthor} 
                      disabled={signature.toUpperCase() !== 'I ACCEPT' || !hasReadTerms || loading}
                      className={`flex-1 py-4  font-bold uppercase text-xs tracking-widest transition-all ${signature.toUpperCase() === 'I ACCEPT' && hasReadTerms ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {loading ? 'Transmitting...' : 'Execute Agreement'}
                    </button>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SQUARE BOX USER CARD WITH CIRCULAR IMAGE & DETAILS ---

const UserCard = ({ targetUser, theme, onNavigate }) => {
  const isVip = targetUser.vipStatus?.isVip || false;

  return (
    <div 
      onClick={onNavigate}
      className={`p-6 rounded-[2.5rem] border ${isVip ? 'border-amber-500/20 shadow-amber-500/5' : theme.dynamicBorder} bg-[var(--text-main)]/[0.02] flex flex-col items-center text-center group hover:bg-[var(--text-main)]/[0.04] transition-all cursor-pointer relative overflow-hidden shadow-lg`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${isVip ? 'bg-amber-500/5' : (theme.primary + ' opacity-[0.03]')} blur-3xl`} />

      <div className="relative mb-4 shrink-0">
        {isVip ? (
          /* VIP MINI CIRCULAR BORDER */
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 shadow-md">
            <div className="bg-[var(--card-bg)] p-[2px] rounded-full">
              <img 
                src={targetUser.profilePicture || '/default.png'} 
                className="w-20 h-20 rounded-full object-cover transition-transform group-hover:scale-110" 
                alt={targetUser.username} 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full border-2 border-[var(--card-bg)]">
              <Crown size={10} className="text-white fill-white" />
            </div>
          </div>
        ) : (
          /* STANDARD CIRCLE */
          <>
            <img 
              src={targetUser.profilePicture || '/default.png'} 
              className={`w-20 h-20 rounded-full border-4 ${theme.accentBorder} object-cover shadow-xl transition-transform group-hover:scale-110`} 
              alt={targetUser.username} 
            />
            {targetUser.role === 'author' && (
              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${theme.primary} text-white shadow-md border-2 border-[var(--card-bg)]`}>
                <Trophy size={12} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full">
        <div className="flex flex-col items-center gap-1 mb-2">
          <p className={`text-sm  font-bold uppercase tracking-tight truncate w-full line-clamp-1 ${isVip ? 'text-amber-600' : ''}`}>
            {targetUser.username}
          </p>
          <span className={`text-[8px] px-2 py-0.5 rounded-full border ${theme.dynamicBorder} font-bold uppercase opacity-60 tracking-widest bg-[var(--text-main)]/5`}>
            {isVip ? 'VIP Reader' : (targetUser.role || 'Reader')}
          </span>
        </div>
        
        <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 italic mb-4 h-8 leading-relaxed">
          {targetUser.bio || "No biography established."}
        </p>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const ToggleItem = ({ title, description, defaultChecked }) => {
  const [enabled, setEnabled] = useState(defaultChecked);
  const { isRedMode } = useContext(AppContext);
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--text-main)]/[0.02] transition-all">
      <div className="flex-1 text-left">
        <p className="text-sm font-bold uppercase tracking-tight">{title}</p>
        <p className="text-xs text-[var(--text-muted)] opacity-60">{description}</p>
      </div>
      <button 
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full transition-all relative ${enabled ? (isRedMode ? 'bg-red-500' : 'bg-emerald-500') : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    investigating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dismissed: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px]  font-bold uppercase border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const ActivityRow = ({ log, isRedMode }) => {
  const action = (log?.action || log?.description || '').toLowerCase();
  let Icon = Activity;
  let iconColor = isRedMode ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400';
  if (log.category === 'system') {
    Icon = ShieldCheck;
    iconColor = 'bg-slate-500/10 text-slate-400';
  } else if (action.includes('read') || action.includes('chapter')) {
    Icon = BookOpen;
    iconColor = 'bg-blue-500/10 text-blue-400';
  } else if (action.includes('comment')) {
    Icon = MessageSquare;
    iconColor = 'bg-purple-500/10 text-purple-400';
  } else if (action.includes('like') || action.includes('favorite')) {
    Icon = Heart;
    iconColor = 'bg-pink-500/10 text-pink-400';
  } else if (action.includes('review') || action.includes('rated')) {
    Icon = Star;
    iconColor = 'bg-amber-500/10 text-amber-400';
  }
  return (
    <div className="flex items-start gap-4 group cursor-pointer hover:bg-[var(--text-main)]/[0.04] p-4 rounded-2xl transition-all border border-transparent hover:border-[var(--text-main)]/10">
      <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${iconColor}`}><Icon size={16}/></div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-[var(--text-main)] leading-snug">{log.description || log.action} <span className={isRedMode ? 'text-red-400' : 'text-emerald-400'}>{log.target || ''}</span></p>
        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-1 flex items-center gap-1"><Clock size={10} /> {log.timestamp || log.createdAt ? new Date(log.timestamp || log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Recently'}</p>
      </div>
      <ChevronRight size={16} className="text-[var(--text-muted)] mt-2 opacity-0 group-hover:opacity-100 transition-all" />
    </div>
  );
};

const DetailItem = ({ label, value, isVerified }) => {
  const { isRedMode } = useContext(AppContext);
  return (
    <div className="group cursor-default text-left">
      <p className="text-[10px]  font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 group-hover:text-[var(--text-main)] transition-colors">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[var(--text-main)] font-mono">{value}</span>
        {isVerified && <CheckCircle2 size={14} className={isRedMode ? "text-red-500" : "text-emerald-500"} />}
      </div>
    </div>
  );
};

const CheckItem = ({ text }) => {
  const { isRedMode } = useContext(AppContext);
  return (
    <li className="flex items-center gap-3 text-sm font-bold text-[var(--text-muted)] group">
      <CheckCircle2 size={16} className={`${isRedMode ? "text-red-500" : "text-emerald-500"} transition-transform group-hover:scale-110`} /> {text}
    </li>
  );
};

const Input = ({ label, value, onChange, disabled }) => {
  const { isRedMode } = useContext(AppContext);
  return (
    <div className="text-left">
      <label className="text-[10px]  font-bold text-[var(--text-muted)] uppercase mb-2 block ml-1">{label}</label>
      <input 
        disabled={disabled}
        value={value} 
        onChange={e => onChange?.(e.target.value)} 
        className={`w-full bg-[var(--text-main)]/[0.03] border border-[var(--text-main)]/10 rounded-2xl p-4 text-sm font-bold outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : `focus:border-${isRedMode ? 'red' : 'emerald'}-500/50 focus:bg-[var(--card-bg)] shadow-inner`}`} 
      />
    </div>
  );
};

export default ProfilePage;