import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },

    sources: [
      {
        chunkIndex: Number,
        text: String,
        score: Number,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, documentId: 1, createdAt: -1 });

chatSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
