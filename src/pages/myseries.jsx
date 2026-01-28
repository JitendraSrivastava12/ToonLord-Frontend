import React, { useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, Trash2, Edit3, BookOpen, Search, 
  BarChart3, Layers, X, Eye, 
  MoreHorizontal, ChevronDown, ChevronUp
} from "lucide-react";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const MySeries = () => {
  const { isRedMode } = useContext(AppContext);
  const { showAlert } = useAlert();
  const themeColor = isRedMode ? '#ef4444' : '#22c55e';

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState(null); // Tracks which chapter list is open

  // --- MOCK DATABASE ---
  const [seriesList, setSeriesList] = useState([
  // --- FAMILY MODE EXAMPLES ---
  {
    id: 1,
    title: "Spirit Hunter X",
    cover: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400",
    status: "Ongoing",
    views: "124.5k",
    chapters: [
      { id: 101, title: "Ch. 01: The Awakening" },
      { id: 102, title: "Ch. 02: Blood Moon" },
      { id: 103, title: "Ch. 03: Silent Woods" }
    ]
  },
  {
    id: 2,
    title: "Cyberpunk: Neon Edge",
    cover: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400",
    status: "Ongoing",
    views: "89.2k",
    chapters: [
      { id: 201, title: "Ch. 01: Data Breach" },
      { id: 202, title: "Ch. 02: Glitch in the Matrix" }
    ]
  },
  {
    id: 3,
    title: "The Alchemist's Debt",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400",
    status: "Completed",
    views: "210.1k",
    chapters: [
      { id: 301, title: "Final Chapter: Gold & Dust" }
    ]
  },
  {
    id: 4,
    title: "Samurai Zero",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400",
    status: "Ongoing",
    views: "45.7k",
    chapters: [
      { id: 401, title: "Ch. 15: The Last Ronin" }
    ]
  },
  {
    id: 5,
    title: "Tower of Eternity",
    cover: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=400",
    status: "Ongoing",
    views: "340.2k",
    chapters: [
      { id: 501, title: "Ch. 104: Floor of Gods" }
    ]
  },

  // --- RED MODE EXAMPLES ---
  {
    id: 6,
    title: "Midnight Secrets",
    cover: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=400",
    status: "Ongoing",
    views: "1.2M",
    chapters: [
      { id: 601, title: "Ch. 01: Private Tutor" },
      { id: 602, title: "Ch. 02: After Hours" }
    ]
  },
  {
    id: 7,
    title: "The CEO's Temptation",
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400",
    status: "Ongoing",
    views: "980k",
    chapters: [
      { id: 701, title: "Ch. 08: Penthouse Meeting" }
    ]
  },
  {
    id: 8,
    title: "Lustful Labyrinth",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400",
    status: "Completed",
    views: "560k",
    chapters: [
      { id: 801, title: "Ch. 20: Freedom at Last" }
    ]
  },
  {
    id: 9,
    title: "Under the Velvet Moonlight",
    cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400",
    status: "Ongoing",
    views: "720k",
    chapters: [
      { id: 901, title: "Ch. 05: Untamed Hearts" }
    ]
  },
  {
    id: 10,
    title: "Forbidden Pact",
    cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400",
    status: "Ongoing",
    views: "1.5M",
    chapters: [
      { id: 1001, title: "Ch. 01: Dark Deal" }
    ]
  }
  ]);

  // --- DELETE LOGIC ---
  const deleteSeries = (id, title) => {
    setSeriesList(prev => prev.filter(s => s.id !== id));
    showAlert(`${title} protocol terminated.`, "error", 4000);
  };

  const deleteChapter = (seriesId, chapterId, chapterTitle) => {
    setSeriesList(prev => prev.map(series => {
      if (series.id === seriesId) {
        return {
          ...series,
          chapters: series.chapters.filter(ch => ch.id !== chapterId)
        };
      }
      return series;
    }));
    showAlert(`${chapterTitle} purged from system.`, "error", 3000);
  };

  // --- SEARCH FILTER ---
  const filteredSeries = seriesList.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05060b] text-white relative overflow-hidden p-6 lg:p-12">
      
      {/* Background Glow */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[140px] opacity-10" style={{ backgroundColor: themeColor }} />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8 p-10 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">My <span style={{ color: themeColor }}>Series</span></h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Integrated Chapter Management</p>
          </div>
          <Link to="/create-series" className="flex items-center gap-4 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl"
            style={{ backgroundColor: themeColor, color: '#000' }}>
            <Plus size={18} /> New Series
          </Link>
        </header>

        {/* Search Bar */}
        <div className="relative group max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search Series Database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold focus:outline-none transition-all"
          />
        </div>

        {/* Series List */}
        <div className="grid grid-cols-1 gap-8">
          {filteredSeries.map((series) => (
            <div key={series.id} className="rounded-[3rem] bg-white/[0.01] border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10">
              <div className="flex flex-col md:flex-row gap-8 p-8">
                
                {/* Series Thumbnail */}
                <div className="relative w-full md:w-48 h-64 rounded-3xl overflow-hidden shadow-2xl shrink-0">
                  <img src={series.cover} className="w-full h-full object-cover" alt="cover" />
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-[9px] font-black border border-white/10 uppercase tracking-widest">
                    {series.status}
                  </div>
                </div>

                {/* Series Content */}
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{series.title}</h2>
                      <div className="flex gap-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2"><BookOpen size={14} style={{ color: themeColor }}/> {series.chapters.length} Chapters</span>
                        <span className="flex items-center gap-2"><Eye size={14} style={{ color: themeColor }}/> {series.views} Views</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/edit-series/${series.id}`} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => deleteSeries(series.id, series.title)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Toggle Chapter List */}
                  <div className="mt-8 border-t border-white/5 pt-6">
                    <button 
                      onClick={() => setExpandedSeries(expandedSeries === series.id ? null : series.id)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedSeries === series.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      {expandedSeries === series.id ? "Hide Chapters" : "Manage Chapters"}
                    </button>

                    {/* CHAPTER LIST (The Removal Area) */}
                    {expandedSeries === series.id && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-4 duration-500">
                        {series.chapters.length > 0 ? (
                          series.chapters.map((ch) => (
                            <div key={ch.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/ch">
                              <span className="text-xs font-bold text-gray-300">{ch.title}</span>
                              <div className="flex gap-2 opacity-0 group-hover/ch:opacity-100 transition-opacity">
                                <Link to={`/edit-chapter/${ch.id}`} className="p-1.5 hover:text-white text-gray-500"><Edit3 size={14}/></Link>
                                <button 
                                  onClick={() => deleteChapter(series.id, ch.id, ch.title)}
                                  className="p-1.5 hover:text-red-500 text-gray-500"
                                >
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-gray-600 italic">No chapters initialized.</p>
                        )}
                        <Link to="/upload" className="flex items-center justify-center p-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-white/30 hover:text-white transition-all">
                          <Plus size={14} className="mr-2" /> Add Chapter
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MySeries;