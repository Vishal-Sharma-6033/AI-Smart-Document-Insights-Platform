import { User } from '../models/User.model.js';

export const userRepository = {
  findByEmail(email, { withPassword = false } = {}) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  },

  findById(id) {
    return User.findById(id).exec();
  },

  findByIdWithRefreshTokens(id) {
    return User.findById(id).select('+refreshTokens').exec();
  },

  create({ name, email, password }) {
    return User.create({ name, email, password });
  },

  async addRefreshToken(id, hashedToken) {
    return User.updateOne({ _id: id }, { $push: { refreshTokens: hashedToken } }).exec();
  },

  async replaceRefreshToken(id, oldHash, newHash) {

    await User.updateOne({ _id: id }, { $pull: { refreshTokens: oldHash } }).exec();
    return User.updateOne({ _id: id }, { $push: { refreshTokens: newHash } }).exec();
  },

  removeRefreshToken(id, hashedToken) {
    return User.updateOne({ _id: id }, { $pull: { refreshTokens: hashedToken } }).exec();
  },

  clearRefreshTokens(id) {
    return User.updateOne({ _id: id }, { $set: { refreshTokens: [] } }).exec();
  },
};

export default userRepository;
