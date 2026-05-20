/**
 * @file document.service.test.js
 * Unit tests for core document service operations.
 * Uses vi.mock to isolate the service from DB and external dependencies.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must be defined before imports) ────────────────────────────────────
vi.mock("../repositories/document.repository.js", () => ({
  findAccessibleDocuments: vi.fn(),
  findAccessibleDocumentById: vi.fn(),
  findDocumentById: vi.fn(),
  countAccessibleDocuments: vi.fn(),
  createDocumentRecord: vi.fn(),
  updateDocumentById: vi.fn(),
  softDeleteDocumentById: vi.fn(),
}));

vi.mock("../services/editor.service.js", () => ({
  normalizeEditorContent: vi.fn((c) => c),
}));

vi.mock("../utils/contentHash.js", () => ({
  createContentHash: vi.fn(() => "mock_hash_abc"),
}));

vi.mock("../services/documentVersion.service.js", () => ({
  createVersionSnapshot: vi.fn(async () => {}),
}));

vi.mock("../services/activity.service.js", () => ({
  logActivity: vi.fn(async () => {}),
  ACTIVITY_TYPES: {
    DOCUMENT_CREATED: "document.created",
    DOCUMENT_EDITED: "document.edited",
    DOCUMENT_DELETED: "document.deleted",
    DOCUMENT_RENAMED: "document.renamed",
  },
}));

vi.mock("../services/documentAccess.service.js", () => ({
  assertDocumentAccess: vi.fn(),
  serializeDocumentAccess: vi.fn(() => ({ canEdit: true, canShare: true, role: "owner" })),
}));

vi.mock("../utils/pagination.js", () => ({
  getPagination: vi.fn(() => ({ page: 1, limit: 20, skip: 0 })),
  buildPaginatedResult: vi.fn(({ data, total, page, limit }) => ({ data, total, page, limit })),
}));

import * as repo from "../repositories/document.repository.js";
import * as accessService from "../services/documentAccess.service.js";
import { getDocuments, getDocumentById, createDocument, deleteDocument } from "../services/document.service.js";

const MOCK_USER_ID = "6630000000000000000000aa";
const MOCK_DOC_ID = "6630000000000000000000bb";

/** Mimics a Mongoose document object with toObject() and set() */
const buildMockDoc = (overrides = {}) => ({
  _id: MOCK_DOC_ID,
  title: "Test Doc",
  content: { type: "doc", content: [] },
  owner: MOCK_USER_ID,
  metadata: { contentHash: "old_hash", lastEditedBy: MOCK_USER_ID },
  toObject: vi.fn(function () { return { ...this }; }),
  set: vi.fn(),
  ...overrides,
});

describe("Document Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getDocuments ────────────────────────────────────────────────────────────
  describe("getDocuments", () => {
    it("should return paginated documents", async () => {
      const mockDocs = [{ _id: MOCK_DOC_ID, title: "Test", owner: MOCK_USER_ID }];
      repo.findAccessibleDocuments.mockResolvedValue(mockDocs);
      repo.countAccessibleDocuments.mockResolvedValue(1);

      const result = await getDocuments({ userId: MOCK_USER_ID, query: {} });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(repo.findAccessibleDocuments).toHaveBeenCalledOnce();
    });
  });

  // ── getDocumentById ─────────────────────────────────────────────────────────
  describe("getDocumentById", () => {
    it("should return a document when found", async () => {
      const mockDoc = buildMockDoc();
      repo.findAccessibleDocumentById.mockResolvedValue(mockDoc);

      const doc = await getDocumentById({ id: MOCK_DOC_ID, userId: MOCK_USER_ID });

      expect(doc._id).toBe(MOCK_DOC_ID);
      expect(mockDoc.set).toHaveBeenCalled(); // access field attached
    });

    it("should throw 404 when document not found", async () => {
      repo.findAccessibleDocumentById.mockResolvedValue(null);

      await expect(
        getDocumentById({ id: MOCK_DOC_ID, userId: MOCK_USER_ID })
      ).rejects.toThrow(/not found/i);
    });

    it("should throw 400 for an invalid ObjectId", async () => {
      await expect(
        getDocumentById({ id: "not-a-valid-id", userId: MOCK_USER_ID })
      ).rejects.toThrow(/invalid/i);
    });
  });

  // ── createDocument ──────────────────────────────────────────────────────────
  describe("createDocument", () => {
    it("should create a document and version snapshot", async () => {
      const mockDoc = buildMockDoc();
      repo.createDocumentRecord.mockResolvedValue(mockDoc);

      const doc = await createDocument(
        { title: "New Doc", content: { type: "doc", content: [] } },
        MOCK_USER_ID
      );

      expect(doc._id).toBe(MOCK_DOC_ID);
      expect(repo.createDocumentRecord).toHaveBeenCalledOnce();
    });
  });

  // ── deleteDocument ──────────────────────────────────────────────────────────
  describe("deleteDocument", () => {
    it("should soft-delete a document", async () => {
      const mockDoc = buildMockDoc();
      accessService.assertDocumentAccess.mockResolvedValue({ document: mockDoc });
      repo.softDeleteDocumentById.mockResolvedValue({ acknowledged: true });

      const result = await deleteDocument({ id: MOCK_DOC_ID, userId: MOCK_USER_ID });

      expect(result.message).toMatch(/deleted/i);
      expect(repo.softDeleteDocumentById).toHaveBeenCalledOnce();
    });
  });
});
