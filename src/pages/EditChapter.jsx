import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Loader2, Edit3, Trash2 } from "lucide-react";
import axios from "axios";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const EditChapterPage = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { currentTheme, isRedMode } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [chapterData, setChapterData] = useState({
    chapterNumber: "",
    title: "",
  });

  const accentColor = isRedMode ? "#ef4444" : "var(--accent)";

  // 1. Fetch current chapter data to pre-fill the form
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        // We use the mangaId and chapterId to get the specific chapter
        const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
        const chapter = res.data.find((ch) => ch._id === chapterId);
        
        if (chapter) {
          setChapterData({
            chapterNumber: chapter.chapterNumber,
            title: chapter.title || "",
          });
        }
        setLoading(false);
      } catch (err) {
        showAlert("Failed to load chapter data", "error");
        navigate(-1);
      }
    };
    fetchChapter();
  }, [chapterId, mangaId]);

  // 2. Handle the PATCH request
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        `http://localhost:5000/api/chapters/${chapterId}`,
        chapterData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("Chapter successfully updated", "success");
      navigate(`/my-series`); // Redirect back to management
    } catch (err) {
      showAlert(err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] p-6 transition-all theme-${currentTheme}`}>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic">Edit <span className={isRedMode ? 'text-red-500' : 'text-[var(--accent)]'}>Chapter</span></h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Updating Metadata for ID: {chapterId}</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleUpdate} className="p-8 rounded-3xl bg-[var(--bg-secondary)]/30 border border-[var(--border)] backdrop-blur-xl space-y-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Chapter Number</label>
            <input 
              type="number" 
              required
              value={chapterData.chapterNumber}
              onChange={(e) => setChapterData({...chapterData, chapterNumber: e.target.value})}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Chapter Title (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. The Beginning of the End"
              value={chapterData.title}
              onChange={(e) => setChapterData({...chapterData, title: e.target.value})}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-all font-bold"
            />
          </div>

          <button 
            type="submit" 
            disabled={updating}
            className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Commit Changes
          </button>
        </form>

        {/* Warning Zone */}
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
           <p className="text-[9px] font-black uppercase text-red-500 tracking-tighter mb-1">System Warning</p>
           <p className="text-[11px] text-[var(--text-dim)] italic">Changing chapter numbers may disrupt the reading sequence for your subscribers. Proceed with caution.</p>
        </div>
      </div>
    </div>
  );
};

export default EditChapterPage;