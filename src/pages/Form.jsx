import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
export default function MangaForm() {
  const [formData, setFormData] = useState({
    title: '',
    mangaId: '',
    status: 'Ongoing',
    genres: '',
    description: '',
    chapterCount: 0,
    rating: 0,
    isAdult: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data: Convert genres string to array and strings to numbers
    const submissionData = {
      ...formData,
      mangaId: Number(formData.mangaId),
      chapterCount: Number(formData.chapterCount),
      rating: Number(formData.rating),
      genres: formData.genres.split(',').map(g => g.trim()).filter(g => g !== "")
    };

    try {
      const response = await fetch(`${API_URL}/manga`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Manga added successfully!');
      } else {
        alert(`Error: ${result.message || 'Server Error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2>Add New Manga</h2>

        <label>Title
          <input type="text" name="title" required value={formData.title} onChange={handleChange} style={{ width: '100%' }} />
        </label>

        <label>Manga ID (Unique Number)
          <input type="number" name="mangaId" required value={formData.mangaId} onChange={handleChange} style={{ width: '100%' }} />
        </label>

        <label>Status
          <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%' }}>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Hiatus">Hiatus</option>
          </select>
        </label>

        <label>Genres (Comma separated)
          <input type="text" name="genres" placeholder="Action, Horror" value={formData.genres} onChange={handleChange} style={{ width: '100%' }} />
        </label>

        <label>Description
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} style={{ width: '100%' }} />
        </label>

        <div style={{ display: 'flex', gap: '10px' }}>
          <label>Chapters
            <input type="number" name="chapterCount" value={formData.chapterCount} onChange={handleChange} />
          </label>
          <label>Rating
            <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} />
          </label>
        </div>

        <label>
          <input type="checkbox" name="isAdult" checked={formData.isAdult} onChange={handleChange} /> Is Adult Content?
        </label>

        <button type="submit" style={{ padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit Manga
        </button>
      </form>
    </div>
  );
}