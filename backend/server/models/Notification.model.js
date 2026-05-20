import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "mention.comment",
        "mention.chat",
        "comment.reply",
        "comment.resolved",
        "comment.reopened",
        "chat.message",
        "collaborator.joined",
        "document.invited",
        "document.role_updated",
        "document.removed",
        "document.shared",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    body: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sourceType: {
      type: String,
      enum: ["comment", "thread", "chat", "document"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
