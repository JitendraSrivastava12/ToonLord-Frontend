import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  MessageSquare, Trash2, ArrowUpRight, Search, 
  MoreHorizontal, Calendar, BookOpen, Heart,
  Loader2, AlertCircle
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
const API_URL = import.meta.env.VITE_API_URL;
const CreatorComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  const [replyText, setReplyText] = useState({});
  const {showAlert}=useAlert();
  const fetchComments = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Ensure your backend is using the "Deep Population" controller we discussed
      const res = await axios.get(`${API_URL}/api/comments/creator`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to sync comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const filteredComments = useMemo(() => {
    return comments.filter(c => {
      const contentMatch = (c.content || "").toLowerCase().includes(searchQuery.toLowerCase());
      const userMatch = (c.userId?.username || "").toLowerCase().includes(searchQuery.toLowerCase());
      // Also search by Manga Title
      const titleMatch = (c.onModelId?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSearch = contentMatch || userMatch || titleMatch;
      const matchesFilter = filterType === "all" || c.onModel === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [comments, searchQuery, filterType]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComments(prev => prev.filter(c => c._id !== id));
    } catch (err) { 
        console.error(err);
        showAlert("Delete failed",'error'); 
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText[parentId]) return;
    try {
      await axios.post(`${API_URL}/api/comments/reply/${parentId}`, 
        { 
          content: replyText[parentId],
          targetId: comments.find(c => c._id === parentId)?.onModelId?._id,
          targetType: comments.find(c => c._id === parentId)?.onModel
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReplyText({ ...replyText, [parentId]: "" });
      showAlert("Reply posted!",'success');
      fetchComments();
    } catch (err) { 
        console.error(err);
        showAlert("Reply failed",'error'); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Feedback Hub</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Registry of all reader interactions</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search users, series, or text..." 
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs focus:border-red-500 outline-none w-64 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none cursor-pointer"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Content</option>
            <option value="manga">Series Only</option>
            <option value="chapter">Chapters Only</option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div key={comment._id} className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden hover:border-red-500/30 transition-all group">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center font-black italic text-xl">
                      <img src={comment.userId?.profilePicture ||""}/>
                    </div>
                    <div>
                      <h3 className="font-black uppercase italic tracking-wide">{comment.userId?.username || "Deleted User"}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase">
                          <Calendar size={12}/> {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        
                        {/* --- THE FIX IS HERE --- */}
                        <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${comment.onModel === 'manga' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          <BookOpen size={10}/> 
                          {comment.onModel === 'chapter' 
                            ? `${comment.onModelId?.title} — CH.${comment.onModelId?.chapterNumber}` 
                            : comment.onModelId?.title || "Unknown Series"}
                        </span>
                        {/* ----------------------- */}
                        
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(comment._id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                <div className="ml-16 mb-8">
                  <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-red-500/30 pl-6 italic py-1">
                    "{comment.content}"
                  </p>
                </div>

                <div className="ml-16 relative">
                  <input 
                    type="text" 
                    placeholder="Type a response to this reader..." 
                    value={replyText[comment._id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-6 pr-16 text-xs outline-none focus:border-red-500/50 italic transition-all"
                  />
                  <button 
                    onClick={() => handleReply(comment._id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 p-2 rounded-xl hover:bg-red-500 active:scale-90 transition-all shadow-lg shadow-red-600/20 text-white"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] px-8 py-3 border-t border-white/5 flex items-center gap-6">
                <div className="flex items-center gap-1 text-gray-500 font-bold text-[10px] uppercase">
                  <Heart size={12} className="text-red-500" /> {comment.likes?.length || 0} Likes
                </div>
                <div className="flex items-center gap-1 text-gray-500 font-bold text-[10px] uppercase">
                  <MessageSquare size={12} className="text-blue-500" /> {comment.replies?.length || 0} Replies
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-gray-700" size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase italic text-gray-600">No Feedback Found</h2>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Search query returned zero results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorComments;