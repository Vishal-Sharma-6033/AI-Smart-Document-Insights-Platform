import { Document } from '../models/Document.model.js';

export const documentRepository = {
  create(data) {
    return Document.create(data);
  },

  findById(id) {
    return Document.findById(id).exec();
  },

  findByIdForUser(id, userId) {
    return Document.findOne({ _id: id, userId }).exec();
  },

  listForUser(userId, { limit = 50, skip = 0 } = {}) {
    return Document.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  countForUser(userId) {
    return Document.countDocuments({ userId }).exec();
  },

  updateById(id, update) {
    return Document.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  updateStatus(id, status, extra = {}) {
    return Document.findByIdAndUpdate(id, { status, ...extra }, { new: true }).exec();
  },

  deleteByIdForUser(id, userId) {
    return Document.findOneAndDelete({ _id: id, userId }).exec();
  },
};

export default documentRepository;
