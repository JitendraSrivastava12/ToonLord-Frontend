import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Upload, X, Tag, Plus, BookOpen, ArrowLeft, RefreshCw, Loader2, ShieldAlert 
} from "lucide-react";
import axios from 'axios';
import { useAlert } from "../context/AlertContext";
import { AppContext } from "../UserContext";
const API_URL = import.meta.env.VITE_API_URL;
const CreateSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { isRedMode, currentTheme } = useContext(AppContext);
  const fileInputRef = useRef(null);
  
  const isEditMode = Boolean(id);
  
  // Theme Aware Logic
  const accentColor = isRedMode ? '#ef4444' : 'var(--accent)';
  const glowClass = isRedMode ? 'shadow-red-500/20' : 'shadow-[var(--accent-glow)]';

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAdult, setIsAdult] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    artist: "",
    synopsis: ""
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchSeriesData = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/mangas/${id}`);
          const data = res.data;
          setFormData({
            title: data.title,
            author: data.author || "",
            artist: data.artist || "",
            synopsis: data.description
          });
          setTags(data.tags || []);
          setPreview(data.coverImage);
          setIsAdult(data.isAdult || false);
        } catch (err) {
          showAlert("Database Handshake Failed", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchSeriesData();
    } else {
        setIsAdult(isRedMode);
    }
  }, [id, isEditMode, isRedMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showAlert("File exceeds 5MB limit", "error");
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      showAlert("Visual Cache Updated", "success");
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('artist', formData.artist);
    data.append('description', formData.synopsis);
    data.append('isAdult', isAdult);
    data.append('tags', JSON.stringify(tags));
    
    if (imageFile) data.append('coverImage', imageFile);

    try {
      const url = isEditMode 
        ? `${API_URL}/api/users/my-mangas/update/${id}` 
        : `${API_URL}/api/mangas`;
      
      const method = isEditMode ? 'put' : 'post';

      await axios[method](url, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      showAlert(`Series ${isEditMode ? 'Synced' : 'Deployed'} Successfully`, "success");
      setTimeout(() => navigate("/my-series"), 1500);
    } catch (err) {
      showAlert("Protocol Interrupted", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <RefreshCw className="animate-spin text-[var(--accent)]" size={48} />
      <p className="text-[10px]  font-bold   tracking-[0.5em] text-[var(--text-dim)] animate-pulse">Establishing Secure Uplink</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-all duration-700 theme-${currentTheme} py-4`}>
      
      {/* BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full blur-[160px] opacity-[0.08]" style={{ backgroundColor: accentColor }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 lg:p-12 pb-32">
        
        {/* HEADER */}
        <header className="flex items-center gap-8 mb-6">
           <button onClick={() => navigate(-1)} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2rem] hover:border-[var(--accent)]/50 transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           </button>
           <div className="space-y-2">
              <h1 className="text-4xl  font-bold   tracking-tighter    leading-none">
                {isEditMode ? "Sync" : "Deploy"} <span style={{ color: accentColor }}>Series</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-[var(--accent)]" />
                <p className="text-[var(--text-dim)] text-[10px]  font-bold   tracking-[0.4em]">
                  {isEditMode ? `OBJECT_ID: ${id}` : "INIT_SEQUENCE: CREATOR_UPLINK"}
                </p>
              </div>
           </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: VISUAL DATA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className={`group relative aspect-[3/4] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[3rem] overflow-hidden hover:border-[var(--accent)]/40 transition-all duration-500 shadow-2xl ${glowClass}`}>
              {preview ? (
                <>
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="p-4 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-all">
                        <X size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer h-full flex flex-col items-center justify-center p-12 text-center group">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                  <div className="p-8 bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--border)] mb-6 transition-all group-hover:border-[var(--accent)]/50 group-hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]">
                    <Upload size={40} style={{ color: accentColor }} />
                  </div>
                  <span className="text-[10px]  font-bold   tracking-[0.3em] text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors">Inject Cover Data</span>
                </label>
              )}
            </div>

            {/* ADULT TOGGLE: Glass Card */}
            <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)]/50 backdrop-blur-3xl border border-[var(--border)] flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl bg-[var(--bg-primary)] ${isAdult ? 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-[var(--text-dim)]'}`}>
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <p className="text-[11px]  font-bold   text-[var(--text-main)] tracking-widest">Adult Protocol</p>
                    <p className="text-[9px] text-[var(--text-dim)]   font-bold tracking-tighter mt-1">{isAdult ? "Restricted 18+" : "Unrestricted Access"}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAdult(!isAdult)}
                  className={`w-14 h-7 rounded-full relative transition-all duration-500 ${isAdult ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-[var(--bg-primary)] border border-[var(--border)]'}`}
                >
                  <motion.div 
                    animate={{ x: isAdult ? 28 : 4 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md" 
                  />
                </button>
            </div>
          </motion.div>

          {/* RIGHT: METADATA TERMINAL */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-10 p-10 lg:p-14 rounded-[3.5rem] bg-[var(--bg-secondary)]/40 backdrop-blur-3xl border border-[var(--border)] shadow-2xl"
          >
            
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-[var(--text-dim)] text-[11px]  font-bold   tracking-[0.4em]">
                <BookOpen size={16} style={{ color: accentColor }} /> Data Integrity
              </div>

              <div className="space-y-3">
                <label className="text-[10px]  font-bold text-[var(--text-dim)]   tracking-[0.2em] ml-2">Series Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-2xl px-8 py-5 text-sm font-bold focus:border-[var(--accent)] outline-none transition-all placeholder:opacity-20"
                  placeholder="INPUT_TITLE..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px]  font-bold text-[var(--text-dim)]   tracking-[0.2em] ml-2">Architect (Author)</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-2xl px-8 py-5 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all" placeholder="AUTHOR_NAME" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px]  font-bold text-[var(--text-dim)]   tracking-[0.2em] ml-2">Illustrator (Artist)</label>
                  <input type="text" value={formData.artist} onChange={(e) => setFormData({...formData, artist: e.target.value})} className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-2xl px-8 py-5 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all" placeholder="ARTIST_NAME" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px]  font-bold text-[var(--text-dim)]   tracking-[0.2em] ml-2">Story Dossier (Synopsis)</label>
                <textarea 
                  required
                  rows="5"
                  value={formData.synopsis}
                  onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                  className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-[2rem] px-8 py-6 text-sm font-bold leading-relaxed resize-none outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="TRANSMIT_DATA_HERE..."
                />
              </div>
            </div>

            {/* TAGS */}
            <div className="space-y-6 pt-10 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-[var(--text-dim)] text-[11px]  font-bold   tracking-[0.4em]">
                <Tag size={16} style={{ color: accentColor }} /> Sector Classification
              </div>
              <div className="flex gap-4">
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-2xl px-8 py-5 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="NEW_TAG..."
                />
                <button type="button" onClick={addTag} className="w-20 bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white rounded-2xl border border-[var(--accent)]/20 flex items-center justify-center transition-all shadow-lg">
                  <Plus size={28} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                  <motion.span 
                    layout
                    key={tag} 
                    className="flex items-center gap-3 pl-5 pr-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] text-[9px]  font-bold   tracking-widest rounded-xl hover:border-[var(--accent)] transition-colors"
                  >
                    {tag} <X size={14} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => setTags(tags.filter(t => t !== tag))} />
                  </motion.span>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className={`group w-full py-6 rounded-2xl  font-bold   tracking-[0.5em] text-[11px] shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98] ${glowClass}`}
              style={{ backgroundColor: accentColor, color: '#fff' }}
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <RocketIcon className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              {submitting ? "UPLOADING_PROTOCOL..." : isEditMode ? "COMMIT_SYNC" : "DEPLOY SERIES"}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

// Custom Aesthetic Icon for the button
const RocketIcon = ({ className }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.5-1 1-4c2 1 3 2 4 4Z" />
        <path d="M15 15v5s-1 .5-4 1c1-2 2-3 4-4Z" />
    </svg>
);

export default CreateSeries;