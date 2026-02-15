import React, { useContext } from "react";
import PropTypes from "prop-types";
import { AppContext } from "../UserContext"; 

const MangaDetailMap = ({ manga }) => {
  const { currentTheme, isRedMode } = useContext(AppContext);

  // Return null early if data is missing to prevent crashes
  if (!manga) return null;

  // Visual DNA Mapping
  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  const badgeStyle = isRedMode 
    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
    : 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]';

  return (
    <div
      className={`rounded-2xl bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border)] shadow-2xl overflow-hidden transition-all duration-700 theme-${currentTheme}`}
    >
      {/* 1. TITLES SECTION */}
      <DetailRow label="Titles">
        <ul className="list-disc pl-5 space-y-1">
          <li className={`font-black text-sm uppercase  ${accentText}`}>
            {manga.title}
          </li>
          {manga.altTitles?.map((t, i) => (
            <li key={i} className="text-[var(--text-dim)] text-[11px] font-medium leading-tight">
              {t}
            </li>
          ))}
        </ul>
      </DetailRow>

      {/* 2. STATUS PROTOCOL */}
      <DetailRow label="Status">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${manga.status?.toLowerCase() === 'completed' ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-[var(--accent)] shadow-[var(--accent-glow)]'}`} />
          <span className="font-black uppercase text-[10px] tracking-widest text-[var(--text-main)]">
            {manga.status || "Ongoing"}
          </span>
        </div>
      </DetailRow>

      {/* 3. TEMPORAL DATA */}
      <DetailRow label="Date Added">
        <span className="font-mono text-[11px] text-[var(--text-dim)] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border)]">
          {manga.createdAt
            ? new Date(manga.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "NOT_SYNCED"}
        </span>
      </DetailRow>

      {/* 4. ARCHITECT INFO */}
      <DetailRow label="Author">
        <div className="group cursor-default">
          {manga.authorNative && (
            <div className="text-[var(--text-main)] font-black text-xs uppercase tracking-tight">
                {manga.authorNative}
            </div>
          )}
          <div className={`${accentText} font-bold text-[10px] uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity`}>
            {manga.author || "Unknown Architect"}
          </div>
        </div>
      </DetailRow>

      {/* 5. CLASSIFICATIONS */}
      <DetailRow label="Genres">
        <div className="flex flex-wrap gap-1.5">
          {manga.genres?.map((g, i) => (
            <span
              key={i}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all hover:scale-110 active:scale-95 cursor-default ${badgeStyle}`}
            >
              {g}
            </span>
          ))}
        </div>
      </DetailRow>

      {/* 6. METADATA TAGS */}
      <DetailRow label="Tags">
        <div className="flex flex-wrap gap-1.5">
          {manga.tags?.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md
                bg-[var(--bg-primary)] text-[var(--text-dim)]
                border border-[var(--border)]
                shadow-inner hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      </DetailRow>
    </div>
  );
};

/**
 * REUSABLE ROW COMPONENT
 * Ensures consistent technical spacing and themed hover states
 */
const DetailRow = ({ label, children }) => (
  <div className="flex border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--accent)]/5 transition-colors group">
    <div
      className="w-32 md:w-40 px-4 py-4
        bg-[var(--bg-primary)]/50 text-[var(--text-dim)]
        font-black text-[9px] uppercase tracking-[0.3em] flex items-center border-r border-[var(--border)]"
    >
      {label}
    </div>
    <div className="flex-1 px-5 py-4 text-[var(--text-main)] flex items-center">
        {children}
    </div>
  </div>
);

MangaDetailMap.propTypes = {
  manga: PropTypes.shape({
    title: PropTypes.string.isRequired,
    altTitles: PropTypes.array,
    status: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    author: PropTypes.string,
    authorNative: PropTypes.string,
    genres: PropTypes.array,
    tags: PropTypes.array,
  }).isRequired,
};

export default MangaDetailMap;