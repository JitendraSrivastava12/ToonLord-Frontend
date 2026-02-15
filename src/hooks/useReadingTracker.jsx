import { useEffect, useRef } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
export const useReadingTracker = (mangaId, chapterNumber, currentPage, genre) => {
  const heartbeatTimer = useRef(null);

  useEffect(() => {
    if (!mangaId || !chapterNumber) return;

    const sendHeartbeat = async () => {
      // Don't send heartbeat if user is in another tab
      if (document.hidden) return;

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/api/analytics/heartbeat`, {
          mangaId,
          chapterNumber,
          pageNumber: currentPage,
          genre
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Heartbeat sync failed", err);
      }
    };

    // Send immediate heartbeat on load
    sendHeartbeat();

    // Set interval for every 30 seconds
    heartbeatTimer.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
  }, [mangaId, chapterNumber, currentPage, genre]); // Re-sync if chapter or page changes
};