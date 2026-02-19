import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  Tag,
  Plus,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Loader2,
  ShieldAlert
} from "lucide-react";
import axios from "axios";
import { useAlert } from "../context/AlertContext";
import { AppContext } from "../UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const CreateSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { isRedMode, currentTheme } = useContext(AppContext);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);

  const accentColor = isRedMode ? "#ef4444" : "var(--accent)";
  const glowClass = isRedMode
    ? "shadow-red-500/20"
    : "shadow-[var(--accent-glow)]";

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAdult, setIsAdult] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    artist: "",
    synopsis: ""
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchSeriesData = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/mangas/${id}`);
          const data = res.data;
          setFormData({
            title: data.title,
            author: data.author || "",
            artist: data.artist || "",
            synopsis: data.description
          });
          setTags(data.tags || []);
          setPreview(data.coverImage);
          setIsAdult(data.isAdult || false);
        } catch (err) {
          showAlert("Failed to load series data", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchSeriesData();
    } else {
      setIsAdult(isRedMode);
    }
  }, [id, isEditMode, isRedMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert("File size must be under 5MB", "error");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    showAlert("Image preview updated", "success");
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("artist", formData.artist);
    data.append("description", formData.synopsis);
    data.append("isAdult", isAdult);
    data.append("tags", JSON.stringify(tags));
    if (imageFile) data.append("coverImage", imageFile);

    try {
      const url = isEditMode
        ? `${API_URL}/api/users/my-mangas/update/${id}`
        : `${API_URL}/api/mangas`;

      const method = isEditMode ? "put" : "post";

      await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showAlert(
        `Series ${isEditMode ? "updated" : "created"} successfully`,
        "success"
      );
      setTimeout(() => navigate("/my-series"), 1200);
    } catch (err) {
      showAlert("Upload failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[var(--accent)]" size={40} />
        <p className="text-xs font-semibold text-[var(--text-dim)] animate-pulse">
          Loading series data...
        </p>
      </div>
    );

  return (
    <div
      className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-all duration-700 theme-${currentTheme} py-3 sm:py-4`}
    >
      <div className="relative z-10 max-w-6xl mx-auto p-3 sm:p-4 md:p-8 pb-24">
        {/* HEADER */}
        <header className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 sm:p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)]/50 transition-all"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none">
              {isEditMode ? "Update" : "Create"}{" "}
              <span style={{ color: accentColor }}>Series</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
              {isEditMode ? `Series ID: ${id}` : "Create a new series"}
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8"
        >
          {/* LEFT */}
          <motion.div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div
              className={`relative aspect-[3/4] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-hidden ${glowClass}`}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <Upload size={36} style={{ color: accentColor }} />
                  <span className="mt-3 text-xs sm:text-sm font-semibold text-[var(--text-dim)]">
                    Upload Cover Image
                  </span>
                </label>
              )}
            </div>

            {/* Adult toggle */}
            <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} />
                <div>
                  <p className="text-sm font-semibold">Adult Content</p>
                  <p className="text-xs text-[var(--text-dim)]">
                    {isAdult ? "18+ only" : "Suitable for all audiences"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdult(!isAdult)}
                className={`w-12 h-6 rounded-full relative ${
                  isAdult ? "bg-red-500" : "bg-gray-400"
                }`}
              >
                <motion.div
                  animate={{ x: isAdult ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                />
              </button>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div className="lg:col-span-8 space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-dim)] mb-3 sm:mb-4">
                <BookOpen size={16} /> Series Information
              </div>

              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]"
                placeholder="Series title"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="p-3 sm:p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]"
                  placeholder="Author"
                />
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  className="p-3 sm:p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]"
                  placeholder="Artist"
                />
              </div>

              <textarea
                required
                rows="4"
                value={formData.synopsis}
                onChange={(e) =>
                  setFormData({ ...formData, synopsis: e.target.value })
                }
                className="w-full p-3 sm:p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]"
                placeholder="Synopsis"
              />
            </div>

            {/* TAGS */}
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-dim)] mb-2 sm:mb-3">
                <Tag size={16} /> Tags
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  className="flex-1 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs"
                  >
                    {tag}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() =>
                        setTags(tags.filter((t) => t !== tag))
                      }
                    />
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${glowClass}`}
              style={{ backgroundColor: accentColor }}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : isEditMode ? (
                "Update Series"
              ) : (
                "Create Series"
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateSeries;
