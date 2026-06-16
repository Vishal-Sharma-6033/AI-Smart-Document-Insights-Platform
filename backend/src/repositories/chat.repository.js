import { Chat } from '../models/Chat.model.js';

export const chatRepository = {
  create(data) {
    return Chat.create(data);
  },

  listForUser(userId, { documentId, limit = 50, skip = 0 } = {}) {
    const filter = { userId };
    if (documentId) filter.documentId = documentId;
    return Chat.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  countForUser(userId, { documentId } = {}) {
    const filter = { userId };
    if (documentId) filter.documentId = documentId;
    return Chat.countDocuments(filter).exec();
  },

  deleteByIdForUser(id, userId) {
    return Chat.findOneAndDelete({ _id: id, userId }).exec();
  },

  deleteForDocument(documentId, userId) {
    return Chat.deleteMany({ documentId, userId }).exec();
  },
};

export default chatRepository;
