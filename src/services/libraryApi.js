import axios from 'axios';

const API_URL = 'http://localhost:5000/api/library';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchUserLibrary = () => axios.get(API_URL, getAuthHeader());

export const updateMangaStatus = (data) => axios.post(`${API_URL}/update`, data, getAuthHeader());
// Add this to your libraryApi.js
export const removeFromLibrary = async (mangaId, status) => {
  return await axios.post(`${API_URL}/remove`, { mangaId, status }, getAuthHeader());
};