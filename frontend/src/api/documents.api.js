import { api } from './axios.js';

export const documentsApi = {
  list: (params) => api.get('/documents', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/documents/${id}`).then((r) => r.data.data.document),
  remove: (id) => api.delete(`/documents/${id}`).then((r) => r.data),
  upload: (file, title, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    return api
      .post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => r.data.data.document);
  },
};

export default documentsApi;
