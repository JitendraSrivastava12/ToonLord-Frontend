import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Trophy, Zap, Heart, ShieldCheck, 
  MapPin, Phone, Globe, History, Check, X, Loader2
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from "../UserContext";

const ProfilePage = () => {
  const { isRedMode, points, user, setUser } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef(null);

  // Dynamic Theme Mapping
  const theme = {
    primary: isRedMode ? 'from-red-600 to-rose-900' : 'from-emerald-400 to-cyan-600',
    border: isRedMode ? 'border-red-500/30' : 'border-emerald-500/30',
    text: isRedMode ? 'text-red-400' : 'text-emerald-400'
  };

  const [form, setForm] = useState({
    username: '',
    bio: '',
    location: '',
    mobile: '',
    preview: '', 
    file: null   
  });

  // 1. FETCH FRESH DATA FROM DB ON MOUNT
  useEffect(() => {
    const fetchLatestUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setFetching(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/users/getMe', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setUser(res.data.user); 
          console.log("Fetched latest user data:", res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user)); 
        }
      } catch (err) {
        console.error("Initial fetch failed:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchLatestUser();
  }, [setUser]); 

  // 2. Sync local form state whenever the global user context updates
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        mobile: user.mobile || '',
        preview: user.profilePicture || '', 
        file: null
      });
    }
  }, [user]);

  // Handle local image selection
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ 
        ...form, 
        file: file, 
        preview: URL.createObjectURL(file) 
      });
    }
  };

  // Sync all data to Backend via FormData
  const syncDatabase = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const data = new FormData();
    data.append('username', form.username);
    data.append('bio', form.bio);
    data.append('location', form.location);
    data.append('mobile', form.mobile);
    
    if (form.file) {
      data.append('profilePicture', form.file);
    }

    try {
      const res = await axios.patch('http://localhost:5000/api/users/update-profile', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      if (res.data.success) {
        setUser(res.data.user); // Update Global Context
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Sync Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Sync Interrupted");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[#05060b]">
      <Loader2 className={`animate-spin ${isRedMode ? 'text-red-500' : 'text-emerald-500'}`} size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-300 p-4 lg:p-12 font-sans selection:bg-white/20">
      
      {/* GLOWING AMBIENCE */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${theme.primary}`} />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className={`relative p-8 rounded-[2.5rem] bg-white/[0.02] border ${theme.border} backdrop-blur-3xl overflow-hidden`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr ${theme.primary} shadow-2xl`}>
                  <img 
                    src={form.preview || 'https://via.placeholder.com/150'} 
                    className="w-full h-full object-cover rounded-full border-4 border-[#05060b]" 
                    alt="Avatar" 
                  />
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-3 bg-white text-black rounded-2xl shadow-xl hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
              </div>

              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{user?.username || "Guest"}</h2>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={14} className={theme.text} /> ToonLord Elite
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xl font-black text-white">{user?.points || 0}</p>
                  <p className="text-[9px] uppercase font-bold text-slate-500">Points</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xl font-black text-white">#12</p>
                  <p className="text-[9px] uppercase font-bold text-slate-500">Rank</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full mt-6 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                {isEditing ? "Discard Changes" : "Edit Profile"}
              </button>
            </div>
          </motion.div>

          {/* CONTACT INFO CARD */}
          <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl space-y-4">
             <div className="flex items-center gap-4 text-sm font-bold"><MapPin size={18} className={theme.text}/> {user?.location || "Unknown"}</div>
             <div className="flex items-center gap-4 text-sm font-bold"><Phone size={18} className={theme.text}/> {user?.mobile || "No Number"}</div>
             <div className="flex items-center gap-4 text-sm font-bold"><Globe size={18} className={theme.text}/> English / Japanese</div>
          </div>
        </div>

        {/* RIGHT COLUMN: BENTO CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Username</label>
                    <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Location</label>
                    <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Mobile Number</label>
                    <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Dossier (Bio)</label>
                  <textarea rows="4" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none resize-none focus:border-white/30 transition-all" />
                </div>
                <button 
                  onClick={syncDatabase} disabled={loading}
                  className={`w-full py-5 rounded-[1.5rem] bg-gradient-to-r ${theme.primary} text-black font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50`}
                >
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Syncing...</> : <><Check size={18} /> Update Database</>}
                </button>
              </motion.div>
            ) : (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BIO BOX */}
                <div className="md:col-span-2 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-md">
                   <h3 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Dossier</h3>
                   <p className="text-xl font-medium text-slate-300 leading-relaxed italic">
                     {user?.bio ? `"${user.bio}"` : "This operative has not submitted a dossier."}
                   </p>
                </div>

                {/* STAT CARDS */}
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                  <div>
                    <p className="text-4xl font-black text-white">1.2K</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Chapters Read</p>
                  </div>
                  <History size={40} className="opacity-10 group-hover:opacity-30 transition-opacity" />
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                  <div>
                    <p className="text-4xl font-black text-white">84</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Badges Earned</p>
                  </div>
                  <Trophy size={40} className="opacity-10 group-hover:opacity-30 transition-opacity" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;