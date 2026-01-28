import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MangaDetailMap from "../components/MangaDetailMap"; // <-- import your new component

const CHAPTERS_PER_PAGE = 50;

const MangaDetail = () => {
  const { mangaId } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [tocPage, setTocPage] = useState(1);

  // Fetch Manga Details
  const { data: manga, isLoading: mangaLoading } = useQuery({
    queryKey: ["mangaDetail", mangaId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/mangas/${mangaId}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Chapters
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["mangaChapters", mangaId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
      const rawData = Array.isArray(res.data) ? res.data : res.data.chapters || [];
      return rawData.sort((a, b) => (b.chapterNumber || 0) - (a.chapterNumber || 0));
    },
    staleTime: 1000 * 60 * 5,
  });

  const totalChapters = chapters.length;
  const totalPages = Math.ceil(totalChapters / CHAPTERS_PER_PAGE);
  const startIdx = (tocPage - 1) * CHAPTERS_PER_PAGE;
  const visibleChapters = chapters.slice(startIdx, startIdx + CHAPTERS_PER_PAGE);

  if (mangaLoading) return (
    <div className="min-h-screen flex items-center justify-center text-indigo-400 bg-[#050505]">
      <div className="animate-pulse">Loading Mangas...</div>
    </div>
  );


  const shortDesc = manga?.description?.length > 280 && !expanded
    ? manga.description.slice(0, 280) + "..."
    : manga?.description;

  // Black frosted/glow panel
   const glassStyle = "bg-white/[0.03] backdrop-blur-[20px] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]";
  const innerRefraction = "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.05] before:to-transparent before:pointer-events-none";

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 relative overflow-hidden">

      <div className="max-w-5xl mx-auto px-4 py-10 relative z-10">

        {/* HERO */}
        <div className={`relative rounded-3xl p-5 md:p-8 ${glassStyle} ${innerRefraction}`}>
          <div className="flex flex-col md:flex-row gap-8">

            <div className="mx-auto md:mx-0 shrink-0">
              <img
                src={manga.coverImage}
                alt={manga.title}
                className="w-56 h-84 object-cover rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <div className="flex-1">

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {manga.title}
              </h1>

              <p className="text-sm text-indigo-300/80 mt-3 font-medium tracking-widest uppercase">
            Story by <span className="text-white border-b border-indigo-500/50 pb-1">{manga.author || "Unknown"}</span>
              </p>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox label="Status" value={manga.status || "Ongoing"} color="text-green-400" />
                <StatBox label="Chapters" value={totalChapters} />
                <StatBox label="Views" value={manga.views?.toLocaleString() || "—"} />
                <StatBox label="Rating" value={`★ ${manga.rating || "4.8"}`} color="text-yellow-400" />
              </div>

              <div className="flex flex-wrap gap-2 mt-8">
                {manga.genres?.map((g, i) => (
                  <span key={i} className="px-4 py-1.5 text-xs font-bold uppercase rounded-full bg-white/[0.05] border border-white/[0.1] text-indigo-200">
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link
                  to={`/manga/${mangaId}/${chapters[0]?.chapterNumber}`}
                  className="bg-indigo-600 hover:bg-white/30 px-8 py-3 rounded-xl font-bold uppercase text-white   shadow-lg flex items-center justify-center"
                >
                  Start Reading
                </Link>
                <button className="px-8 py-3 rounded-xl font-semibold text-indigo-300 uppercase  border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/10 transition  ">
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manga Detailed Info Map */}
        

        {/* TABS */}
        <div className={`mt-10 rounded-3xl overflow-hidden ${glassStyle} ${innerRefraction}`}>
          <div className="flex flex-wrap border-b border-white/5 bg-white/[0.02] ">
            {["about", "toc", "recommend"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all
                  ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'}
                `}
              >
                {tab === "toc" ? "Chapters" : tab === "recommend" ? "Similar" : tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === "about" && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">The Synopsis</h2>
                <p className="text-gray-400 leading-relaxed text-lg font-light tracking-wide">
                  {shortDesc}
                </p>
                {manga.description?.length > 280 && (
                  <button onClick={() => setExpanded(!expanded)} className="mt-4 text-indigo-400 font-bold hover:underline">
                    {expanded ? 'SHOW LESS' : 'READ FULL SUMMARY'}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'toc' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-white">Chapters</h2>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
                    {totalChapters} Available
                  </span>
                </div>

                {/* PAGE TABS */}
                {totalPages > 1 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const from = totalChapters - (pageNum - 1) * CHAPTERS_PER_PAGE ;
                      const to = Math.max(totalChapters - (pageNum ) * CHAPTERS_PER_PAGE, 0);

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setTocPage(pageNum)}
                          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all
                            ${tocPage === pageNum
                              ? 'bg-indigo-600 border-indigo-400 text-white'
                              : 'bg-white/[0.05] border-white/[0.1] text-gray-400 hover:text-white'}
                          `}
                        >
                          {from}–{to}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* CHAPTER LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visibleChapters.map((ch, idx) => (
                    <Link
                      key={ch._id}
                      to={`/manga/${mangaId}/${ch.chapterNumber}`}
                      className="group flex items-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
                    >
                      <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 font-mono text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {totalChapters - (startIdx + idx)}
                      </span>
                      <span className="ml-4 text-gray-300 group-hover:text-white font-medium truncate">
                       Chapter {ch.chapterNumber}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "recommend" && (
              <div className="py-12 text-center text-gray-600 text-xs">
                Personalized recommendations coming soon…
              </div>
            )}
          </div>
        </div><div className="mt-12">
          <div className={` p-8 rounded-3xl ${glassStyle} ${innerRefraction}`}>
            <h2 className="text-xl font-bold mb-6 text-white  border-l-4 border-indigo-600 pl-4">
          MetaData & Details </h2>
          <MangaDetailMap manga={manga} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = 'text-white' }) => (
  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl">
    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);


export default MangaDetail;
