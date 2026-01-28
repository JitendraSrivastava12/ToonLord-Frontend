import React, { useState, useEffect, useContext } from 'react';
import { 
  CloudUpload, FileText, Layers, Type, CheckCircle, 
  X, Plus, Trash2, Eye, LayoutDashboard, Settings
} from 'lucide-react';
import { AppContext } from "../UserContext"; // Path to your Master Context

const UploadPage = () => {
  // 1. Consume Master Context for cross-tab theme sync
  const { isRedMode } = useContext(AppContext);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const themeColor = isRedMode ? '#ef4444' : '#22c55e';

  // 2. Memory Cleanup: Revoke object URLs when component unmounts
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
    setSelectedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      // Revoke the specific URL being removed
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-white relative overflow-hidden transition-colors duration-500">
      
      {/* --- BACKGROUND GLOW ACCENTS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-all duration-700" style={{ backgroundColor: themeColor }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-10 bg-blue-500" />

      <div className="relative z-10 p-4 md:p-10 max-w-7xl mx-auto">
        
        {/* --- GLASS HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Studio <span style={{ color: themeColor }} className="transition-colors duration-500">Upload</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Integrated Intelligence Terminal</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-gray-500 uppercase">System Status</p>
              <p className="text-xs font-bold text-green-400">ONLINE / ENCRYPTED</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Settings size={20} className="text-gray-400" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: METADATA --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                <LayoutDashboard size={14} style={{ color: themeColor }} className="transition-colors" /> Core Parameters
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Series Selection</label>
                  <select className="w-full bg-[#0a0b10] border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer">
                    <option>Spirit Hunter X</option>
                    <option>Classroom of the Elite</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Chapter</label>
                    <input type="text" placeholder="Ch. 45" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-white/30 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Volume</label>
                    <input type="text" placeholder="--" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-white/30 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Identity Protocol</label>
                  <input type="text" placeholder="The Final Awakening" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-white/30 transition-all" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md border border-white/10 space-y-3">
              <button className="w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 hover:brightness-110"
                style={{ backgroundColor: themeColor, color: '#000' }}>
                <CloudUpload size={18} /> Deploy Chapter
              </button>
              <button className="w-full py-5 bg-white/5 border border-white/10 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 hover:text-white transition-all">
                Save Draft
              </button>
            </div>
          </div>

          {/* --- RIGHT: ASSET DROPZONE --- */}
          <div className="lg:col-span-8">
            <div className="h-full p-2 rounded-[3.5rem] bg-white/[0.01] backdrop-blur-sm border border-white/5 relative overflow-hidden">
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 px-4">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <CloudUpload size={16} style={{ color: themeColor }} className="transition-colors" /> Page Assets
                  </h2>
                </div>

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
                  className={`flex-1 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center min-h-[400px] ${
                    dragActive ? 'border-white/40 bg-white/5' : 'border-white/5 bg-black/20'
                  }`}
                >
                  {selectedFiles.length === 0 ? (
                    <div className="text-center group cursor-pointer">
                      <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500">Inject Intelligence Pages</p>
                      <label className="mt-6 cursor-pointer bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all inline-block">
                        Browse Data
                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 overflow-y-auto no-scrollbar">
                      {selectedFiles.map((file, idx) => (
                        <div key={file.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl animate-in zoom-in-95">
                          <img src={file.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="preview" />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[8px] font-black border border-white/10">
                            P.{idx + 1}
                          </div>
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                            <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white"><Eye size={16}/></button>
                            <button 
                                onClick={() => removeFile(file.id)}
                                className="p-2 bg-red-500/20 rounded-xl hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                            >
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
      </div>
    </div>
  );
};

export default UploadPage;