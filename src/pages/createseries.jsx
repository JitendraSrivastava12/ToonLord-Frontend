import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Upload, X, Info, Tag, Plus, CheckCircle, 
  Sparkles, BookOpen, User, PenTool, ArrowLeft, RefreshCw 
} from "lucide-react";
import { useAlert } from "../context/AlertContext";
import { AppContext } from "../UserContext";

const CreateSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { isRedMode } = useContext(AppContext);
  
  const isEditMode = Boolean(id);
  const themeColor = isRedMode ? '#ef4444' : '#22c55e';
  const themeGlow = isRedMode ? 'shadow-red-500/20' : 'shadow-green-500/20';

  // --- STATE PROTOCOLS ---
  const [loading, setLoading] = useState(isEditMode);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    artist: "",
    synopsis: ""
  });

  // --- DATA HYDRATION (FOR EDIT MODE) ---
  useEffect(() => {
    if (isEditMode) {
      // Simulate API Fetch
      showAlert("Initializing Synchronization...", "info");
      
      const timer = setTimeout(() => {
        // Mock data fetch - Replace with: axios.get(`/api/series/${id}`)
        setFormData({
          title: "Spirit Hunter X",
          author: "Jitendra S.",
          artist: "Studio Toon",
          synopsis: "The world has ended, but the hunt has just begun."
        });
        setTags(["Action", "Fantasy", "Seinen"]);
        setPreview("https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300");
        setLoading(false);
        showAlert("Data Synchronized", "success");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) return showAlert("File too large (Max 5MB)", "error");
    if (file) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = isEditMode ? "Update" : "Creation";
    showAlert(`${action} protocol successful!`, "success");
    setTimeout(() => navigate("/my-series"), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05060b] flex flex-col items-center justify-center gap-4">
      <RefreshCw className="animate-spin text-zinc-500" size={40} style={{ color: themeColor }} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Decrypting Series Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060b] text-zinc-100 relative overflow-hidden font-sans">
      
      {/* --- AMBIENT GLOW --- */}
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
          
          {/* LEFT: VISUALS */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`group relative aspect-[3/4] bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl ${themeGlow}`}>
              {preview ? (
                <>
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                  <button type="button" onClick={() => setPreview(null)} className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full hover:bg-red-500 transition-all z-20">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer h-full flex flex-col items-center justify-center p-10 text-center">
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-6" style={{ boxShadow: `0 0 40px -10px ${themeColor}20` }}>
                    <Upload size={32} style={{ color: themeColor }} />
                  </div>
                  <span className="block font-black text-xs uppercase tracking-widest text-zinc-300">Update Cover Art</span>
                </label>
              )}
            </div>
          </div>

          {/* RIGHT: DATA TERMINAL */}
          <div className="lg:col-span-8 space-y-8 p-10 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl">
            
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <BookOpen size={16} style={{ color: themeColor }} /> Core Identification
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Series Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold focus:border-white/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Author</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Artist</label>
                  <input type="text" value={formData.artist} onChange={(e) => setFormData({...formData, artist: e.target.value})} className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Synopsis</label>
                <textarea 
                  rows="4"
                  value={formData.synopsis}
                  onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                  className="w-full bg-[#0a0b10] border border-white/5 rounded-3xl px-8 py-6 text-sm font-bold leading-relaxed resize-none"
                />
              </div>
            </section>

            {/* TAGS */}
            <section className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <Tag size={16} style={{ color: themeColor }} /> Classification
              </div>
              <div className="flex gap-3">
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-[#0a0b10] border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold"
                  placeholder="Add Tags..."
                />
                <button type="button" onClick={addTag} className="w-16 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center">
                  <Plus size={24} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase rounded-xl">
                    {tag} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => setTags(tags.filter(t => t !== tag))} />
                  </span>
                ))}
              </div>
            </section>

            <button 
              type="submit" 
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all active:scale-[0.98] ${themeGlow}`}
              style={{ backgroundColor: themeColor, color: '#000' }}
            >
              {isEditMode ? "Commit Synchronization" : "Deploy Series Protocol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSeries;