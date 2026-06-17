import { api } from './axios.js';

export const aiApi = {
  chat: ({ documentId, question }) =>
    api.post('/chat', { documentId, question }).then((r) => r.data.data),
  summary: (documentId) =>
    api.post('/summary', { documentId }).then((r) => r.data.data.summary),
  listChats: (params) => api.get('/chats', { params }).then((r) => r.data.data),
  deleteChat: (id) => api.delete(`/chats/${id}`).then((r) => r.data),
};

export default aiApi;
