import mongoose from 'mongoose';

export const DOCUMENT_STATUS = Object.freeze({
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
});

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    cloudinaryUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local',
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.UPLOADED,
      index: true,
    },

    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    sizeBytes: { type: Number, default: 0 },
    error: { type: String, default: null },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, createdAt: -1 });

documentSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Document = mongoose.model('Document', documentSchema);
export default Document;
