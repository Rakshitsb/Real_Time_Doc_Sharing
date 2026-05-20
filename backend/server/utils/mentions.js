import mongoose from "mongoose";

const mentionPattern = /@\[([^\]]+)\]\(([a-f\d]{24})\)|@([a-f\d]{24})/gi;

const extractMentionIds = (body = "") => {
  const ids = new Set();
  let match = mentionPattern.exec(body);

  while (match) {
    const id = match[2] || match[3];
    if (mongoose.Types.ObjectId.isValid(id)) {
      ids.add(id);
    }
    match = mentionPattern.exec(body);
  }

  return Array.from(ids);
};

export { extractMentionIds };
