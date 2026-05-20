import crypto from "crypto";

const stableStringify = (value) => JSON.stringify(value ?? null);

const createContentHash = (value) => {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
};

const getContentSizeBytes = (value) => Buffer.byteLength(stableStringify(value), "utf8");

export { createContentHash, getContentSizeBytes };
