import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: () => ({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["editor", "viewer", "commenter"],
          default: "editor",
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    invitedUsers: [
      {
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        role: {
          type: String,
          enum: ["editor", "viewer", "commenter"],
          default: "viewer",
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        acceptedAt: Date,
      },
    ],
    permissions: {
      visibility: {
        type: String,
        enum: ["private", "collaborators-only", "public-readonly", "workspace", "shared"],
        default: "private",
        index: true,
      },
      allowRestore: {
        type: Boolean,
        default: true,
      },
    },
    visibility: {
      type: String,
      enum: ["private", "collaborators-only", "public-readonly"],
      default: "private",
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    shareSettings: {
      allowPublicRead: {
        type: Boolean,
        default: false,
      },
      inviteLinkEnabled: {
        type: Boolean,
        default: false,
      },
      defaultInviteRole: {
        type: String,
        enum: ["viewer", "editor", "commenter"],
        default: "viewer",
      },
      linkTokenHash: {
        type: String,
        select: false,
      },
      linkExpiresAt: Date,
    },
    metadata: {
      lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      lastEditedAt: {
        type: Date,
      },
      lastVersionAt: {
        type: Date,
      },
      versionCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      contentHash: {
        type: String,
        index: true,
      },
    },
    collaboration: {
      activeUsers: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastSyncedAt: {
        type: Date,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1, isDeleted: 1, updatedAt: -1 });
documentSchema.index({ "collaborators.user": 1, isDeleted: 1, updatedAt: -1 });
documentSchema.index({ "invitedUsers.email": 1, isDeleted: 1, updatedAt: -1 });
documentSchema.index({ workspace: 1, isDeleted: 1, updatedAt: -1 });
documentSchema.index({ workspaceId: 1, isDeleted: 1, updatedAt: -1 });
documentSchema.index({ visibility: 1, isDeleted: 1, updatedAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
