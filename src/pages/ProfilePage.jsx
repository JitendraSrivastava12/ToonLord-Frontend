import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldCheck, History, Loader2, Activity, ChevronRight, Clock, BookOpen, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { AppContext } from "../UserContext";

const ProfilePage = () => {
  const { isRedMode, user, setUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dossier'); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';

  const [form, setForm] = useState({
    username: '', bio: '', location: '', mobile: '', preview: '', file: null   
  });

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
      } catch (err) { console.error(err); } 
      finally { setFetching(false); }
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

  const syncDatabase = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('username', form.username);
    data.append('bio', form.bio);
    data.append('location', form.location);
    if (form.file) data.append('profilePicture', form.file);

    try {
      const res = await axios.patch(`${API_URL}/api/users/update-profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      alert("Sync Error.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <Loader2 className={`animate-spin ${accentText}`} size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-12 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: IDENTITY */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-1 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border)] overflow-hidden">
            <div className="bg-[var(--bg-primary)] rounded-[2.8rem] p-8 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-secondary)] overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                  <img src={form.preview || '/default-avatar.png'} className="w-full h-full object-cover" alt="User" />
                </div>
                <button onClick={() => fileInputRef.current?.click()} className={`absolute bottom-0 right-0 p-2.5 ${accentBg} text-white rounded-full border-4 border-[var(--bg-primary)]`}>
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setForm({...form, file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">{user?.username}</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                <ShieldCheck size={12} /> {user?.role}
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="w-full py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--border)] transition-all">
                {isEditing ? "Cancel Link" : "Edit Profile"}
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT: CONTENT */}
        <main className="lg:col-span-8 space-y-6">
          <div className="flex gap-8 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
            {['dossier', 'activity'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative ${activeTab === tab ? accentText : 'opacity-30'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="tab-line" className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-full ${accentBg}`} />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border)]"
              >
                <InputField label="Alias" value={form.username} onChange={v => setForm({...form, username: v})} />
                <InputField label="Location" value={form.location} onChange={v => setForm({...form, location: v})} />
                <div className="md:col-span-2">
                  <InputField label="Bio" value={form.bio} onChange={v => setForm({...form, bio: v})} isTextArea />
                </div>
                <button onClick={syncDatabase} className={`md:col-span-2 py-4 rounded-xl ${accentBg} text-white font-bold uppercase text-[10px] tracking-widest`}>
                  {loading ? <Loader2 className="animate-spin mx-auto"/> : "Save Identity"}
                </button>
              </motion.div>
            ) : activeTab === 'activity' ? (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {user?.activityLog?.length > 0 ? user.activityLog.map((log, i) => (
                  <ActivityNode key={i} log={log} accentText={accentText} />
                )) : (
                  <div className="py-20 text-center border-2 border-dashed border-[var(--border)] rounded-[2.5rem] opacity-20">
                    <Activity size={40} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">System Log Empty</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-10 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] rounded-[3rem] border border-[var(--border)]">
                  <p className="text-2xl font-medium italic opacity-80 leading-relaxed">
                    {user?.bio || "Identity background currently encrypted."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatBlock label="Archived Chapters" value={user?.stats?.totalChaptersRead} icon={<BookOpen size={20}/>} />
                  <StatBlock label="Account Age" value={new Date(user?.createdAt).toLocaleDateString()} icon={<Clock size={20}/>} isDate />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* HELPER COMPONENTS */
const ActivityNode = ({ log, accentText }) => (
  <div className="flex items-center justify-between p-6 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border)] group hover:border-[var(--text-dim)] transition-all">
    <div className="flex items-center gap-5">
      <div className={`p-4 rounded-2xl bg-[var(--bg-primary)] ${accentText} shadow-inner`}><Activity size={20} /></div>
      <div>
        <p className="text-sm font-bold uppercase tracking-tight">{log.description}</p>
        <p className="flex items-center gap-2 mt-1.5 opacity-30 font-mono text-[9px]"><Clock size={10} /> {new Date(log.timestamp).toLocaleString()}</p>
      </div>
    </div>
    <span className="text-[8px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-black uppercase">{log.category}</span>
  </div>
);

const StatBlock = ({ label, value, icon, isDate }) => (
  <div className="p-8 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border)] flex justify-between items-end">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">{label}</p>
      <p className={`${isDate ? 'text-lg' : 'text-4xl'} font-black font-mono tracking-tighter`}>{value || 0}</p>
    </div>
    <div className="p-4 bg-[var(--bg-primary)] rounded-2xl opacity-20">{icon}</div>
  </div>
);

const InputField = ({ label, value, onChange, isTextArea }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">{label}</label>
    {isTextArea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-4 text-sm focus:border-[var(--accent)] outline-none" />
    ) : (
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-4 text-sm focus:border-[var(--accent)] outline-none" />
    )}
  </div>
);

export default ProfilePage;