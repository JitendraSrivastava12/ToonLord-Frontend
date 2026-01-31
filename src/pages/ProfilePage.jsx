import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, ShieldCheck, MapPin, Phone, Globe, History, Check, Loader2, User, Fingerprint, Cpu, Zap
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from "../UserContext";

const ProfilePage = () => {
  const { isRedMode, currentTheme, user, setUser } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef(null);

  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';

  const [form, setForm] = useState({
    username: '', bio: '', location: '', mobile: '', preview: '', file: null   
  });

  // Fetch latest user on mount
  useEffect(() => {
    const fetchLatestUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setFetching(false); return; }
      try {
        const res = await axios.get('http://localhost:5000/api/users/getMe', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user)); 
        }
      } catch (err) { console.error("Identity sync failed", err); } 
      finally { setFetching(false); }
    };
    fetchLatestUser();
  }, [setUser]);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '', bio: user.bio || '',
        location: user.location || '', mobile: user.mobile || '',
        preview: user.profilePicture || '', file: null
      });
    }
  }, [user]);

  const syncDatabase = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.keys(form).forEach(key => { 
        if(form[key] && key !== 'preview') data.append(key, form[key]); 
    });
    if (form.file) data.append('profilePicture', form.file);

    try {
      const res = await axios.patch('http://localhost:5000/api/users/update-profile', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) { alert(err.response?.data?.message || "Protocol Failure"); } 
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] gap-4 p-4">
      <Loader2 className={`animate-spin ${accentText}`} size={36} />
      <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[var(--text-dim)] animate-pulse">Establishing Identity Link</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-3 sm:px-6 lg:px-12 py-30 transition-all duration-700 theme-${currentTheme} `}>
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-[0.05]" style={{ backgroundColor: isRedMode ? '#ef4444' : 'var(--accent)' }} />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        {/* Left panel */}
        <aside className="lg:col-span-4 space-y-4 sm:space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-[2rem] bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)] relative group overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className={`w-32 sm:w-36 h-32 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[var(--accent)] via-transparent to-[var(--accent)] animate-spin-slow opacity-50 absolute inset-0 blur-md`} />
                <div className="relative w-32 sm:w-36 h-32 sm:h-36 rounded-full p-1 bg-[var(--bg-primary)] border border-[var(--border)] shadow-2xl">
                  <img src={form.preview || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" alt="Operative" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 p-2 sm:p-3 bg-white text-black rounded-xl shadow-lg hover:scale-110 transition-all border-2 border-[var(--bg-primary)]">
                    <Camera size={18} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setForm({ ...form, file, preview: URL.createObjectURL(file) });
                  }} />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase italic leading-none mb-2 sm:mb-3">{user?.username || "OPERATIVE_ID"}</h2>
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">
                <ShieldCheck size={12} className={accentText} /> Access Level: {user?.role || "Restricted"}
              </div>

              <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 mt-6 sm:mt-8">
                <StatNode val={user?.points || 0} label="Protocol Credits" />
                <StatNode val="#12" label="Nexus Rank" />
              </div>

              <button onClick={() => setIsEditing(!isEditing)} className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 rounded-[1.5rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.25em] transition-all active:scale-95 ${isEditing ? 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)]' : 'bg-white text-black hover:bg-zinc-200 shadow-lg'}`}>
                {isEditing ? "Terminate Sync" : "Initialize Identity Edit"}
              </button>
            </div>
          </motion.div>

          {/* Contact */}
          <div className="p-4 sm:p-6 rounded-[1.5rem] bg-[var(--bg-secondary)]/20 border border-[var(--border)] space-y-4 sm:space-y-6 shadow-inner">
             <div className="flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1 sm:mb-2">Contact Uplinks</div>
             <ContactLine icon={<MapPin size={16}/>} text={user?.location || "Sector Unknown"} />
             <ContactLine icon={<Phone size={16}/>} text={user?.mobile || "Encrypted Line"} />
             <ContactLine icon={<Globe size={16}/>} text="Sync_Lang: EN/JP" />
          </div>
        </aside>

        {/* Right panel */}
        <main className="lg:col-span-8 space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="editor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} 
                className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)] space-y-6 sm:space-y-8 shadow-[var(--shadow-aesthetic)]">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Fingerprint className={accentText} size={28} />
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Registry Override</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <InputField label="Public ID" value={form.username} onChange={v => setForm({...form, username: v})} />
                  <InputField label="Deployment Sector" value={form.location} onChange={v => setForm({...form, location: v})} />
                  <div className="md:col-span-2">
                    <InputField label="Secure Comm ID" value={form.mobile} onChange={v => setForm({...form, mobile: v})} />
                  </div>
                  <div className="md:col-span-2 space-y-2 sm:space-y-3">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase text-[var(--text-dim)] tracking-[0.3em] ml-2">Operative Dossier Metadata</p>
                    <textarea rows="4" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} 
                      className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-sm font-bold text-[var(--text-main)] outline-none resize-none focus:border-[var(--accent)]/50 transition-all shadow-inner" />
                  </div>
                </div>

                <button onClick={syncDatabase} disabled={loading} 
                  className={`w-full py-3 sm:py-4 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 ${accentBg} text-white shadow-xl`}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  {loading ? "COMMITTING DATA..." : "SYNCHRONIZE IDENTITY"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                <div className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-[var(--bg-secondary)]/30 backdrop-blur-xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)] relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--accent)] opacity-20 group-hover:animate-scan" />
                   <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-5 text-[var(--text-main)]"><User size={100} className="sm:text-[120px]" /></div>
                   <h3 className="text-[9px] sm:text-[10px] font-black uppercase text-[var(--text-dim)] mb-2 sm:mb-4 tracking-[0.4em] opacity-50 flex items-center gap-2"><Cpu size={12}/> Operative Dossier</h3>
                   <p className="text-xl sm:text-2xl font-medium text-[var(--text-main)] leading-relaxed italic tracking-tight relative z-10">
                     {user?.bio ? `"${user.bio}"` : "This operative's background remains classified within the central mainframe."}
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <BentoStat val="1.2K" label="Registry Accesses" icon={<History size={40}/>} />
                  <BentoStat val={user?.points || 0} label="Network Credits" icon={<Zap size={40}/>} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* Subcomponents with smaller sizing */
const StatNode = ({ val, label }) => (
  <div className="p-3 sm:p-4 rounded-[1.5rem] bg-[var(--bg-primary)] border border-[var(--border)] shadow-inner">
    <p className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight italic">{val}</p>
    <p className="text-[7px] sm:text-[8px] uppercase font-black text-[var(--text-dim)] mt-1 sm:mt-2 tracking-[0.2em]">{label}</p>
  </div>
);

const ContactLine = ({ icon, text }) => (
  <div className="flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] group cursor-default hover:text-[var(--text-main)]">
    <div className="p-2 sm:p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 transition-all shadow-md">{icon}</div>
    <span>{text}</span>
  </div>
);

const InputField = ({ label, value, onChange }) => (
  <div className="space-y-2 sm:space-y-3">
    <label className="text-[8px] sm:text-[9px] font-black uppercase text-[var(--text-dim)] tracking-[0.3em] ml-2 sm:ml-3">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} 
      className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-[1.5rem] p-3 sm:p-4 text-sm font-bold text-[var(--text-main)] outline-none focus:border-[var(--accent)]/50 transition-all shadow-inner" />
  </div>
);

const BentoStat = ({ val, label, icon }) => (
  <div className="p-6 sm:p-8 rounded-[2rem] bg-[var(--bg-secondary)]/20 border border-[var(--border)] flex items-center justify-between shadow-[var(--shadow-aesthetic)] group hover:bg-[var(--bg-secondary)]/40 transition-all">
    <div className="space-y-1 sm:space-y-2">
      <p className="text-3xl sm:text-4xl font-black text-[var(--text-main)] tracking-tight italic">{val}</p>
      <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.25em] opacity-60">{label}</p>
    </div>
    <div className="text-[var(--text-dim)] opacity-5 group-hover:opacity-20 scale-125 sm:scale-150 group-hover:rotate-[15deg] group-hover:scale-[1.6]">{icon}</div>
  </div>
);

export default ProfilePage;
