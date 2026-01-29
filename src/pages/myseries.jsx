import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, Trash2, Edit3, BookOpen, Search, 
  Eye, ChevronDown, ChevronUp, Loader2, AlertTriangle, X
} from "lucide-react";
import axios from 'axios';
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const MySeries = () => {
  const { isRedMode } = useContext(AppContext);
  const { showAlert } = useAlert();
  const themeColor = isRedMode ? '#ef4444' : '#22c55e';

  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [chaptersByManga, setChaptersByManga] = useState({});
  const [editingChapter, setEditingChapter] = useState(null);
  const [editFormData, setEditFormData] = useState({ chapterNumber: '', title: '' });

  // --- 1. FETCH USER'S SERIES FROM DATABASE ---
  const fetchMySeries = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // This endpoint returns user.createdSeries populated with Manga objects
      const res = await axios.get('http://localhost:5000/api/users/my-mangas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeriesList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showAlert("Database Sync Failed", "error");
      console.error(err);
      setSeriesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySeries();
  }, []);

  // --- 2. DELETE PROTOCOL (CASCADING) ---
  const handleDelete = async (id, title) => {
    if (!window.confirm(`PERMANENT PURGE: Are you sure you want to delete "${title}" and all its chapters?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.delete(`http://localhost:5000/api/mangas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSeriesList(prev => prev.filter(s => s._id !== id));
        showAlert(`${title} purged from system.`, "success");
      }
    } catch (err) {
      showAlert("Purge Interrupted", "error");
    }
  };

  // --- 2B. DELETE CHAPTER ---
  const handleDeleteChapter = async (mangaId, chapterId, chapterNumber) => {
    if (!window.confirm(`Delete Chapter ${chapterNumber}? This cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/chapters/${mangaId}/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update manga chapter count and refresh chapters list
      setSeriesList(prev => prev.map(s => 
        s._id === mangaId ? { ...s, TotalChapter: (s.TotalChapter || 1) - 1 } : s
      ));
      
      // Refresh chapters for this manga
      if (chaptersByManga[mangaId]) {
        const updated = chaptersByManga[mangaId].filter(ch => ch._id !== chapterId);
        setChaptersByManga(prev => ({ ...prev, [mangaId]: updated }));
      }
      
      showAlert(`Chapter ${chapterNumber} deleted`, "success");
    } catch (err) {
      showAlert("Delete failed", "error");
    }
  };

  // --- 2C. FETCH CHAPTERS FOR A MANGA ---
  const fetchChaptersForManga = async (mangaId) => {
    if (chaptersByManga[mangaId]) return; // Already loaded
    
    try {
      const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
      const chapters = Array.isArray(res.data) ? res.data : [];
      setChaptersByManga(prev => ({ ...prev, [mangaId]: chapters }));
    } catch (err) {
      console.error("Failed to load chapters:", err);
    }
  };

  // --- 2D. EDIT CHAPTER ---
  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setEditFormData({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title || `Chapter ${chapter.chapterNumber}`
    });
  };

  const handleSaveChapter = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/chapters/${editingChapter._id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      const mangaId = Object.keys(chaptersByManga).find(key =>
        chaptersByManga[key].some(ch => ch._id === editingChapter._id)
      );
      
      if (mangaId) {
        const updated = chaptersByManga[mangaId].map(ch =>
          ch._id === editingChapter._id ? { ...ch, ...editFormData } : ch
        );
        setChaptersByManga(prev => ({ ...prev, [mangaId]: updated }));
      }

      setEditingChapter(null);
      showAlert("Chapter updated successfully", "success");
    } catch (err) {
      showAlert("Failed to update chapter", "error");
    }
  };

  // --- 3. SEARCH FILTER ---
  const filteredSeries = seriesList.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#05060b] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin" size={40} style={{ color: themeColor }} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Syncing Series Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060b] text-white relative overflow-hidden p-6 lg:p-12">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[140px] opacity-10" style={{ backgroundColor: themeColor }} />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8 p-10 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">My <span style={{ color: themeColor }}>Series</span></h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Proprietary Content Management</p>
          </div>
          <Link to="/create-series" className="flex items-center gap-4 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: themeColor, color: '#000' }}>
            <Plus size={18} /> New Series
          </Link>
        </header>

        {/* SEARCH & STATS SUMMARY */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative group flex-1 max-w-2xl w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search Series Database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
          <div className="px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-8">
             <div>
                <p className="text-white font-black text-xl">{seriesList.length}</p>
                <p className="text-[8px] uppercase font-bold text-slate-500">Total Series</p>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div>
                <p className="text-white font-black text-xl">{seriesList.reduce((acc, curr) => acc + (curr.TotalChapter || 0), 0)}</p>
                <p className="text-[8px] uppercase font-bold text-slate-500">Total Chapters</p>
             </div>
          </div>
        </div>

        {/* SERIES GRID */}
        <div className="grid grid-cols-1 gap-8">
          {filteredSeries.length > 0 ? filteredSeries.map((series) => (
            <div key={series._id} className="rounded-[3rem] bg-white/[0.01] border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10">
              <div className="flex flex-col md:flex-row gap-8 p-8">
                
                {/* Thumbnail */}
                <div className="relative w-full md:w-48 h-64 rounded-3xl overflow-hidden shadow-2xl shrink-0 group">
                  <img src={series.coverImage || 'https://via.placeholder.com/400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="cover" />
                  <div className={`absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-[9px] font-black border border-white/10 uppercase tracking-widest ${series.isAdult ? 'text-red-500' : 'text-emerald-500'}`}>
                    {series.isAdult ? 'NSFW' : series.status || 'Ongoing'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2 leading-none">{series.title}</h2>
                      <div className="flex flex-wrap gap-6 text-gray-500 text-[10px] font-black uppercase tracking-widest mt-4">
                        <span className="flex items-center gap-2"><BookOpen size={14} style={{ color: themeColor }}/> {series.TotalChapter || 0} Chapters</span>
                        <span className="flex items-center gap-2"><Eye size={14} style={{ color: themeColor }}/> {series.views || 0} Views</span>
                        {series.isAdult && <span className="flex items-center gap-2 text-red-500/80"><AlertTriangle size={14}/> Restricted</span>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/manga/${series._id}`} className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all" title="Read manga">
                        <Eye size={18} />
                      </Link>
                      <Link to={`/edit-series/${series._id}`} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(series._id, series.title)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Chapter Management Toggle */}
                  <div className="mt-8 border-t border-white/5 pt-6">
                    <button 
                      onClick={() => {
                        setExpandedSeries(expandedSeries === series._id ? null : series._id);
                        if (expandedSeries !== series._id) {
                          fetchChaptersForManga(series._id);
                        }
                      }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedSeries === series._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      {expandedSeries === series._id ? "Hide Intelligence" : "Chapter Management"}
                    </button>

                    {expandedSeries === series._id && (
                      <div className="mt-6 p-6 rounded-3xl bg-black/40 border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                         <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Chapters ({(chaptersByManga[series._id] || []).length})</p>
                            <Link to="/upload" className="text-[10px] font-black uppercase text-white px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">Add New</Link>
                         </div>
                         {(chaptersByManga[series._id] || []).length > 0 ? (
                           <div className="space-y-2 max-h-64 overflow-y-auto">
                             {(chaptersByManga[series._id] || []).map(chapter => (
                               <div key={chapter._id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                 <div className="flex-1">
                                   <p className="text-[10px] font-bold text-white">Chapter {chapter.chapterNumber}</p>
                                   <p className="text-[8px] text-gray-500">{chapter.title || `Chapter ${chapter.chapterNumber}`}</p>
                                 </div>
                                 <div className="flex gap-2 ml-3">
                                   <button 
                                     onClick={() => handleEditChapter(chapter)}
                                     className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                     title="Edit chapter"
                                   >
                                     <Edit3 size={14} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteChapter(series._id, chapter._id, chapter.chapterNumber)}
                                     className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                     title="Delete chapter"
                                   >
                                     <Trash2 size={14} />
                                   </button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-[10px] text-slate-600 italic">No chapters uploaded yet. Click "Add New" to upload.</p>
                         )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
               <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">No Series Initialized in System</p>
               <Link to="/create-series" className="mt-4 inline-block text-[10px] font-bold underline" style={{ color: themeColor }}>Start First Protocol</Link>
            </div>
          )}
        </div>

        {/* EDIT CHAPTER MODAL */}
        {editingChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#05060b] border border-white/10 rounded-3xl p-8 w-96 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Edit Chapter</h2>
                <button onClick={() => setEditingChapter(null)} className="hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-2">Chapter Number</label>
                  <input 
                    type="number" 
                    value={editFormData.chapterNumber}
                    onChange={(e) => setEditFormData({...editFormData, chapterNumber: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-white/20"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-2">Chapter Title</label>
                  <input 
                    type="text" 
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-white/20"
                    placeholder="Chapter title"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleSaveChapter}
                    className="flex-1 py-3 bg-cyan-500 text-black font-black uppercase rounded-xl hover:bg-cyan-400 transition-all"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditingChapter(null)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-black uppercase rounded-xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MySeries;