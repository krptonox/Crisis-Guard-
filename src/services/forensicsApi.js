// Forensics API — calls the Node.js backend for evidence upload, retrieval, etc.
// Always uses /api path so Vite proxy handles the routing to localhost:5000
import axios from 'axios';

// In dev: Vite proxies /api → http://localhost:5000
// In prod: set VITE_API_BASE_URL to your deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silent fail for 502/503/connect errors - backend may not be running
    if (!error.response || error.response.status >= 500) {
      console.warn('Forensics backend unavailable:', error.message);
    } else {
      console.error('Forensics API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

/** Upload evidence file for forensic analysis */
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
    onUploadProgress: onProgress,
  });
  return response.data;
};

/** Get a single evidence record by ID */
export const getEvidence = async (id) => {
  const response = await api.get(`/evidence/${id}`);
  return response.data;
};

/** Get all evidences (paginated/filtered) */
export const getAllEvidences = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.verdict && filters.verdict !== 'All') params.set('verdict', filters.verdict);
    if (filters.fileType && filters.fileType !== 'All') params.set('fileType', filters.fileType.toLowerCase());
    if (filters.search) params.set('search', filters.search);
    params.set('limit', filters.limit || 100);

    const response = await api.get(`/evidences?${params.toString()}`);
    if (response.data && Array.isArray(response.data.evidences)) return response.data.evidences;
    if (Array.isArray(response.data)) return response.data;
    return [];
  } catch {
    // Backend offline — return empty list gracefully
    return [];
  }
};

/** Trigger re-analysis on an existing evidence file */
export const reanalyzeEvidence = async (id) => {
  const response = await api.post(`/reanalyze/${id}`);
  return response.data;
};

/** Get aggregate stats summary */
export const getStats = async () => {
  const response = await api.get('/evidences/stats/summary');
  return response.data;
};

/** Get timeline of recent 50 results */
export const getTimeline = async () => {
  const response = await api.get('/evidences/timeline');
  return response.data;
};

/** Delete an evidence record */
export const deleteEvidence = async (id) => {
  const response = await api.delete(`/evidence/${id}`);
  return response.data;
};

/** Export all evidence as CSV download */
export const exportCSV = () => {
  window.open(`${API_BASE_URL}/evidences/export/csv`, '_blank');
};

export default api;
