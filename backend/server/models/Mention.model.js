import mongoose from "mongoose";

const mentionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    mentionedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["comment", "chat"],
      required: true,
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommentThread",
    },
  },
  { timestamps: true }
);

mentionSchema.index({ mentionedUser: 1, createdAt: -1 });
mentionSchema.index({ sourceType: 1, sourceId: 1 });

const Mention = mongoose.model("Mention", mentionSchema);

export default Mention;
