import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
    ThumbsUp, Trash2, X, 
    AlertTriangle, ChevronDown, ChevronUp, 
    Bold, Italic, Smile, Reply, Edit3,
    Flag 
} from 'lucide-react';
import { AppContext } from "../UserContext";
import { useAlert } from '../context/AlertContext';
import ReportModal from './ReportModal'; 

const MAX_CHARS = 1000;

// --- DELETE MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, isRedMode, loading }) => {
    if (!isOpen) return null;
    const accentBg = isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]';
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-[var(--text-main)] mb-2">Delete Comment?</h4>
                    <p className="text-sm text-[var(--text-dim)] mb-8">This action is permanent and cannot be undone.</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-[var(--text-dim)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className={`flex-1 py-2.5 ${accentBg} text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-lg`}>
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMMENT CARD ---
const CommentNode = ({ comment, user, isRedMode, onReply, onVote, onDelete, onReport, isReply = false }) => {
    const [showReplies, setShowReplies] = useState(false);
    const accentClass = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';
    
    const hasLiked = useMemo(() => {
        return comment.likes?.some(id => (id._id || id) === user?._id);
    }, [comment.likes, user?._id]);

    const isOwner = user?._id === (comment.userId?._id || comment.userId);

    return (
        <div className={`w-full ${isReply ? 'pl-4 sm:pl-8 border-l-2 border-[var(--border)] mt-4' : 'border-b border-[var(--border)]/30 pb-6 mt-6'}`}>
            <div className="flex gap-3 items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                    {comment.userId?.profilePicture ? 
                        <img src={comment.userId.profilePicture} className="w-full h-full object-cover" alt="" /> :
                        <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white ${isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]'}`}>
                            {comment.userId?.username?.charAt(0) || "G"}
                        </div>
                    }
                </div>

                <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">{comment.userId?.username}</span>
                            <span className="text-[9px] text-[var(--text-dim)]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isOwner && (
                                <button 
                                    onClick={() => onReport(comment)} 
                                    className="text-[var(--text-dim)] hover:text-orange-500 p-1 transition-colors group"
                                    title="Report Comment"
                                >
                                    <Flag size={12} className="group-hover:fill-orange-500/20" />
                                </button>
                            )}
                            {isOwner && (
                                <button onClick={() => onDelete(comment._id)} className="text-[var(--text-dim)] hover:text-red-500 p-1 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-[13px] sm:text-[14px] text-[var(--text-main)]/80 leading-relaxed mb-3 prose prose-invert max-w-none">
                        <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                        <button 
                            onClick={() => onVote(comment._id)} 
                            className={`flex items-center gap-1.5 transition-all ${hasLiked ? accentClass : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                        >
                            <ThumbsUp size={13} fill={hasLiked ? "currentColor" : "none"} className={hasLiked ? 'scale-110' : ''} /> 
                            <span className="text-[10px] font-bold">{comment.likes?.length || 0}</span>
                        </button>

                        <button onClick={() => onReply({id: comment._id, username: comment.userId?.username})} className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-dim)] hover:text-[var(--text-main)]">
                            <Reply size={12}/> Reply
                        </button>

                        {comment.replies && comment.replies.length > 0 && (
                            <button onClick={() => setShowReplies(!showReplies)} className="text-[11px] font-bold text-blue-500 flex items-center gap-1">
                                {showReplies ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                {showReplies ? "Hide" : `Replies (${comment.replies.length})`}
                            </button>
                        )}
                    </div>

                    {showReplies && comment.replies && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            {comment.replies.map(reply => (
                                <CommentNode 
                                    key={reply._id} 
                                    comment={reply} 
                                    user={user} 
                                    isRedMode={isRedMode} 
                                    onReply={onReply} 
                                    onVote={onVote} 
                                    onDelete={onDelete} 
                                    onReport={onReport} 
                                    isReply={true} 
                                />
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    
    // Reporting States
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);

    useEffect(() => { if (targetId) fetchComments(); }, [targetId]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments/${targetId}?type=${targetType}`);
            const map = {}, roots = [];
            res.data.forEach((item, i) => { map[item._id] = i; res.data[i].replies = []; });
            res.data.forEach(item => {
                if (item.parentId && res.data[map[item.parentId]]) res.data[map[item.parentId]].replies.push(item);
                else roots.push(item);
            });
            setComments(roots);
        } catch (err) { console.error("Fetch error", err); }
    };

    const handleVote = async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) return showAlert("Please log in to like.", "error");

        const findInTree = (list) => {
            for (let c of list) {
                if (c._id === commentId) return c;
                if (c.replies) {
                    const found = findInTree(c.replies);
                    if (found) return found;
                }
            }
            return null;
        };

        const target = findInTree(comments);
        if (!target) return;

        const alreadyLiked = target.likes.some(id => (id._id || id) === user._id);
        const voteTypeToSend = alreadyLiked ? "unlike" : "like";

        setComments(prev => {
            const update = (list) => list.map(c => {
                if (c._id === commentId) {
                    const newLikes = alreadyLiked 
                        ? c.likes.filter(id => (id._id || id) !== user._id) 
                        : [...c.likes, user._id];
                    return { ...c, likes: newLikes };
                }
                if (c.replies) return { ...c, replies: update(c.replies) };
                return c;
            });
            return update(prev);
        });

        try {
            await axios.patch(`http://localhost:5000/api/comments/vote/${commentId}`, 
                { voteType: voteTypeToSend }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) { fetchComments(); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const endpoint = replyTo ? `http://localhost:5000/api/comments/reply/${replyTo.id}` : `http://localhost:5000/api/comments`;
            await axios.post(endpoint, { content: text, targetId, targetType }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setText(""); setReplyTo(null); setIsFocused(false); fetchComments();
            showAlert("Comment posted", "success");
        } catch (err) { showAlert("Error", "error"); } finally { setIsLoading(false); }
    };

    const triggerReport = (comment) => {
        const token = localStorage.getItem('token');
        if (!token) return showAlert("Please log in to report content.", "error");
        
        setSelectedComment(comment);
        setReportModalOpen(true);
    };

    return (
        <section className="w-full max-w-4xl mx-auto mt-4 p-4 sm:p-8 bg-[var(--bg-primary)] rounded-3xl">
            {/* DELETE CONFIRMATION */}
            <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={async () => {
                setIsLoading(true);
                await axios.delete(`http://localhost:5000/api/comments/${pendingDeleteId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                fetchComments(); setIsModalOpen(false); setIsLoading(false);
            }} isRedMode={isRedMode} loading={isLoading} />

            <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border)] pb-4 mb-8">
                Discussion ({comments.length})
            </h3>

            {/* INPUT AREA */}
            {localStorage.getItem('token') ? (
                <div className={`transition-all border rounded-2xl mb-12 overflow-hidden bg-[var(--bg-secondary)]/30 ${isFocused ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                    <form onSubmit={handleSubmit} className="p-4">
                        {replyTo && (
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className={`text-[10px] font-bold uppercase ${isRedMode ? 'text-red-500' : 'text-[var(--accent)]'}`}>Replying to @{replyTo.username}</span>
                                <button type="button" onClick={() => setReplyTo(null)} className="text-red-500"><X size={14} /></button>
                            </div>
                        )}
                        <textarea 
                            value={text}
                            onFocus={() => setIsFocused(true)}
                            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                            placeholder="Share your thoughts..."
                            className="w-full bg-transparent text-sm text-[var(--text-main)] outline-none min-h-[44px] resize-none"
                            style={{ height: isFocused || text ? '100px' : '44px' }}
                        />
                        {(isFocused || text) && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border)]">
                                <span className="text-[10px] text-[var(--text-dim)]">{text.length}/{MAX_CHARS}</span>
                                <button className={`text-white text-xs font-bold px-6 py-2 rounded-full ${isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]'}`}>
                                    {isLoading ? "..." : "Post"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                <div className="p-8 border border-dashed border-[var(--border)] rounded-2xl text-center mb-8">
                    <p className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider">Sign in to join the discussion</p>
                </div>
            )}

            {/* COMMENTS LIST */}
            <div className="space-y-2">
                {comments.length > 0 ? comments.map(c => (
                    <CommentNode 
                        key={c._id} 
                        comment={c} 
                        user={user} 
                        isRedMode={isRedMode} 
                        onReply={setReplyTo} 
                        onVote={handleVote} 
                        onDelete={(id) => {setPendingDeleteId(id); setIsModalOpen(true);}} 
                        onReport={triggerReport}
                    />
                )) : (
                    <p className="text-center text-[var(--text-dim)] py-10 italic">No comments yet. Start the conversation!</p>
                )}
            </div>

            {/* REPORT MODAL */}
            {selectedComment && (
                <ReportModal 
                    isOpen={reportModalOpen}
                    onClose={() => {setReportModalOpen(false); setSelectedComment(null);}}
                    targetId={selectedComment._id}
                    targetType="comment"
                    targetUser={selectedComment.userId?._id || selectedComment.userId}
                    extraData={{
                        contentSnippet: selectedComment.content?.substring(0, 50),
                        authorName: selectedComment.userId?.username
                    }}
                />
            )}
        </section>
    );
};

export default CommentSection;