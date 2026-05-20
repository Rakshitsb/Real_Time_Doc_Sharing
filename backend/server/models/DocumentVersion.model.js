import mongoose from "mongoose";

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    contentHash: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ["auto", "manual", "restore", "pre_restore"],
      default: "auto",
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    metadata: {
      sizeBytes: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

documentVersionSchema.index({ document: 1, versionNumber: -1 }, { unique: true });
documentVersionSchema.index({ document: 1, createdAt: -1 });

const DocumentVersion = mongoose.model("DocumentVersion", documentVersionSchema);

export default DocumentVersion;
