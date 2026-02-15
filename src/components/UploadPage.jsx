import React, { useState, useContext, useEffect } from 'react';
import { 
  CloudUpload, Trash2, Eye, LayoutDashboard, Settings, Plus, Loader2 
} from 'lucide-react';
import { AppContext } from "../UserContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "../context/AlertContext";
const UploadPage = () => {
  const { isRedMode,currentTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const accentColor = isRedMode ? '#ef4444' : 'var(--accent)';
  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
  // --- FORM STATE ---
  const [myMangas, setMyMangas] = useState([]);
  const [selectedManga, setSelectedManga] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [volumeNum, setVolumeNum] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [quality, setQuality] = useState('high');
  const [compressing, setCompressing] = useState(false);
  const [convertPngToJpeg, setConvertPngToJpeg] = useState(true);
  const [jpegQuality, setJpegQuality] = useState(65); // 30-90
  const [maxWidth, setMaxWidth] = useState(1400);
  const {showAlert}=useAlert();

  // Upload progress & ETA
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // percent
  const [uploadETA, setUploadETA] = useState('');
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [uploadTotalBytes, setUploadTotalBytes] = useState(0);
  const [uploadStartTime, setUploadStartTime] = useState(null);
  
  const [selectedFiles, setSelectedFiles] = useState([]);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(Math.round(bytes / 1024 / 1024 * 100) / 100)} MB`;
  };

  const formatETA = (secs) => {
    if (!secs || !isFinite(secs)) return '—';
    if (secs < 60) return `${Math.round(secs)}s`;
    const mins = Math.round(secs / 60);
    return `${mins}m`;
  };
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

  // Compress an image in the browser (resize + convert to jpeg by default)
  const compressImage = (file) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const MAX_WIDTH = maxWidth || 1400;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          const ratio = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const shouldConvertPng = convertPngToJpeg; // use UI option
        const outputType = (isPng && !shouldConvertPng) ? 'image/png' : 'image/jpeg';
        const qualityNum = (jpegQuality || 65) / 100; // JPEG quality when converting

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          const ext = outputType === 'image/jpeg' ? '.jpg' : '.png';
          const newName = file.name.replace(/\.[^.]+$/, ext);
          const newFile = new File([blob], newName, { type: outputType });
          resolve({ file: newFile, compressedSize: blob.size });
        }, outputType, outputType === 'image/jpeg' ? qualityNum : undefined);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });

  // Get estimated upload time using Network Information API (downlink in Mbps) if available
  const getEstimatedUploadTime = () => {
    const totalBytes = selectedFiles.reduce((sum, f) => sum + (f.currentFile?.size || f.compressedSize || 0), 0);
    if (!totalBytes) return '0s';
    const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const downlink = nav?.downlink; // Mbps
    if (!downlink || downlink <= 0) return '—';
    const seconds = (totalBytes * 8) / (downlink * 1e6);
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.round(seconds / 60);
    return `${mins}m`;
  };

  // Process a list of File objects, compressing them if quality === 'low'.
  // Each entry stores: originalFile, compressedFile (if any), currentFile (what will be uploaded), sizes and a compressed flag.
  const processFiles = async (fileList) => {
    if (quality === 'low') {
      setCompressing(true);
      try {
        const results = await Promise.all(fileList.map(async (file) => {
          const originalSize = file.size;
          try {
            const { file: compressedFile, compressedSize } = await compressImage(file);
            const compressedOk = compressedFile && compressedSize < originalSize;
            const currentFile = compressedOk ? compressedFile : file;
            return {
              id: Math.random().toString(36).substr(2, 9),
              originalFile: file,
              compressedFile: compressedOk ? compressedFile : null,
              currentFile,
              preview: URL.createObjectURL(currentFile),
              originalSize,
              compressedSize: compressedOk ? compressedSize : originalSize,
              compressed: compressedOk
            };
          } catch (err) {
            // On compression error, fallback to original
            return {
              id: Math.random().toString(36).substr(2, 9),
              originalFile: file,
              compressedFile: null,
              currentFile: file,
              preview: URL.createObjectURL(file),
              originalSize,
              compressedSize: originalSize,
              compressed: false
            };
          }
        }));
        setSelectedFiles(prev => [...prev, ...results]);
      } finally {
        setCompressing(false);
      }
    } else {
      const results = fileList.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        originalFile: file,
        compressedFile: null,
        currentFile: file,
        preview: URL.createObjectURL(file),
        originalSize: file.size,
        compressedSize: file.size,
        compressed: false
      }));
      setSelectedFiles(prev => [...prev, ...results]);
    }
  };

  // Compress a single selected file by id
  const compressSingleFile = async (id) => {
    const f = selectedFiles.find(s => s.id === id);
    if (!f || f.compressed) return;
    setCompressing(true);
    try {
      const { file: compressedFile, compressedSize } = await compressImage(f.originalFile);
      if (compressedFile && compressedSize < f.originalSize) {
        URL.revokeObjectURL(f.preview);
        const updated = {
          ...f,
          compressedFile,
          currentFile: compressedFile,
          compressedSize,
          compressed: true,
          preview: URL.createObjectURL(compressedFile)
        };
        setSelectedFiles(prev => prev.map(p => p.id === id ? updated : p));
      }
    } catch (e) {
      // ignore compression failure
    } finally {
      setCompressing(false);
    }
  };

  // Toggle a single file between original and compressed (compresses if needed)
  const toggleFileCompress = async (id) => {
    const f = selectedFiles.find(s => s.id === id);
    if (!f) return;
    if (f.compressed) {
      // revert to original
      URL.revokeObjectURL(f.preview);
      const updated = { ...f, currentFile: f.originalFile, compressed: false, preview: URL.createObjectURL(f.originalFile) };
      setSelectedFiles(prev => prev.map(p => p.id === id ? updated : p));
      return;
    }

    if (f.compressedFile) {
      URL.revokeObjectURL(f.preview);
      const updated = { ...f, currentFile: f.compressedFile, compressed: true, preview: URL.createObjectURL(f.compressedFile) };
      setSelectedFiles(prev => prev.map(p => p.id === id ? updated : p));
      return;
    }

    // Otherwise, compress now
    await compressSingleFile(id);
  };

  // Set all files compressed/uncompressed
  const setAllCompressed = async (shouldCompress) => {
    if (!shouldCompress) {
      // revert all to original
      const reverted = selectedFiles.map(f => ({ ...f, currentFile: f.originalFile, compressed: false, preview: URL.createObjectURL(f.originalFile), compressedSize: f.originalSize }));
      // revoke old previews
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setSelectedFiles(reverted);
      return;
    }

    // compress all uncompressed files
    setCompressing(true);
    try {
      const updated = await Promise.all(selectedFiles.map(async (f) => {
        if (f.compressed) return f;
        try {
          const { file: compressedFile, compressedSize } = await compressImage(f.originalFile);
          if (compressedFile && compressedSize < f.originalSize) {
            URL.revokeObjectURL(f.preview);
            return { ...f, compressedFile, currentFile: compressedFile, compressedSize, compressed: true, preview: URL.createObjectURL(compressedFile) };
          }
          return f;
        } catch (e) {
          return f;
        }
      }));
      setSelectedFiles(updated);
    } finally {
      setCompressing(false);
    }
  };
  // If user switches to 'Low' quality after selecting files, try to compress existing originals
  useEffect(() => {
    const reCompress = async () => {
      if (selectedFiles.length === 0) return;

      if (quality === 'low') {
        // compress any uncompressed files
        const needCompress = selectedFiles.filter(f => !f.compressed);
        if (needCompress.length === 0) return;
        setCompressing(true);
        try {
          const updated = await Promise.all(needCompress.map(async (f) => {
            try {
              const { file: compressedFile, compressedSize } = await compressImage(f.originalFile);
              if (compressedFile && compressedSize < f.originalSize) {
                URL.revokeObjectURL(f.preview);
                return { ...f, compressedFile, currentFile: compressedFile, preview: URL.createObjectURL(compressedFile), compressedSize, compressed: true };
              }
              return f;
            } catch (e) {
              return f;
            }
          }));
          setSelectedFiles(prev => prev.map(p => updated.find(u => u.id === p.id) || p));
        } finally {
          setCompressing(false);
        }
      } else {
        // revert current files to originals (keep compressedFile cached)
        const reverted = selectedFiles.map(f => ({ ...f, currentFile: f.originalFile, compressed: false, preview: URL.createObjectURL(f.originalFile), compressedSize: f.originalSize }));
        // revoke old previews
        selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        setSelectedFiles(reverted);
      }
    };
    reCompress();
  }, [quality]);

  const handleFileChange = async (e) => {
    const incoming = Array.from(e.target.files);
    await processFiles(incoming);
  };

  const removeFile = (id) => {
    const toRemove = selectedFiles.find(f => f.id === id);
    if (toRemove && toRemove.preview) URL.revokeObjectURL(toRemove.preview);
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- DEPLOY LOGIC ---
  const handleDeploy = async () => {
    if (!selectedManga || !chapterNum || selectedFiles.length === 0) {
      return showAlert("Please select a series, chapter number, and upload pages.","error");
    }

    setIsDeploying(true);
    setUploading(true);
    setUploadProgress(0);
    setUploadETA('');
    setUploadedBytes(0);

    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('mangaId', selectedManga);
    formData.append('chapterNumber', chapterNum);
    formData.append('title', chapterTitle);

    // Determine overall quality: low (all compressed), high (none compressed), mixed
    const allCompressed = selectedFiles.every(f => f.compressed);
    const noneCompressed = selectedFiles.every(f => !f.compressed);
    const qualityParam = allCompressed ? 'low' : noneCompressed ? 'high' : 'mixed';
    formData.append('quality', qualityParam);

    // Include compression parameters for server fallback
    formData.append('jpegQuality', jpegQuality);
    formData.append('maxWidth', maxWidth);
    formData.append('convertPngToJpeg', convertPngToJpeg);

    // compute total bytes (best-effort)
    const totalBytes = selectedFiles.reduce((sum, f) => sum + (f.currentFile?.size || f.compressedSize || f.originalSize || 0), 0);
    setUploadTotalBytes(totalBytes);
    const startTime = Date.now();
    setUploadStartTime(startTime);

    // Append each file's currently selected variant
    selectedFiles.forEach((item) => {
      const toUpload = item.currentFile || item.originalFile;
      formData.append('pages', toUpload);
    });

    try {
      const res = await axios.post('http://localhost:5000/api/chapters/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        },
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || totalBytes;
          setUploadedBytes(loaded);
          const percent = total ? Math.round((loaded / total) * 100) : Math.round((loaded / totalBytes) * 100);
          setUploadProgress(percent);

          const elapsed = Math.max(1, (Date.now() - startTime) / 1000);
          const speed = loaded / elapsed; // bytes/sec
          const remaining = Math.max(0, (total || totalBytes) - loaded);
          const etaSecs = speed > 0 ? Math.round(remaining / speed) : null;
          setUploadETA(formatETA(etaSecs));
        }
      });

      if (res.data.success) {
        showAlert("Chapter Deployed to Cloudinary Successfully!","success");
        navigate('/my-series');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Upload failed","error");
    } finally {
      setIsDeploying(false);
      setUploading(false);
      setUploadStartTime(null);
      // keep the progress visible briefly
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] relative overflow-hidden theme-${currentTheme} `}>
      {/* Background Glow */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 pointer-events-none" 
        style={{ backgroundColor: accentColor }} 
      />

      <div className="relative z-10 p-4 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 p-8 rounded-[2.5rem] bg-[var(--bg-secondary)]/40 backdrop-blur-2xl border border-[var(--border)] shadow-2xl">
          <div className="space-y-1">
            <h1 className="text-4xl  font-bold uppercase tracking-tighter italic">
              Studio <span style={{ color: themeColor }}>Upload</span>
            </h1>
            <p className="text-[var(--text-dim)] text-[10px]  font-bold uppercase tracking-[0.4em]">Cloudinary Intelligence Terminal</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: PARAMETERS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-[3rem] bg-[var(--bg-secondary)]/20 border border-border-[var(--border)] shadow-2xl">
              <h2 className="text-[11px]  font-bold uppercase text-[var(--text-dim)] mb-8 flex items-center gap-2">
               <LayoutDashboard size={14} style={{ color: accentColor }} />  Core Parameters
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px]  font-bold uppercase text-[var(--text-dim)] ml-1">Series Selection</label>
                  <select 
                    value={selectedManga}
                    onChange={(e) => setSelectedManga(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-main)] rounded-2xl px-5 py-4 text-xs font-bold appearance-none cursor-pointer outline-none"
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
                    <label className="text-[9px]  font-bold uppercase text-[var(--text-dim)] ml-1">Chapter</label>
                    <input type="number" value={chapterNum} onChange={(e) => setChapterNum(e.target.value)} placeholder="01" className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-2xl px-5 py-4 text-xs outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px]  font-bold uppercase text-[var(--text-dim)] ml-1">Volume</label>
                    <input type="text" value={volumeNum} onChange={(e) => setVolumeNum(e.target.value)} placeholder="--" className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)]rounded-2xl px-5 py-4 text-xs outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px]  font-bold uppercase text-[var(--text-dim)] ml-1">Chapter Title</label>
                  <input type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="The Awakening" className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border)] rounded-2xl px-5 py-4 text-xs outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px]  font-bold uppercase ttext-[var(--text-dim)] ml-1">Upload Quality</label>
                  <div className="flex gap-3 items-center">
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input type="radio" name="quality" value="high" checked={quality === 'high'} onChange={() => setQuality('high')} />
                      <span className=" font-bold uppercase text-[10px] ml-1">High (Original)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input type="radio" name="quality" value="low" checked={quality === 'low'} onChange={() => setQuality('low')} />
                      <span className=" font-bold uppercase text-[10px] ml-1">Low MB (Compressed)</span>
                    </label>
                  </div>
                  <p className="text-[10px] texttext-[var(--text-dim)] italic">Choose <span className=" font-bold">Low MB</span> to compress images before upload (smaller size, faster uploads).</p>

                  {quality === 'low' && (
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" checked={convertPngToJpeg} onChange={(e) => setConvertPngToJpeg(e.target.checked)} />
                          <span className="text-[10px]  font-bold uppercase ml-1">Convert PNG → JPEG for extra savings</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-1/2">
                          <label className="text-[9px]  font-bold uppercase text-text-[var(--text-dim)]">JPEG Quality: <span className="font-bold">{jpegQuality}%</span></label>
                          <input type="range" min={30} max={90} value={jpegQuality} onChange={(e) => setJpegQuality(Number(e.target.value))} className="w-full" />
                        </div>

                        <div className="w-1/2">
                          <label className="text-[9px]  font-bold uppercase text-text-[var(--text-dim)]">Max Width</label>
                          <select value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full bg-[var(--bg-secondary)]/20 border border-border-[var(--border)] rounded-2xl px-3 py-2 text-xs font-bold appearance-none cursor-pointer outline-none">
                            <option value={800}>800</option>
                            <option value={1200}>1200</option>
                            <option value={1400}>1400</option>
                            <option value={2000}>2000</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-[var(--bg-secondary)]/20 border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[12px]  font-bold">
                  <div>Total: <span className="font-bold">
                    {Math.max(0, Math.round(selectedFiles.reduce((sum, f) => sum + (f.originalSize || 0), 0) / 1024 / 1024 * 100) / 100)} MB
                  </span></div>
                  <div>Upload: <span className="font-bold">
                    {Math.max(0, Math.round(selectedFiles.reduce((sum, f) => sum + (f.currentFile?.size || f.compressedSize || 0), 0) / 1024 / 1024 * 100) / 100)} MB
                  </span></div>
                  <div className="text-[11px] text-gray-400">Savings: <span className="font-bold">{selectedFiles.length ? Math.round(((selectedFiles.reduce((s,f)=>s+(f.originalSize||0),0) - selectedFiles.reduce((s,f)=>s+(f.currentFile?.size||f.compressedSize||0),0)) / selectedFiles.reduce((s,f)=>s+(f.originalSize||0),0)) * 100) : 0}%</span></div>
                  <div className="text-[11px] text-gray-400">Est. upload time: <span className="font-bold">{getEstimatedUploadTime()}</span></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setAllCompressed(true)} className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)]/20  font-bold text-[11px]">Use Compressed</button>
                  <button onClick={() => setAllCompressed(false)} className="px-3 py-2 rounded-xl [var(--bg-secondary)]/20  font-bold text-[11px]">Use Original</button>
                </div>
              </div>

              {uploading && (
                <div className="mt-3 space-y-2">
                  <div className="w-full bg-[var(--bg-secondary)]/20 rounded-full h-3 overflow-hidden">
                    <div style={{ width: `${uploadProgress}%` }} className="h-3 bg-green-500 transition-all" />
                  </div>

                  <div className="flex items-center justify-between text-[12px]  font-bold">
                    <div>{uploadProgress}% • {formatBytes(uploadedBytes)} / {formatBytes(uploadTotalBytes)}</div>
                    <div>ETA: <span className="font-bold">{uploadETA}</span></div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleDeploy}
                disabled={isDeploying || compressing || uploading}
                className="w-full py-5 rounded-[1.5rem]  font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ backgroundColor: themeColor, color: '#000' }}
              >
                {isDeploying || compressing || uploading ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />} 
                {isDeploying ? "Uploading..." : uploading ? `${uploadProgress}% Uploading...` : compressing ? "Compressing..." : "Deploy Chapter"}
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
                const incoming = Array.from(e.dataTransfer.files);
                processFiles(incoming);
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
                  <p className="text-xs  font-bold uppercase tracking-widest text-gray-500">Inject Chapter Pages</p>
                  <label className="mt-6 cursor-pointer bg-white text-black px-10 py-4 rounded-2xl text-[10px]  font-bold uppercase tracking-widest inline-block">
                    {compressing ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Compressing...</span>
                    ) : (
                      'Browse Data'
                    )}
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={file.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                      <img src={file.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="preview" />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[8px]  font-bold border border-white/10">
                        P.{idx + 1}
                      </div>

                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[9px]  font-bold border border-white/10">
                        <button onClick={() => toggleFileCompress(file.id)} className={`px-2 py-1 rounded-md text-[10px]  font-bold ${file.compressed ? 'bg-green-500 text-black' : 'bg-white/5 text-white'}`}>
                          {file.compressed ? 'Compressed' : 'Original'}
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[9px]  font-bold border border-white/10">
                        <div className="text-[9px]">
                          {file.currentFile && file.originalSize ? (
                            <>
                              {Math.round((file.currentFile.size || file.compressedSize) / 1024)} KB / {Math.round(file.originalSize / 1024)} KB
                            </>
                          ) : (
                            <>{Math.round(file.originalSize / 1024)} KB</>
                          )}
                        </div>
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