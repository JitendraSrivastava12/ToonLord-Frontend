import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Loader2, Activity, Clock, BookOpen, 
  CheckCircle2, ChevronRight, MessageSquare, 
  Star, ShieldCheck, FileUp, Plus, Fingerprint, 
  Users, UserPlus, UserMinus, Globe, Trophy, Search, Eye, Hash, ChevronDown, Crown
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from "../UserContext";

const VisitorProfile = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isRedMode, currentTheme, user: loggedInUser, setUser: setLoggedInUser } = useContext(AppContext);
  
  const [targetUser, setTargetUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [targetMangas, setTargetMangas] = useState([]);
  const [targetComments, setTargetComments] = useState([]); 
  
  // Connection Lists
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // VIEW MORE STATES
  const [limits, setLimits] = useState({ 
    mangas: 4, 
    comments: 4, 
    activity: 4,
    followers: 6,
    following: 6 
  });
  const MAX_LIMIT = 20; 

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTargetData = async () => {
      setFetching(true);
      try {
        const [profileRes, commentsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/profile/${id}`),
          axios.get(`${API_URL}/api/comments/user/${id}`)
        ]);

        if (profileRes.data.success) {
          setTargetUser(profileRes.data.user);
          setTargetMangas(profileRes.data.mangas || []);
        }
        setTargetComments(commentsRes.data || []);
      } catch (err) {
        console.error("Data load failed", err);
      } finally {
        setFetching(false);
      }
    };
    fetchTargetData();
  }, [id, API_URL]);

  const globalStats = useMemo(() => {
    if (!targetMangas.length) return { avgRating: "0.0", totalViews: "0" };
    const rated = targetMangas.filter(m => Number(m.rating) > 0);
    const avg = rated.length ? (rated.reduce((a, b) => a + Number(b.rating), 0) / rated.length).toFixed(1) : "0.0";
    const views = targetMangas.reduce((acc, m) => acc + (Number(m.views) || 0), 0);
    return {
      avgRating: avg,
      totalViews: views >= 1000 ? (views / 1000).toFixed(1) + 'k' : views
    };
  }, [targetMangas]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (activeTab !== 'Followers' && activeTab !== 'Following') return;
      setConnectionsLoading(true);
      try {
        const type = activeTab.toLowerCase();
        const res = await axios.get(`${API_URL}/api/users/${id}/${type}`);
        if (activeTab === 'Followers') setFollowersList(res.data);
        else setFollowingList(res.data);
      } catch (err) {
        console.error("Failed to load connections", err);
      } finally {
        setConnectionsLoading(false);
      }
    };
    fetchConnections();
  }, [activeTab, id, API_URL]);

  const handleViewMore = (key) => {
    setLimits(prev => ({
      ...prev,
      [key]: Math.min(prev[key] + 4, MAX_LIMIT)
    }));
  };

  const isFollowing = loggedInUser?.following?.includes(id);

  const handleFollowToggle = async () => {
    if (!loggedInUser) return navigate('/loginlanding');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/users/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoggedInUser(res.data.currentUser);
      setTargetUser(prev => ({
        ...prev,
        followersCount: res.data.isFollowing ? (prev.followersCount + 1) : (prev.followersCount - 1)
      }));
    } catch (err) {
      alert("Synchronization failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const theme = {
    primary: isRedMode ? 'bg-red-500' : 'bg-emerald-500',
    text: isRedMode ? 'text-red-500' : 'text-emerald-500',
    dynamicBorder: "border-[var(--text-main)]/10",
    accentBorder: isRedMode ? 'border-red-500/40' : 'border-emerald-500/40',
    button: isRedMode ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600',
    card: "bg-[var(--card-bg)] shadow-xl border border-[var(--text-main)]/5",
    input: "bg-[var(--text-main)]/[0.03] text-[var(--text-main)]"
  };

  const filteredFollowers = followersList.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFollowing = followingList.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (fetching) return (
    <div className={`min-h-screen flex items-center justify-center bg-[var(--bg-primary)] theme-${currentTheme}`}>
      <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] pb-20 font-sans theme-${currentTheme}`}>
      
      {/* 1. PROFILE HEADER */}
      <div className="max-w-7xl mx-auto px-6 md:pt-10">
        <div className={`${theme.card} rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8`}>
          
          {/* PROFILE IMAGE WITH VIP LOGIC */}
          <div className="relative group flex items-center justify-center shrink-0">
            {targetUser?.vipStatus?.isVip ? (
              /* PREMIUM CIRCULAR BORDER */
              <div className="p-1 rounded-full bg-gradient-to-tr from-amber-400 via-amber-600 to-amber-300 shadow-[0_0_30px_rgba(217,119,6,0.2)]">
                <div className="bg-[var(--card-bg)] p-1 rounded-full">
                  <img 
                    src={targetUser?.profilePicture || '/default.png'} 
                    className="w-32 h-32 rounded-full object-cover shadow-2xl transition-all group-hover:scale-105" 
                    alt="Avatar"
                  />
                </div>
                {/* LARGE VIP CROWN BADGE */}
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-2 border-4 border-[var(--card-bg)] z-10 shadow-xl">
                  <Crown size={18} className="text-white fill-white" />
                </div>
              </div>
            ) : (
              /* STANDARD BORDER */
              <>
                <img 
                  src={targetUser?.profilePicture || '/default.png'} 
                  className={`w-32 h-32 rounded-full border-4 ${isRedMode ? 'border-red-500/20' : 'border-emerald-500/20'} object-cover shadow-2xl transition-all group-hover:scale-105`} 
                  alt="Avatar"
                />
                {targetUser?.role === 'author' && (
                  <div className={`absolute -bottom-2 -right-2 p-2 rounded-full ${theme.primary} text-white shadow-lg border-4 border-[var(--card-bg)]`}>
                    <Trophy size={16} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <h1 className="text-3xl   font-semibold tracking-tight uppercase">{targetUser?.username}</h1>
              <span className={`px-3 py-1 ${isRedMode ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'} text-[10px]   font-semibold uppercase rounded-full border border-current`}>
                {targetUser?.role || 'Member'}
              </span>
              {targetUser?.vipStatus?.isVip && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]   font-semibold uppercase rounded-full border tracking-widest flex items-center gap-1.5">
                  <Crown size={10} className="fill-current"/> VIP {targetUser.vipStatus.plan}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-8 mb-6">
               <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setActiveTab('Followers')}>
                  <p className={`text-xl   font-semibold leading-none ${theme.text}`}>{targetUser?.followersCount || 0}</p>
                  <p className="text-[10px]  font-semibold uppercase text-[var(--text-muted)] tracking-widest mt-1">Followers</p>
               </div>
               <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setActiveTab('Following')}>
                  <p className={`text-xl   font-semibold leading-none ${theme.text}`}>{targetUser?.followingCount || 0}</p>
                  <p className="text-[10px]  font-semibold uppercase text-[var(--text-muted)] tracking-widest mt-1">Following</p>
               </div>
               <div className="text-center md:text-left">
                  <p className={`text-xl   font-semibold leading-none ${theme.text}`}>{targetMangas.length}</p>
                  <p className="text-[10px]  font-semibold uppercase text-[var(--text-muted)] tracking-widest mt-1">Series</p>
               </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px]  font-semibold text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><MapPin size={14}/> {targetUser?.location || 'Global'}</span>
              <span className="flex items-center gap-1.5 font-mono"><Fingerprint size={14}/> {targetUser?._id?.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleFollowToggle}
              disabled={actionLoading}
              className={`px-10 py-3.5 rounded-2xl ${isFollowing ? 'bg-[var(--text-main)]/[0.05] border ' + theme.dynamicBorder : theme.button + ' text-white shadow-xl'} text-xs   font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95`}
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : (isFollowing ? <UserMinus size={16}/> : <UserPlus size={16}/>)}
              {isFollowing ? "Unfollow" : "Follow User"}
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className={`flex gap-10 mt-10 border-b ${theme.dynamicBorder} px-6 overflow-x-auto no-scrollbar`}>
          {['Overview', 'Shared Work', 'Followers', 'Following', 'Comments', 'Activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[11px]   font-semibold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? theme.text : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              {tab}
              {activeTab === tab && <motion.div layoutId="tab-line" className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme.primary}`} />}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className={`${theme.card} rounded-3xl p-8`}>
                  <h3 className="text-sm   font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={18} className={theme.text} /> Biography
                  </h3>
                  <p className="text-[15px] text-[var(--text-main)] leading-relaxed opacity-80 italic">
                    {targetUser?.bio ? `"${targetUser.bio}"` : "This user has not provided a biography yet."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard icon={<Star size={20}/>} label="Average Rating" value={globalStats.avgRating} theme={theme} />
                  <StatCard icon={<MessageSquare size={20}/>} label="Total Comments" value={targetComments.length} theme={theme} />
                  <StatCard icon={<Eye size={20}/>} label="Total Views" value={globalStats.totalViews} theme={theme} />
                </div>
              </motion.div>
            )}

            {activeTab === 'Shared Work' && (
              <motion.div key="work" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`${theme.card} rounded-3xl p-8`}>
                <h3 className="text-sm   font-semibold uppercase tracking-widest mb-8">Published Works</h3>
                {targetMangas.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {targetMangas.slice(0, limits.mangas).map((manga) => (
                        <div key={manga._id} onClick={() => navigate(`/manga/${manga._id}`)}
                          className={`p-4 rounded-2xl border ${theme.dynamicBorder} flex items-center gap-5 hover:bg-[var(--text-main)]/[0.03] transition-all cursor-pointer group bg-[var(--text-main)]/[0.01]`}
                        >
                          <img src={manga.coverImage} className="w-16 h-20 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform" alt="" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm   font-semibold uppercase truncate group-hover:text-emerald-500 transition-colors">{manga.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[9px] px-2 py-0.5 rounded bg-[var(--text-main)]/5  font-semibold uppercase border border-[var(--text-main)]/5">{manga.status}</span>
                               <div className="flex items-center gap-1 text-yellow-500  font-semibold text-[9px]"><Star size={10} fill="currentColor"/> {manga.rating || "0.0"}</div>
                            </div>
                          </div>
                          <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      ))}
                    </div>
                    {targetMangas.length > limits.mangas && (
                      <ViewMoreButton onClick={() => handleViewMore('mangas')} theme={theme} />
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                    <FileUp size={48} strokeWidth={1} />
                    <p className="text-xs   font-semibold uppercase tracking-widest">No Series Available</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'Comments' && (
               <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8`}>
                  <h3 className="text-sm   font-semibold uppercase tracking-widest mb-8">User Comments</h3>
                  <div className="space-y-4">
                    {targetComments.length > 0 ? (
                      <>
                        {targetComments.slice(0, limits.comments).map((comment, i) => (
                          <div key={i} className="p-5 rounded-2xl bg-[var(--text-main)]/[0.02] border border-[var(--text-main)]/5 transition-all">
                             <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--text-main)]/5">
                                <div className={`p-2 rounded-lg ${isRedMode ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                   <BookOpen size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px]   font-semibold uppercase truncate">{comment.onModelId?.title || "Discussion"}</p>
                                    {comment.onModelId?.chapterNumber && <p className="text-[8px]  font-semibold opacity-40 uppercase"><Hash size={8}/> Chapter {comment.onModelId.chapterNumber}</p>}
                                </div>
                                <span className="text-[8px] font-mono opacity-30 uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm text-[var(--text-main)] opacity-80 italic leading-relaxed border-l-2 border-[var(--text-main)]/10 pl-4">"{comment.content}"</p>
                          </div>
                        ))}
                        {targetComments.length > limits.comments && (
                          <ViewMoreButton onClick={() => handleViewMore('comments')} theme={theme} />
                        )}
                      </>
                    ) : (
                      <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                        <MessageSquare size={48} strokeWidth={1} />
                        <p className="text-xs   font-semibold uppercase tracking-widest">No conversation records</p>
                      </div>
                    )}
                  </div>
               </motion.div>
            )}

            {(activeTab === 'Followers' || activeTab === 'Following') && (
              <motion.div key="connections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className="text-sm   font-semibold uppercase tracking-widest">{activeTab} List</h3>
                    <div className="relative w-full md:w-64">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter..." className={`w-full ${theme.input} pl-10 pr-4 py-2.5 rounded-xl border ${theme.dynamicBorder} text-[10px]   font-semibold uppercase outline-none`} />
                    </div>
                </div>

                {connectionsLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(activeTab === 'Followers' ? filteredFollowers : filteredFollowing).slice(0, activeTab === 'Followers' ? limits.followers : limits.following).map(u => (
                        <UserCard key={u._id} targetUser={u} theme={theme} onNavigate={() => navigate(`/profile/${u._id}`)} />
                      ))}
                    </div>
                    {((activeTab === 'Followers' ? filteredFollowers : filteredFollowing).length > (activeTab === 'Followers' ? limits.followers : limits.following)) && (
                      <ViewMoreButton onClick={() => handleViewMore(activeTab.toLowerCase())} theme={theme} />
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'Activity' && (
               <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${theme.card} rounded-3xl p-8`}>
                  <h3 className="text-sm   font-semibold uppercase tracking-widest mb-8">Recent Activity</h3>
                  <div className="space-y-4">
                    {targetUser?.activityLog?.filter(l => l.category === 'reader').length > 0 ? (
                      <>
                        {targetUser.activityLog.filter(l => l.category === 'reader').slice(0, limits.activity).map((log, i) => (
                          <div key={i} className="flex items-start gap-5 p-4 rounded-2xl bg-[var(--text-main)]/[0.02] border border-[var(--text-main)]/5 transition-colors">
                            <div className={`p-3 rounded-xl ${isRedMode ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}><Activity size={16}/></div>
                            <div className="flex-1">
                              <p className="text-sm  font-semibold opacity-90">{log.description}</p>
                              <p className="text-[10px] font-mono opacity-40 uppercase mt-1 flex items-center gap-1"><Clock size={10}/> {new Date(log.timestamp).toDateString()}</p>
                            </div>
                          </div>
                        ))}
                        {targetUser.activityLog.filter(l => l.category === 'reader').length > limits.activity && (
                          <ViewMoreButton onClick={() => handleViewMore('activity')} theme={theme} />
                        )}
                      </>
                    ) : (
                      <p className="text-center py-20 opacity-20 uppercase   font-semibold tracking-widest text-xs">No public activity history</p>
                    )}
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          <div className={`${theme.card} rounded-3xl p-8 text-center`}>
            <ShieldCheck size={32} className={`mx-auto mb-4 ${theme.text}`} />
            <h4 className="text-xs   font-semibold uppercase tracking-widest mb-2">Verified Member</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-6 px-4">
              Registered since {targetUser ? new Date(targetUser.createdAt).getFullYear() : '2026'}.
            </p>
            <div className="flex flex-col gap-2">
              <SidebarLink icon={<Globe size={14}/>} label="Location" value={targetUser?.location || "Global"} />
              <SidebarLink icon={<Trophy size={14}/>} label="Account Type" value={targetUser?.role} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ViewMoreButton = ({ onClick, theme }) => (
  <button onClick={onClick} className={`w-full py-4 rounded-2xl border ${theme.dynamicBorder} bg-[var(--text-main)]/[0.02] hover:bg-[var(--text-main)]/[0.04] text-[10px]   font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}>
    <ChevronDown size={14} className={theme.text} /> View More
  </button>
);

const UserCard = ({ targetUser, theme, onNavigate }) => {
  const isVip = targetUser?.vipStatus?.isVip || false;

  return (
    <div onClick={onNavigate} className={`p-6 rounded-[2.5rem] border ${isVip ? 'border-amber-500/20 shadow-amber-500/5' : theme.dynamicBorder} bg-[var(--text-main)]/[0.02] flex flex-col items-center text-center group hover:bg-[var(--text-main)]/[0.04] transition-all cursor-pointer relative overflow-hidden shadow-lg`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${isVip ? 'bg-amber-500/5' : (theme.primary + ' opacity-[0.03]')} blur-3xl`} />
      
      <div className="relative mb-4 shrink-0">
        {isVip ? (
          /* VIP CIRCULAR BORDER */
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
          /* STANDARD BORDER */
          <>
            <img 
              src={targetUser.profilePicture || '/default.png'} 
              className={`w-20 h-20 rounded-full border-4 ${theme.accentBorder} object-cover transition-transform group-hover:scale-110`} 
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
        <p className={`text-sm   font-semibold uppercase tracking-tight truncate w-full ${isVip ? 'text-amber-600' : ''}`}>
          {targetUser.username}
        </p>
        <span className={`text-[8px] px-2 py-0.5 rounded-full border ${theme.dynamicBorder}  font-semibold uppercase opacity-60 tracking-widest bg-[var(--text-main)]/5 mt-1 inline-block`}>
          {isVip ? 'VIP Reader' : (targetUser.role || 'Member')}
        </span>
        <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 italic mt-3 h-8 leading-relaxed">
          {targetUser.bio || "No biography available."}
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, theme }) => (
  <div className={`${theme.card} p-6 rounded-3xl flex flex-col items-center text-center group hover:border-${theme.text}/30 transition-all`}>
    <div className={`p-3 rounded-2xl bg-[var(--text-main)]/[0.03] mb-3 ${theme.text} group-hover:scale-110 transition-transform`}>{icon}</div>
    <p className="text-[10px]   font-semibold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
    <p className="text-xl   font-semibold mt-1 uppercase italic tracking-tighter">{value}</p>
  </div>
);

const SidebarLink = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--text-main)]/[0.02] border border-transparent hover:border-[var(--text-main)]/5">
    <div className="flex items-center gap-3 text-[var(--text-muted)]">
      {icon}
      <span className="text-[10px]   font-semibold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[10px]   font-semibold uppercase text-[var(--text-main)]">{value}</span>
  </div>
);

export default VisitorProfile;