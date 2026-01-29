import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Upload, X, Tag, Plus, BookOpen, ArrowLeft, RefreshCw, Loader2, ShieldAlert 
} from "lucide-react";
import axios from 'axios';
import { useAlert } from "../context/AlertContext";
import { AppContext } from "../UserContext";

const CreateSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { isRedMode } = useContext(AppContext);
  const fileInputRef = useRef(null);
  
  const isEditMode = Boolean(id);
  const themeColor = isRedMode ? '#ef4444' : '#22c55e';
  const themeGlow = isRedMode ? 'shadow-red-500/20' : 'shadow-green-500/20';

  // --- STATE PROTOCOLS ---
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAdult, setIsAdult] = useState(false); // New Feature: Adult classification

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    artist: "",
    synopsis: ""
  });

  // --- DATA HYDRATION (FETCH REAL DATA) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchSeriesData = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/mangas/${id}`);
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
        // If creating new, default isAdult to match current site mode
        setIsAdult(isRedMode);
    }
  }, [id, isEditMode, isRedMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showAlert("File exceeds 5MB limit", "error");
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      showAlert("Cover Buffer Updated", "success");
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  // --- SUBMIT PROTOCOL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('artist', formData.artist);
    data.append('description', formData.synopsis);
    data.append('isAdult', isAdult); // Sending the adult classification
    data.append('tags', JSON.stringify(tags));
    
    if (imageFile) {
      data.append('coverImage', imageFile);
    }

    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/mangas/${id}` 
        : `http://localhost:5000/api/mangas`;
      
      const method = isEditMode ? 'put' : 'post';

      await axios[method](url, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      showAlert(`Series ${isEditMode ? 'Updated' : 'Created'} Successfully`, "success");
      setTimeout(() => navigate("/my-series"), 1500);
    } catch (err) {
      showAlert(err.response?.data?.message || "Protocol Interrupted", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05060b] flex flex-col items-center justify-center gap-4">
      <RefreshCw className="animate-spin" size={40} style={{ color: themeColor }} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Decrypting Series Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060b] text-zinc-100 relative overflow-hidden font-sans">
      
      {/* GLOW ACCENT */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-10" style={{ backgroundColor: themeColor }} />

      <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-12">
        
        {/* HEADER & BACK */}
        <div className="flex items-center gap-6 mb-12">
           <button onClick={() => navigate(-1)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           </button>
           <div className="space-y-1">
              <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                {isEditMode ? "Edit" : "Initialize"} <span style={{ color: themeColor }}>Series</span>
              </h1>
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em]">
                {isEditMode ? `UUID: ${id}` : "Protocol: Storyline Initialization"}
              </p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: VISUALS & SAFETY */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`group relative aspect-[3/4] bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl ${themeGlow}`}>
              {preview ? (
                <>
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                  <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full hover:bg-red-500 transition-all z-20">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer h-full flex flex-col items-center justify-center p-10 text-center">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-6" style={{ boxShadow: `0 0 40px -10px ${themeColor}20` }}>
                    <Upload size={32} style={{ color: themeColor }} />
                  </div>
                  <span className="block font-black text-xs uppercase tracking-widest text-zinc-300">Inject Cover Art</span>
                </label>
              )}
            </div>

            {/* ADULT CLASSIFICATION TOGGLE */}
            <div className={`p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center justify-between group hover:bg-white/[0.04] transition-all`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${isAdult ? 'text-red-500' : 'text-zinc-500'}`}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">Adult Content</p>
                    <p className="text-[8px] text-zinc-500 uppercase">Classify as 18+ Restricted</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAdult(!isAdult)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isAdult ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isAdult ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA TERMINAL */}
          <div className="lg:col-span-8 space-y-8 p-10 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl">
            
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <BookOpen size={16} style={{ color: themeColor }} /> Core Identification
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Series Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold focus:border-white/20 outline-none transition-all"
                  placeholder="Enter Title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Author</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold outline-none" placeholder="Primary Author" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Artist</label>
                  <input type="text" value={formData.artist} onChange={(e) => setFormData({...formData, artist: e.target.value})} className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold outline-none" placeholder="Illustrator" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Synopsis</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.synopsis}
                  onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                  className="w-full bg-[#0a0b10] border border-white/5 rounded-3xl px-8 py-6 text-sm font-bold leading-relaxed resize-none outline-none focus:border-white/10"
                  placeholder="Dossier details..."
                />
              </div>
            </section>

            {/* TAGS CLASSIFICATION */}
            <section className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <Tag size={16} style={{ color: themeColor }} /> Classification
              </div>
              <div className="flex gap-3">
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold outline-none"
                  placeholder="Add Tags (e.g. Action, Fantasy)..."
                />
                <button type="button" onClick={addTag} className="w-16 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center transition-all">
                  <Plus size={24} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase rounded-xl">
                    {tag} <X size={14} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => setTags(tags.filter(t => t !== tag))} />
                  </span>
                ))}
              </div>
            </section>

            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] ${themeGlow}`}
              style={{ backgroundColor: themeColor, color: '#000' }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
              {submitting ? "Uploading Protocol..." : isEditMode ? "Commit Synchronization" : "Deploy Series Protocol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSeries;