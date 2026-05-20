import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    clientId: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    deliveryState: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ document: 1, createdAt: -1, _id: -1 });
chatMessageSchema.index({ workspace: 1, createdAt: -1 });
chatMessageSchema.index({ clientId: 1, author: 1 }, { sparse: true });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
