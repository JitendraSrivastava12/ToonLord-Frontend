import PropTypes from "prop-types";

const MangaDetailMap = ({ manga }) => {
  if (!manga) return null;
  console.log(manga);

  return (
    <div
      className="rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-xl overflow-hidden"
    >
      <DetailRow label="Titles">
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li className="font-medium text-white">{manga.title}</li>
          {manga.altTitles?.map((t, i) => (
            <li key={i} className="text-gray-400">
              {t}
            </li>
          ))}
        </ul>
      </DetailRow>

      <DetailRow label="Status">{manga.status || "Ongoing"}</DetailRow>

      <DetailRow label="Date Added">
        {manga.createdAt
          ? new Date(manga.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "—"}
      </DetailRow>

      <DetailRow label="Author">
        <div>
          <div className="text-white">{manga.authorNative}</div>
          <div className="text-indigo-400">{manga.author}</div>
        </div>
      </DetailRow>

      <DetailRow label="Genres">
        <div className="flex flex-wrap gap-2">
          {manga.genres?.map((g, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs rounded-full
                bg-indigo-500/10 text-indigo-300
                border border-indigo-400/20"
            >
              {g}
            </span>
          ))}
        </div>
      </DetailRow>

      <DetailRow label="Tags">
        <div className="flex flex-wrap gap-2">
          {manga.tags?.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs rounded-full
                bg-white/10 text-gray-200
                border border-white/[0.08]
                shadow-[0_0_5px_#ffffff20]"
            >
              {tag}
            </span>
          ))}
        </div>
      </DetailRow>
    </div>
  );
};

/* consistent row with black-frosted aesthetic */
const DetailRow = ({ label, children }) => (
  <div className="flex border-b border-white/10 last:border-b-0">
    <div
      className="w-36 md:w-44 px-4 py-3
        bg-white/5 text-gray-400
        font-medium text-sm"
    >
      {label}
    </div>
    <div className="flex-1 px-4 py-3 text-gray-200">{children}</div>
  </div>
);

MangaDetailMap.propTypes = {
  manga: PropTypes.object.isRequired,
};

export default MangaDetailMap;
