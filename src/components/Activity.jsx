import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, MessageSquare, Star, Award, Zap, Clock, Bookmark } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/users/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // --- FRONTEND FILTERING ---
        // Includes 'reader' (history) and 'system' (welcome/milestones)
        const filtered = res.data;
        
        setActivities(filtered);
      } catch (err) {
        console.error("Failed to load activity feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'reading': return <BookOpen className="text-blue-400" size={18} />;
      case 'comment_posted':
      case 'reply_posted': return <MessageSquare className="text-emerald-400" size={18} />;
      case 'bookmark': return <Bookmark className="text-yellow-400" size={18} />;
      case 'welcome': return <Zap className="text-orange-500" size={18} />;
      case 'milestone_reached': return <Award className="text-purple-400" size={18} />;
      default: return <Clock className="text-gray-400" size={18} />;
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto p-10 text-center text-gray-500 animate-pulse">
      Syncing your activity...
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#0d0f14] min-h-screen text-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Clock className="text-blue-500" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Personal Feed</h2>
          <p className="text-xs text-gray-500 uppercase tracking-tighter">History & Achievements</p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((act, index) => (
            <div 
              key={index}
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                act.category === 'system' 
                  ? 'bg-purple-900/10 border-purple-500/20' 
                  : 'bg-[#161821] border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Icon Circle */}
              <div className={`p-3 rounded-full ${
                act.category === 'system' ? 'bg-purple-500/20' : 'bg-gray-900'
              }`}>
                {getIcon(act.type)}
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    act.category === 'system' ? 'text-purple-400' : 'text-gray-500'
                  }`}>
                    {act.category}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-gray-200 leading-tight">
                  {act.description}
                </p>
                
                {act.contentSnippet && (
                  <p className="mt-2 text-xs text-gray-500 italic line-clamp-1">
                    "{act.contentSnippet}"
                  </p>
                )}
              </div>

              {/* Status Indicator for Reader category */}
              {act.type === 'reading' && (
                <div className="hidden group-hover:block transition-all">
                  <Zap size={14} className="text-blue-500 animate-pulse" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-[#161821] rounded-2xl border border-dashed border-gray-800">
            <p className="text-gray-600 italic">Your journey is just beginning.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivity;