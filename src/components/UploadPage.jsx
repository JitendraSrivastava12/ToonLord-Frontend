import React, { useState, useContext, useEffect } from 'react';
import { 
  CloudUpload, Trash2, Eye, LayoutDashboard, Settings, Plus, Loader2 
} from 'lucide-react';
import { AppContext } from "../UserContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const { isRedMode } = useContext(AppContext);
  const navigate = useNavigate();
  
  // --- FORM STATE ---
  const [myMangas, setMyMangas] = useState([]);
  const [selectedManga, setSelectedManga] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [volumeNum, setVolumeNum] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const themeColor = isRedMode ? '#ef4444' : '#22c55e';

  // 1. Fetch user-created series on mount
  useEffect(() => {
    const fetchMyMangas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/my-mangas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyMangas(res.data);
        if (res.data.length > 0) setSelectedManga(res.data[0]._id);
      } catch (err) {
        console.error("Failed to load your series", err);
      }
    };
    fetchMyMangas();
  }, []);

  // Memory Cleanup for previews
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [selectedFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- DEPLOY LOGIC ---
  const handleDeploy = async () => {
    if (!selectedManga || !chapterNum || selectedFiles.length === 0) {
      return alert("Please select a series, chapter number, and upload pages.");
    }

    setIsDeploying(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('mangaId', selectedManga);
    formData.append('chapterNumber', chapterNum);
    formData.append('title', chapterTitle);
    
    // Append each file to the 'pages' array for Multer (original quality - no compression)
    selectedFiles.forEach((item) => {
      formData.append('pages', item.file);
    });

    try {
      const res = await axios.post('http://localhost:5000/api/chapters/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      if (res.data.success) {
        alert("Chapter Deployed to Cloudinary Successfully!");
        navigate('/my-series');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: themeColor }} />

      <div className="relative z-10 p-4 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Studio <span style={{ color: themeColor }}>Upload</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Cloudinary Intelligence Terminal</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: PARAMETERS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/10 shadow-2xl">
              <h2 className="text-[11px] font-black uppercase text-gray-400 mb-8 flex items-center gap-2">
                <LayoutDashboard size={14} style={{ color: themeColor }} /> Core Parameters
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Series Selection</label>
                  <select 
                    value={selectedManga}
                    onChange={(e) => setSelectedManga(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold appearance-none cursor-pointer outline-none"
                  >
                    {myMangas.length > 0 ? (
                      myMangas.map(m => <option key={m._id} value={m._id}>{m.title}</option>)
                    ) : (
                      <option disabled>No series found. Create one first!</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Chapter</label>
                    <input type="number" value={chapterNum} onChange={(e) => setChapterNum(e.target.value)} placeholder="01" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Volume</label>
                    <input type="text" value={volumeNum} onChange={(e) => setVolumeNum(e.target.value)} placeholder="--" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Chapter Title</label>
                  <input type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="The Awakening" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-3">
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ backgroundColor: themeColor, color: '#000' }}
              >
                {isDeploying ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />} 
                {isDeploying ? "Uploading..." : "Deploy Chapter"}
              </button>
            </div>
          </div>

          {/* RIGHT: DROPZONE */}
          <div className="lg:col-span-8">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const files = Array.from(e.dataTransfer.files).map(file => ({
                    file,
                    preview: URL.createObjectURL(file),
                    id: Math.random().toString(36).substr(2, 9)
                }));
                setSelectedFiles(prev => [...prev, ...files]);
              }}
              className={`h-full min-h-[500px] p-8 rounded-[3.5rem] border-2 border-dashed transition-all ${
                dragActive ? 'border-white/40 bg-white/5' : 'border-white/5 bg-black/20'
              }`}
            >
              {selectedFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">Inject Chapter Pages</p>
                  <label className="mt-6 cursor-pointer bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-block">
                    Browse Data
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={file.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                      <img src={file.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="preview" />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[8px] font-black border border-white/10">
                        P.{idx + 1}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button onClick={() => removeFile(file.id)} className="p-2 bg-red-500/20 rounded-xl hover:bg-red-500 text-red-500 hover:text-white transition-colors">
                            <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center hover:bg-white/5 transition-all cursor-pointer">
                    <Plus size={32} className="text-gray-700" />
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;