import mongoose from "mongoose";

const commentAnchorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text-range", "block", "detached"],
      default: "text-range",
    },
    from: Number,
    to: Number,
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    yjsRelativeStart: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    yjsRelativeEnd: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    fallbackPath: {
      type: [Number],
      default: [],
    },
    deletedText: {
      type: Boolean,
      default: false,
      index: true,
    },
    clientId: {
      type: String,
      trim: true,
      maxlength: 120,
    },
  },
  { _id: false }
);

const commentThreadSchema = new mongoose.Schema(
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
    anchor: {
      type: commentAnchorSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

commentThreadSchema.index({ document: 1, status: 1, lastMessageAt: -1 });
commentThreadSchema.index({ participants: 1, lastMessageAt: -1 });

const CommentThread = mongoose.model("CommentThread", commentThreadSchema);

export default CommentThread;
