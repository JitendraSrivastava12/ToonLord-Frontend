import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, ShieldCheck, MapPin, Phone, Globe, History, Check, Loader2, User, 
  Fingerprint, Cpu, Zap, Activity, ChevronRight, Clock, BookOpen, Heart
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from "../UserContext";

const ProfilePage = () => {
  const { isRedMode, currentTheme, user, setUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dossier'); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Author Request States
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [signature, setSignature] = useState('');
  
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';

  const [form, setForm] = useState({
    username: '', bio: '', location: '', mobile: '', preview: '', file: null   
  });

  // 1. Initial User Identity Sync
  useEffect(() => {
    const fetchLatestUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setFetching(false); return; }
      try {
        const res = await axios.get(`${API_URL}/api/users/getMe`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user)); 
        }
      } catch (err) {
        console.error("Identity sync failed", err);
      } finally {
        setFetching(false);
      }
    };
    fetchLatestUser();
  }, [setUser, API_URL]);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '', bio: user.bio || '',
        location: user.location || '', mobile: user.mobile || '',
        preview: user.profilePicture || '', file: null
      });
    }
  }, [user]);

  // 2. Profile Update Logic
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
      const res = await axios.patch(`${API_URL}/api/users/update-profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Sync Error.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Author Partnership Execution
  const handleRequestAuthor = async () => {
    if (signature.trim().toLowerCase() !== 'i accept') {
      alert("Please type 'I ACCEPT' to bind the agreement.");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/users/request-author`, 
        { confirmationText: signature },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (res.data.success) {
        setUser({ ...user, authorRequestPending: true });
        setIsContractOpen(false);
        alert("Partnership application transmitted successfully.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Transmission failure.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      <div className={`w-12 h-12 border-2 border-t-transparent rounded-full animate-spin ${isRedMode ? 'border-red-500' : 'border-[var(--accent)]'}`} />
    </div>
  );

  const filteredLogs = user?.activityLog?.filter(log => 
    log.category === 'reader' || log.category === 'system'
  ) || [];

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-12 py-12 transition-all duration-500`}>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR: USER IDENTITY */}
        <aside className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm backdrop-blur-md"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-8 group">
                <div className="w-36 h-36 rounded-full border-2 border-[var(--border)] p-1.5 transition-all group-hover:border-[var(--accent)]">
                  <img src={form.preview || '/default-avatar.png'} className="w-full h-full object-cover rounded-full" alt="User" />
                  <button onClick={() => fileInputRef.current?.click()} className={`absolute bottom-1 right-1 p-2.5 ${accentBg} text-white rounded-full border-4 border-[var(--bg-primary)] hover:scale-110 transition-transform`}>
                    <Camera size={18} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setForm({ ...form, file, preview: URL.createObjectURL(file) });
                  }} />
                </div>
              </div>

              <h2 className="text-3xl font-bold tracking-tight mb-1 font-mono uppercase">{user?.username}</h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-8">
                <ShieldCheck size={14} className={accentText} /> {user?.role || "OPERATIVE"}
              </div>

              <div className="w-full space-y-3">
                {user?.role === 'reader' && (
                  <button 
                    onClick={() => setIsContractOpen(true)}
                    disabled={user?.authorRequestPending}
                    className={`w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg
                      ${user?.authorRequestPending 
                        ? 'bg-[var(--border)] text-[var(--text-dim)] cursor-not-allowed opacity-60' 
                        : `${accentBg} text-white hover:brightness-110 active:scale-95`}`}
                  >
                    {user?.authorRequestPending ? <><Clock size={14} /> Pending Verification</> : <><Zap size={14} /> Creator Partnership</>}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <StatCard val={user?.points || 0} label="Network Credits" />
                  <StatCard val="N/A" label="Global Rank" />
                </div>

                <button onClick={() => setIsEditing(!isEditing)}
                  className={`w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 
                  ${isEditing ? 'border-red-500 text-red-500 bg-red-500/5' : 'bg-[var(--text-main)] text-[var(--bg-primary)] hover:invert'}`}
                >
                  {isEditing ? "Discard Changes" : "Modify Identity"}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)]/50 border border-[var(--border)] space-y-5">
            <ContactLine icon={<MapPin size={18}/>} text={user?.location || "Sector Unknown"} />
            <ContactLine icon={<Phone size={18}/>} text={user?.mobile || "Secure Line Missing"} />
            <ContactLine icon={<Globe size={18}/>} text="Standard Comms: EN" />
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-8 space-y-6">
          {!isEditing && (
            <div className="flex gap-10 border-b border-[var(--border)] px-4">
              {['dossier', 'activity'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative
                  ${activeTab === tab ? accentText : 'opacity-30 hover:opacity-100'}`}
                >
                  {tab}
                  {activeTab === tab && ( <motion.div layoutId="profile-tab" className={`absolute bottom-0 left-0 right-0 h-0.5 ${accentBg}`} /> )}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                className="p-10 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border)] space-y-8"
              >
                <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
                  <Fingerprint className={accentText} size={28} />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Identity Encryption</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="Identity Alias" value={form.username} onChange={v => setForm({...form, username: v})} />
                  <InputField label="Deployment Sector" value={form.location} onChange={v => setForm({...form, location: v})} />
                  <div className="md:col-span-2"> 
                    <InputField label="Communication Link" value={form.mobile} onChange={v => setForm({...form, mobile: v})} /> 
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Personal Dossier</label>
                    <textarea rows="4" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} 
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-6 text-sm font-medium focus:border-[var(--accent)] outline-none shadow-inner" />
                  </div>
                </div>
                <button onClick={syncDatabase} disabled={loading} className={`w-full py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-4 ${accentBg} text-white shadow-xl hover:brightness-110`}>
                  {loading ? <Loader2 className="animate-spin" /> : <Check />}
                  {loading ? "Synchronizing..." : "Commit Changes"}
                </button>
              </motion.div>
            ) : activeTab === 'dossier' ? (
              <motion.div key="dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-10 rounded-[3rem] bg-[var(--bg-secondary)] border border-[var(--border)] group transition-all hover:bg-[var(--bg-secondary)]/80">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 flex items-center gap-2">
                    <Cpu size={14}/> Dossier Background
                  </h3>
                  <p className="text-2xl font-medium leading-relaxed italic opacity-90">
                    {user?.bio ? `"${user.bio}"` : "History purged or not yet established."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BentoStat val="0" label="Titles Archived" icon={<BookOpen />} />
                  <BentoStat val={user?.points || 0} label="Network Power" icon={<Zap />} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, i) => <ActivityNode key={i} log={log} accentText={accentText} />)
                ) : (
                  <div className="py-24 text-center opacity-20 border-2 border-dashed border-[var(--border)] rounded-[3rem]">
                    <Activity size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Logged Protocols</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* CREATOR PARTNERSHIP MODAL (PROFESSIONAL LEGAL LAYOUT) */}
      <AnimatePresence>
        {isContractOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsContractOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="relative w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className={`h-2 w-full ${accentBg}`} />
              
              <div className="p-8 md:p-14">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Creator Partnership Agreement</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Official Protocol v2.4</p>
                  </div>
                  <BookOpen className={`${accentText} opacity-40`} size={32} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-12">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-tighter text-blue-500">I. Fiscal Distribution</h4>
                    <p className="text-xs leading-relaxed opacity-70">
                      The Creator is entitled to <span className="text-[var(--text-main)] font-bold">70% of Net Revenue</span> generated from standard digital assets. Disbursements are processed via the network gateway on a monthly cycle.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-tighter text-blue-500">II. Premium Tier Protocol</h4>
                    <p className="text-xs leading-relaxed opacity-70">
                      Premium status is <span className="text-[var(--text-main)] font-bold">Series-Specific</span>. After initial approval, Creators may request premium tier status for individual works. Admin will review metrics to provide a custom pricing contract.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-tighter text-blue-500">III. Intellectual Property</h4>
                    <p className="text-xs leading-relaxed opacity-70">
                      Creators retain <span className="text-[var(--text-main)] font-bold">100% Ownership</span> of original IP. By executing this agreement, you grant the platform a non-exclusive license to host and promote the assets.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-tighter text-blue-500">IV. Compliance</h4>
                    <p className="text-xs leading-relaxed opacity-70">
                      Assets must be original. Plagiarism or fraudulent engagement will result in <span className="text-red-500 font-bold">immediate termination</span> of the partnership and permanent account restriction.
                    </p>
                  </div>
                </div>

                <div className="pt-10 border-t border-[var(--border)]">
                  <div className="max-w-sm mx-auto space-y-6">
                    <div className="text-center space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Digital Signature</label>
                      <input 
                        type="text" value={signature} onChange={(e) => setSignature(e.target.value)}
                        placeholder="TYPE 'I ACCEPT'"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-5 text-center font-mono text-xs tracking-widest focus:border-[var(--accent)] outline-none transition-all uppercase"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setIsContractOpen(false)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Decline</button>
                      <button 
                        onClick={handleRequestAuthor}
                        disabled={loading || signature.toLowerCase() !== 'i accept'}
                        className={`flex-[2] py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all
                          ${signature.toLowerCase() === 'i accept' ? `${accentBg} text-white shadow-xl hover:scale-[1.02]` : 'bg-[var(--border)] text-[var(--text-dim)] cursor-not-allowed'}`}
                      >
                        {loading ? "Processing..." : "Execute Agreement"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const StatCard = ({ val, label }) => (
  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] shadow-inner">
    <p className="text-2xl font-bold font-mono tracking-tighter">{val}</p>
    <p className="text-[8px] uppercase font-black tracking-widest opacity-40 mt-1">{label}</p>
  </div>
);

const BentoStat = ({ val, label, icon }) => (
  <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between group hover:border-[var(--text-dim)] transition-all">
    <div>
      <p className="text-4xl font-black italic font-mono tracking-tighter">{val}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">{label}</p>
    </div>
    <div className="opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all">{icon}</div>
  </div>
);

const ContactLine = ({ icon, text }) => (
  <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-default">
    <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">{icon}</div>
    <span className="truncate font-mono">{text}</span>
  </div>
);

const InputField = ({ label, value, onChange }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-40">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} 
      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-4 text-sm font-medium focus:border-[var(--accent)] outline-none transition-all shadow-inner" />
  </div>
);

const ActivityNode = ({ log, accentText }) => (
  <div className="flex items-center gap-6 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] group hover:bg-[var(--bg-secondary)]/80 transition-all">
    <div className={`p-4 rounded-xl bg-[var(--bg-primary)] ${accentText} shadow-inner`}>
      {log.category === 'system' ? <ShieldCheck size={18} /> : <Activity size={18} />}
    </div>
    <div className="flex-1">
      <p className="text-xs font-black tracking-tight">{log.description}</p>
      <div className="flex items-center gap-3 mt-2 opacity-30 font-mono text-[9px]">
        <Clock size={10} />
        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
    <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
  </div>
);

export default ProfilePage;