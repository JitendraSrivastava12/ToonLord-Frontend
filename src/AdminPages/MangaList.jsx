import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus, Search, Eye, Edit, Trash2, LayoutGrid, Loader2, X
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function MangaList() {
  const [mangas, setMangas] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedManga, setSelectedManga] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form state
  const initialForm = {
    title: "",
    author: "",
    status: "ongoing", // Lowercase to match Schema enum
    chapters: "",
    rating: "",
    coverImage: "",
    genres: "",
    description: "",
    externalId: ""
  };
  const [formData, setFormData] = useState(initialForm);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
  });

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchMangas();
  }, []);

  const fetchMangas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/mangas/admin/all`, getHeaders());
      setMangas(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ACTIONS ----------------
  const openEdit = (manga) => {
    setSelectedManga(manga);
    setIsEditMode(true);
    setFormData({
      ...manga,
      // Map TotalChapter from DB to local 'chapters' state for the form
      chapters: manga.TotalChapter || "",
      genres: manga.tags?.join(", ") || ""
    });
  };

  const openAdd = () => {
    setFormData(initialForm);
    setIsAddMode(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this manga?")) return;
    try {
      await axios.delete(`${API_URL}/api/mangas/admin/${id}`, getHeaders());
      setMangas(mangas.filter(m => m._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        // Ensure status is lowercase for Mongoose Enum validation
        status: formData.status.toLowerCase(),
        TotalChapter: Number(formData.chapters),
        tags: typeof formData.genres === 'string' 
          ? formData.genres.split(",").map(g => g.trim()).filter(g => g !== "")
          : formData.genres
      };

      if (isAddMode) {
        const res = await axios.post(`${API_URL}/api/mangas/admin/add`, payload, getHeaders());
        setMangas([...mangas, res.data.manga]);
      } else {
        const res = await axios.put(`${API_URL}/api/mangas/admin/${selectedManga._id}`, payload, getHeaders());
        setMangas(mangas.map(m => m._id === selectedManga._id ? res.data.manga : m));
      }
      closeModals();
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const closeModals = () => {
    setSelectedManga(null);
    setIsEditMode(false);
    setIsAddMode(false);
    setFormData(initialForm);
  };

  // ---------------- STATS & FILTER (FIXED LOGIC) ----------------
  const stats = {
    total: mangas.length,
    // Using .toLowerCase() to ensure comparison works regardless of DB entry casing
    ongoing: mangas.filter(m => m.status?.toLowerCase() === "ongoing").length,
    completed: mangas.filter(m => m.status?.toLowerCase() === "completed").length,
    hiatus: mangas.filter(m => m.status?.toLowerCase() === "hiatus").length
  };

  const filteredMangas = mangas.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || 
                          m.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFE] p-4 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Library Manager</h1>
          </div>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} /> Add New Manga
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Total Manga" value={stats.total} icon={<LayoutGrid size={20}/>} />
          <StatCard label="Ongoing" value={stats.ongoing} color="text-emerald-600" />
          <StatCard label="Completed" value={stats.completed} color="text-indigo-600" />
          <StatCard label="On Hiatus" value={stats.hiatus} color="text-amber-500" />
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Search by title..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 rounded-2xl outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-50 border-transparent border focus:border-indigo-500 rounded-2xl px-6 py-3 font-semibold outline-none cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Hiatus</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2 font-bold uppercase tracking-widest">
              <Loader2 className="animate-spin" /> Syncing Database...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-black">
                    <th className="px-8 py-5">Entry</th>
                    <th className="px-6 py-5">Author</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-center">Chapters</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMangas.map(m => (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-5">
                          <img src={m.coverImage} className="w-12 h-16 rounded-xl object-cover shadow-sm ring-1 ring-slate-100" alt="" />
                          <div>
                            <p className="font-bold text-slate-800">{m.title}</p>
                            <p className="text-[10px] font-mono text-slate-400 uppercase">ID: {m._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{m.author || 'Unknown'}</td>
                      <td className="px-6 py-4 text-center"><StatusPill status={m.status} /></td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-slate-700">{m.TotalChapter || 0}</td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <ActionButton icon={<Eye size={16}/>} onClick={() => { setSelectedManga(m); setIsEditMode(false); }} />
                          <ActionButton icon={<Edit size={16}/>} color="hover:text-emerald-600" onClick={() => openEdit(m)} />
                          <ActionButton icon={<Trash2 size={16}/>} color="hover:text-rose-600" onClick={() => handleDelete(m._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {(selectedManga || isAddMode) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            <div className="md:w-1/3 bg-slate-50 p-8 flex flex-col items-center justify-center border-r border-slate-100">
              <div className="relative group">
                {selectedManga.coverImage?(
                  <img src={selectedManga.coverImage} className="w-48 h-64 rounded-2xl shadow-2xl object-cover ring-4 ring-white" alt="preview" />
                ) : (
                  <div className="w-48 h-64 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 italic text-xs">No Cover</div>
                )}
                <div className="absolute -bottom-3 -right-3">
                   <StatusPill status={selectedManga.status} />
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-8 pb-4">
                <h2 className="text-2xl font-black text-slate-900">
                  {isAddMode ? "New Entry" : isEditMode ? "Edit Manga" : "Preview"}
                </h2>
                <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 pt-4 overflow-y-auto space-y-6">
                {(isEditMode || isAddMode) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Input label="Manga Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <Input label="Cover Image URL" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
                    <Input label="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                    <Input label="Chapters" type="number" value={formData.chapters} onChange={e => setFormData({...formData, chapters: e.target.value})} />
                    <Input label="Rating" type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                    <div className="md:col-span-2">
                      <Input label="Genres (Tags)" value={formData.genres} onChange={e => setFormData({...formData, genres: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status Selection</label>
                      <div className="flex gap-2">
                        {["ongoing", "completed", "hiatus"].map(s => (
                          <button 
                            key={s} 
                            onClick={() => setFormData({...formData, status: s})}
                            className={`flex-1 py-3 rounded-xl font-bold border-2 capitalize transition-all ${formData.status.toLowerCase() === s ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <DetailRow label="Primary Title" value={selectedManga.title} highlight />
                    <div className="grid grid-cols-2 gap-8">
                      <DetailRow label="Author" value={selectedManga.author} />
                      <DetailRow label="Chapters" value={selectedManga.TotalChapter} />
                    </div>
                    <DetailRow label="Genres" value={selectedManga.tags?.join(", ")} />
                    <DetailRow label="Description" value={selectedManga.description} />
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4 mt-auto">
                <button onClick={closeModals} className="px-6 py-3 font-bold text-slate-400">Cancel</button>
                {(isEditMode || isAddMode) && (
                  <button onClick={handleSave} className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:bg-indigo-700 transition-all">
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
const StatCard = ({ label, value, color = "text-slate-900", icon }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
    {icon && <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">{icon}</div>}
  </div>
);

const StatusPill = ({ status }) => {
  const s = status?.toLowerCase() || 'ongoing';
  const styles = {
    ongoing: "bg-emerald-50 text-emerald-600 border-emerald-100",
    completed: "bg-indigo-50 text-indigo-600 border-indigo-100",
    hiatus: "bg-amber-50 text-amber-600 border-amber-100",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100"
  };
  return <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[s] || styles.ongoing}`}>{s}</span>;
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input {...props} className="w-full border-slate-200 border rounded-2xl p-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" />
  </div>
);

const DetailRow = ({ label, value, highlight }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`${highlight ? "text-2xl font-black" : "text-base font-bold"} text-slate-800`}>{value || "—"}</p>
  </div>
);

const ActionButton = ({ icon, color, onClick }) => (
  <button onClick={onClick} className={`p-2.5 rounded-xl text-slate-400 hover:bg-white hover:shadow-md transition-all active:scale-90 ${color}`}>
    {icon}
  </button>
);