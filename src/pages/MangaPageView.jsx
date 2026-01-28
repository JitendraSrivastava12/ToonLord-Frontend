import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Home, Settings, Loader2 } from 'lucide-react';

const MangaReader = () => {
  const { id, chapterNum } = useParams();
  const navigate = useNavigate();
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        // Using the /index/ route we planned for the re-indexed chapters
        const res = await axios.get(`http://localhost:5000/api/chapters/${id}/index/${chapterNum}`);
        setChapterData(res.data);
      } catch (err) {
        console.error("ToonLord Reader Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
    window.scrollTo(0, 0); 
  }, [id, chapterNum]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-cyan-400">
      <Loader2 className="animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest">Loading Chapter {chapterNum}...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060b] text-white selection:bg-cyan-500/30">
      {/* --- STICKY NAV BAR --- */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 p-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/manga/${id}`} className="hover:text-cyan-400 transition-colors"><ChevronLeft /></Link>
            <h1 className="text-sm font-black truncate max-w-[120px] md:max-w-xs uppercase tracking-tight">
             Chapter. {chapterData?.chapterNumber || 'Unknown Chapter'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={chapterNum}
              onChange={(e) => navigate(`/manga/${id}/${e.target.value}`)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
            >
              {/* Safety check: use 0 if totalChapters is missing */}
              {[...Array(chapterData?.totalChapters || 0)].map((_, i) => (
                <option key={i+1} value={i+1} className="bg-[#0a0b10] text-white">
                  Ch. {i+1}
                </option>
              ))}
            </select>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Settings size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* --- IMAGE VIEWER --- */}
      <main className="max-w-4xl mx-auto flex flex-col items-center min-h-screen bg-black/20">
        {/* FIX: Optional chaining (?.) prevents "Cannot read map of undefined" */}
        {chapterData?.pages && chapterData.pages.length > 0 ? (
          chapterData.pages.map((imgUrl, index) => (
            <img 
              key={index}
              src={imgUrl}
              alt={`Page ${index + 1}`}
              loading="lazy" // Critical for speed
              className="w-full h-auto object-contain select-none pointer-events-none"
              onContextMenu={(e) => e.preventDefault()} 
            />
          ))
        ) : (
          <div className="py-40 text-center space-y-4">
            <p className="text-gray-600 uppercase font-black text-xs tracking-[0.3em]">No Data Found in Archives</p>
            <Link to={`/manga/${id}`} className="text-cyan-500 text-[10px] font-bold underline">RETURN TO MANGA INFO</Link>
          </div>
        )}
      </main>

      {/* --- BOTTOM NAVIGATION --- */}
      <footer className="p-12 flex flex-col items-center gap-8 bg-[#0a0b10] border-t border-white/5">
        <div className="flex gap-4">
          <button 
            disabled={parseInt(chapterNum) <= 1}
            onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) - 1}`)}
            className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 disabled:opacity-10 transition-all font-bold text-sm"
          >
            PREV
          </button>
          <button 
            disabled={parseInt(chapterNum) >= (chapterData?.totalChapters || 0)}
            onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) + 1}`)}
            className="px-12 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all text-sm shadow-xl shadow-cyan-500/20"
          >
            NEXT CHAPTER
          </button>
        </div>
        <Link to="/" className="text-gray-600 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
          <Home size={14}/> Back to Headquarters
        </Link>
      </footer>
    </div>
  );
};

export default MangaReader;