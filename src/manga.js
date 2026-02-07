export const activities = [
  { id: 1, type: 'chapter_published', title: 'Chapter 42 Published', description: 'New chapter "The Awakening" is now live.', mangaTitle: 'Neon Genesis', date: '2026-02-04' },
  { id: 2, type: 'milestone', title: '1 Million Views!', description: 'Your series has reached a massive milestone.', mangaTitle: 'Neon Genesis', date: '2026-02-03' },
  { id: 3, type: 'comment_received', title: 'New Review', description: 'User "Arisaka" left a 5-star review.', mangaTitle: 'Cyber Soul', date: '2026-02-02' },
  { id: 4, type: 'like_received', title: 'New Fan!', description: '12 users added your manga to favorites.', mangaTitle: 'Shadow District', date: '2026-02-01' },
];

export const mangas = [
  { id: '1', title: 'Neon Genesis', views: 1200000, likes: 45000, chapters: 179, rating: 4.9, status: 'ongoing', coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', genre: 'Sci-Fi', publishedDate: '2025-01-01', lastUpdated: '2026-02-01' },
  { id: '2', title: 'Shadow District', views: 890000, likes: 32000, chapters: 45, rating: 4.7, status: 'hiatus', coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', genre: 'Action', publishedDate: '2025-06-12', lastUpdated: '2026-01-15' },
];

export const comments = [
  { id: 1, user: 'Arisaka', content: 'The art style is breathtaking. Can\'t wait for the next chapter!', rating: 5, likes: 124, mangaId: '1', mangaTitle: 'Neon Genesis', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arisaka', date: '2026-02-04' },
  { id: 2, user: 'Kenji_99', content: 'Pacing is a bit slow, but the world-building is top notch.', rating: 4, likes: 45, mangaId: '1', mangaTitle: 'Neon Genesis', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji', date: '2026-02-03' },
];