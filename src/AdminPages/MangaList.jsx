import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  LayoutGrid,
  Loader2,
  X
} from "lucide-react";
import { useAlert } from "../context/AlertContext";
const API_URL = import.meta.env.VITE_API_URL;

export default function MangaList() {
  const [mangas, setMangas] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);
 
  const [selectedManga, setSelectedManga] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const {showAlert}=useAlert();

  const initialForm = {
    title: "",
    author: "",
    status: "ongoing",
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

  useEffect(() => {
    fetchMangas();
  }, []);

  const fetchMangas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/mangas/admin/all`,
        getHeaders()
      );
      setMangas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (manga) => {
    setSelectedManga(manga);
    setIsEditMode(true);
    setIsAddMode(false);

    setFormData({
      ...manga,
      chapters: manga.TotalChapter || "",
      genres: manga.tags?.join(", ") || ""
    });
  };

  const openAdd = () => {
    setSelectedManga(null);
    setIsAddMode(true);
    setIsEditMode(false);
    setFormData(initialForm);
  };

  const closeModals = () => {
    setSelectedManga(null);
    setIsEditMode(false);
    setIsAddMode(false);
    setFormData(initialForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this manga?")) return;

    try {
      await axios.delete(
        `${API_URL}/api/mangas/admin/${id}`,
        getHeaders()
      );
      setMangas((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      showAlert("Delete failed",'error');
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        status: formData.status.toLowerCase(),
        TotalChapter: Number(formData.chapters),
        tags:
          typeof formData.genres === "string"
            ? formData.genres
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean)
            : []
      };

      if (isAddMode) {
        const res = await axios.post(
          `${API_URL}/api/mangas/admin/add`,
          payload,
          getHeaders()
        );
        setMangas((prev) => [...prev, res.data.manga]);
      } else {
        const res = await axios.put(
          `${API_URL}/api/mangas/admin/${selectedManga._id}`,
          payload,
          getHeaders()
        );
        setMangas((prev) =>
          prev.map((m) =>
            m._id === selectedManga._id ? res.data.manga : m
          )
        );
      }

      closeModals();
    } catch (err) {
      showAlert(err.response?.data?.message || "Save failed",'error');
    }
  };

  const stats = {
    total: mangas.length,
    ongoing: mangas.filter(
      (m) => m.status?.toLowerCase() === "ongoing"
    ).length,
    completed: mangas.filter(
      (m) => m.status?.toLowerCase() === "completed"
    ).length,
    hiatus: mangas.filter(
      (m) => m.status?.toLowerCase() === "hiatus"
    ).length
  };

  const filteredMangas = mangas.filter((m) => {
    const matchesSearch = m.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      m.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold ">
              Library Manager
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and control your manga collection
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition"
          >
            <Plus size={18} />
            Add New Manga
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Total Manga" value={stats.total} />
          <StatCard label="Ongoing" value={stats.ongoing} color="text-emerald-600" />
          <StatCard label="Completed" value={stats.completed} color="text-indigo-600" />
          <StatCard label="Hiatus" value={stats.hiatus} color="text-amber-500" />
        </div>

        {/* CONTROLS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl px-5 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
          >
            <option>All Status</option>
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Hiatus</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-slate-400 gap-2 ">
              <Loader2 className="animate-spin" size={20} />
              Syncing Database...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-8 py-5">Entry</th>
                    <th className="px-6 py-5">Author</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-center">Chapters</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMangas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-400 font-medium">
                        No manga entries found
                      </td>
                    </tr>
                  )}

                  {filteredMangas.map((m) => (
                    <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={m.coverImage}
                            alt=""
                            className="w-12 h-16 rounded-xl object-cover shadow ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">
                              {m.title}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              ID: {m._id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {m.author || "Unknown"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <StatusPill status={m.status} />
                      </td>

                      <td className="px-6 py-5 text-center font-semibold">
                        {m.TotalChapter || 0}
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            icon={<Eye size={16} />}
                            onClick={() => {
                              setSelectedManga(m);
                              setIsEditMode(false);
                            }}
                          />
                          <ActionButton
                            icon={<Edit size={16} />}
                            onClick={() => openEdit(m)}
                          />
                          <ActionButton
                            icon={<Trash2 size={16} />}
                            color="hover:text-rose-600"
                            onClick={() => handleDelete(m._id)}
                          />
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
        <Modal
          selectedManga={selectedManga}
          isEditMode={isEditMode}
          isAddMode={isAddMode}
          formData={formData}
          setFormData={setFormData}
          closeModals={closeModals}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

const Modal = ({
  selectedManga,
  isEditMode,
  isAddMode,
  formData,
  setFormData,
  closeModals,
  handleSave
}) => {
  const previewImage =
    isEditMode || isAddMode
      ? formData.coverImage
      : selectedManga?.coverImage;

  const previewStatus =
    isEditMode || isAddMode
      ? formData.status
      : selectedManga?.status;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden">

        {/* LEFT PANEL */}
        <div className="md:w-1/3 bg-slate-50 p-10 flex items-center justify-center border-r border-slate-200">
          <div className="relative">
            {previewImage ? (
              <img
                src={previewImage}
                alt=""
                className="w-52 h-72 object-cover rounded-2xl shadow-xl"
              />
            ) : (
              <div className="w-52 h-72 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                No Cover
              </div>
            )}

            <div className="absolute -bottom-3 -right-3">
              <StatusPill status={previewStatus} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center px-10 py-8 border-b border-slate-200">
            <h2 className="text-2xl font-bold">
              {isAddMode ? "Add Manga" : isEditMode ? "Edit Manga" : "Preview"}
            </h2>
            <button
              onClick={closeModals}
              className="p-2 rounded-full hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6">
            {(isEditMode || isAddMode) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                <Input label="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/>
                <Input label="Cover URL" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})}/>
                <Input label="Chapters" type="number" value={formData.chapters} onChange={e => setFormData({...formData, chapters: e.target.value})}/>
              </div>
            ) : (
              <div className="space-y-6">
                <DetailRow label="Title" value={selectedManga?.title} />
                <DetailRow label="Author" value={selectedManga?.author} />
                <DetailRow label="Chapters" value={selectedManga?.TotalChapter} />
                <DetailRow label="Genres" value={selectedManga?.tags?.join(", ")} />
                <DetailRow label="Description" value={selectedManga?.description} />
              </div>
            )}
          </div>

          {(isEditMode || isAddMode) && (
            <div className="px-10 py-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSave}
                className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = "text-slate-900" }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <p className="text-xs uppercase text-slate-400 font-semibold mb-1">
      {label}
    </p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const StatusPill = ({ status }) => {
  const s = status?.toLowerCase() || "ongoing";
  const styles = {
    ongoing: "bg-emerald-50 text-emerald-600 border-emerald-200",
    completed: "bg-indigo-50 text-indigo-600 border-indigo-200",
    hiatus: "bg-amber-50 text-amber-600 border-amber-200"
  };
  return (
    <span className={`px-4 py-1 text-xs rounded-full border font-semibold ${styles[s]}`}>
      {s}
    </span>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
    />
  </div>
);

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text-slate-400 font-semibold mb-1">
      {label}
    </p>
    <p className="text-base font-medium text-slate-800">
      {value || "—"}
    </p>
  </div>
);

const ActionButton = ({ icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={`p-2.5 rounded-xl text-slate-400 hover:bg-white hover:shadow-md transition ${color}`}
  >
    {icon}
  </button>
);
