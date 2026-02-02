import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
    ThumbsUp, ThumbsDown, Trash2, X, 
    AlertTriangle, ChevronDown, ChevronUp, 
    Bold, Italic, Smile, Reply, Edit3 
} from 'lucide-react';
import { AppContext } from "../UserContext";
import { useAlert } from '../context/AlertContext';

const MAX_CHARS = 1000;

// --- DELETE MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, isRedMode, loading }) => {
    if (!isOpen) return null;
    const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';
    const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ${accentText}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-[var(--text-main)] mb-2">Delete Comment?</h4>
                    <p className="text-sm text-[var(--text-dim)] mb-8 text-center px-4">This action is permanent and cannot be undone.</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-[var(--text-dim)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className={`flex-1 py-2.5 ${accentBg} text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-lg transition-opacity`}>
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMMENT CARD COMPONENT ---
const CommentNode = ({ comment, user, isRedMode, onReply, onVote, onDelete, handleInsertText, isReply = false }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    
    const accentClass = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
    const accentBorder = isRedMode ? 'border-red-600/20' : 'border-[var(--border)]';
    const editorId = `edit-${comment._id}`;
    
    const hasLiked = comment.likes?.includes(user?._id);
    const hasDisliked = comment.dislikes?.includes(user?._id);
    const isOwner = user?._id === (comment.userId?._id || comment.userId);

    return (
        <div className={`group w-full ${isReply ? 'pl-4 sm:pl-8 border-l-2 border-[var(--border)] mt-4 animate-in slide-in-from-left-2' : 'border-b border-[var(--border)]/30 pb-6 mt-6'}`}>
            <div className="flex gap-3 sm:gap-4 items-start">
                {/* Profile Picture */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border ${accentBorder} overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)]`}>
                    {comment.userId?.profilePicture ? 
                        <img src={comment.userId.profilePicture} className="w-full h-full object-cover" alt="" /> :
                        <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]'} text-white`}>
                            {comment.userId?.username?.charAt(0) || "G"}
                        </div>
                    }
                </div>

                <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">{comment.userId?.username || "Guest"}</span>
                            <span className="text-[9px] sm:text-[10px] text-[var(--text-dim)] opacity-70 italic">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isOwner && !isEditing && (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="text-[var(--text-dim)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all p-1">
                                        <Edit3 size={13}/>
                                    </button>
                                    <button onClick={() => onDelete(comment._id)} className="text-[var(--text-dim)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                        <Trash2 size={13} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="mt-2 space-y-2">
                            <textarea 
                                id={editorId}
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--accent)] rounded-xl p-3 text-sm text-[var(--text-main)] outline-none min-h-[100px] resize-none"
                            />
                            <div className="flex justify-between items-center">
                                <div className="flex gap-3 text-[var(--text-dim)]">
                                    <button type="button" onClick={() => handleInsertText("**", "**", editorId, editText, setEditText)}><Bold size={14}/></button>
                                    <button type="button" onClick={() => handleInsertText("_", "_", editorId, editText, setEditText)}><Italic size={14}/></button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold text-[var(--text-dim)] px-3 py-1 uppercase">Cancel</button>
                                    <button className={`text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase ${isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]'}`}>Save</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-[13px] sm:text-[14px] text-[var(--text-main)]/80 leading-relaxed mb-3 prose prose-invert max-w-none">
                            <ReactMarkdown>{comment.content}</ReactMarkdown>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-4">
                            <button onClick={() => onVote(comment._id, 'like')} className={`flex items-center gap-1.5 transition-all ${hasLiked ? accentClass : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}>
                                <ThumbsUp size={12} fill={hasLiked ? "currentColor" : "none"} /> 
                                <span className="text-[10px] font-bold">{comment.likes?.length || 0}</span>
                            </button>
                            <button onClick={() => onVote(comment._id, 'dislike')} className={`flex items-center gap-1.5 transition-all ${hasDisliked ? 'text-orange-500' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}>
                                <ThumbsDown size={12} fill={hasDisliked ? "currentColor" : "none"} /> 
                                <span className="text-[10px] font-bold">{comment.dislikes?.length || 0}</span>
                            </button>
                        </div>

                        <button onClick={() => onReply({id: comment._id, username: comment.userId?.username})} className={`flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-dim)] hover:${accentClass} transition-all`}>
                            <Reply size={12}/> Reply
                        </button>

                        {comment.replies && comment.replies.length > 0 && (
                            <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-all">
                                {showReplies ? <ChevronUp size={12}/> : <ChevronDown size={12} />}
                                {showReplies ? "Hide" : `Replies (${comment.replies.length})`}
                            </button>
                        )}
                    </div>

                    {showReplies && comment.replies && (
                        <div className="overflow-hidden animate-in slide-in-from-top-2">
                            {comment.replies.map(reply => (
                                <CommentNode key={reply._id} comment={reply} user={user} isRedMode={isRedMode} onReply={onReply} onVote={onVote} onDelete={onDelete} handleInsertText={handleInsertText} isReply={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN SECTION ---
const CommentSection = ({ targetId, targetType }) => {
    const { isRedMode, user } = useContext(AppContext);
    const { showAlert } = useAlert();
    
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const accentClass = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
    const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';

    useEffect(() => { if (targetId) fetchComments(); }, [targetId, targetType]);

    // SORTING LOGIC
    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => {
            if (sortBy === "popular") {
                const scoreA = (a.likes?.length || 0) + (a.replies?.length || 0);
                const scoreB = (b.likes?.length || 0) + (b.replies?.length || 0);
                return scoreB - scoreA;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [comments, sortBy]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments/${targetId}?type=${targetType}`);
            const map = {}, roots = [];
            res.data.forEach((item, i) => { map[item._id] = i; res.data[i].replies = []; });
            res.data.forEach((item) => {
                if (item.parentId && res.data[map[item.parentId]]) res.data[map[item.parentId]].replies.push(item);
                else roots.push(item);
            });
            setComments(roots);
        } catch (err) { console.error("Sync error", err); }
    };

    const handleInsertText = (before, after, inputId, currentVal, setter) => {
        const textarea = document.getElementById(inputId);
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const result = currentVal.substring(0, start) + before + currentVal.substring(start, end) + after + currentVal.substring(end);
        setter(result);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!text.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const endpoint = replyTo ? `http://localhost:5000/api/comments/reply/${replyTo.id}` : `http://localhost:5000/api/comments`;
            await axios.post(endpoint, { content: text, targetId, targetType }, { headers: { Authorization: `Bearer ${token}` } });
            setText(""); setReplyTo(null); setIsFocused(false); fetchComments();
            showAlert("Comment posted", "success");
        } catch (err) { showAlert("Error posting comment", "error"); } finally { setIsLoading(false); }
    };

    const handleVote = async (commentId, voteType) => {
        const token = localStorage.getItem('token');
        if (!token) return showAlert("Please log in to vote.", "error");
        try {
            await axios.patch(`http://localhost:5000/api/comments/vote/${commentId}`, { voteType }, { headers: { Authorization: `Bearer ${token}` } });
            fetchComments();
        } catch (err) { console.error("Vote error."); }
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/comments/${pendingDeleteId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            fetchComments();
            showAlert("Deleted successfully", "success");
        } catch (err) { showAlert("Delete failed", "error"); } finally { setIsModalOpen(false); setIsLoading(false); }
    };

    return (
        <section className="w-full max-w-4xl mx-auto mt-4 p-4 sm:p-8 bg-[var(--bg-primary)] rounded-3xl">
            <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} isRedMode={isRedMode} loading={isLoading} />

            {/* HEADER & SORTING */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-8 gap-4">
                <h3 className="text-lg font-bold text-[var(--text-main)]">Discussion ({comments.length})</h3>
                <div className="flex gap-4 items-center">
                    {['newest', 'popular'].map(type => (
                        <button 
                            key={type} 
                            onClick={() => setSortBy(type)} 
                            className={`text-[11px] font-bold uppercase tracking-widest transition-all pb-1 ${
                                sortBy === type 
                                ? `${accentClass} border-b-2 ${isRedMode ? 'border-red-500' : 'border-[var(--accent)]'}` 
                                : "text-[var(--text-dim)]"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* EXPANDABLE INPUT */}
            {localStorage.getItem('token') ? (
                <div className={`transition-all border rounded-2xl mb-12 overflow-hidden ${isFocused ? `border-[var(--accent)] bg-[var(--bg-secondary)] shadow-xl` : `border-[var(--border)] bg-[var(--bg-secondary)]/30`}`}>
                    <form onSubmit={handleSubmit} className="p-4 text-left">
                        {replyTo && (
                            <div className="flex justify-between items-center mb-3 px-2">
                                <span className={`text-[10px] font-bold uppercase ${accentClass}`}>Replying to @{replyTo.username}</span>
                                <button type="button" onClick={() => setReplyTo(null)} className="text-red-500"><X size={14} /></button>
                            </div>
                        )}
                        <textarea 
                            id="main-editor"
                            value={text}
                            onFocus={() => setIsFocused(true)}
                            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                            placeholder="Share your thoughts..."
                            className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none resize-none min-h-[44px] transition-all"
                            style={{ height: isFocused || text ? '120px' : '44px' }}
                        />
                        {(isFocused || text) && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-[var(--border)] gap-4 animate-in fade-in">
                                <div className="flex gap-6 text-[var(--text-dim)]">
                                    <button type="button" onClick={() => handleInsertText("**", "**", "main-editor", text, setText)} className={`hover:${accentClass}`}><Bold size={16}/></button>
                                    <button type="button" onClick={() => handleInsertText("_", "_", "main-editor", text, setText)} className={`hover:${accentClass}`}><Italic size={16}/></button>
                                    <div className="relative">
                                        <button type="button" onClick={() => setShowEmoji(!showEmoji)} className={`hover:${accentClass}`}><Smile size={16}/></button>
                                        {showEmoji && (
                                            <div className="absolute bottom-10 left-0 z-50 p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl flex gap-2 shadow-2xl">
                                                {['🔥', '❤️', '😂', '💀', '👍'].map(emoji => (
                                                    <button key={emoji} type="button" onClick={() => { handleInsertText(emoji, "", "main-editor", text, setText); setShowEmoji(false); }} className="hover:scale-125 transition-transform">{emoji}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-[10px] font-mono text-[var(--text-dim)]">{text.length}/{MAX_CHARS}</span>
                                    <button disabled={isLoading || !text.trim()} className={`${accentBg} text-white text-xs font-bold px-8 py-2.5 rounded-full hover:opacity-90 disabled:opacity-30 transition-all shadow-lg`}>
                                        {isLoading ? "..." : "Post"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                <div className="p-10 border border-dashed border-[var(--border)] rounded-3xl text-center mb-12">
                    <p className="text-[11px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Sign in to join the discussion</p>
                </div>
            )}

            {/* LIST */}
            <div className="space-y-2">
                {sortedComments.length > 0 ? sortedComments.map((comment) => (
                    <CommentNode 
                        key={comment._id} 
                        comment={comment} 
                        user={user} 
                        isRedMode={isRedMode} 
                        onReply={setReplyTo} 
                        onVote={handleVote} 
                        onDelete={(id) => { setPendingDeleteId(id); setIsModalOpen(true); }} 
                        handleInsertText={handleInsertText} 
                    />
                )) : (
                    <p className="text-center text-[var(--text-dim)] py-12 italic">No comments yet. Start the conversation!</p>
                )}
            </div>
        </section>
    );
};

export default CommentSection;