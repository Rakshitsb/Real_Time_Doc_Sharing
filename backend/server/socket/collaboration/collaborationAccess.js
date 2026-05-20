import mongoose from "mongoose";
import { assertDocumentAccess } from "../../services/documentAccess.service.js";

const canAccessDocumentRoom = async ({ documentId, user, permission = "view" }) => {
  if (!user?._id || !mongoose.Types.ObjectId.isValid(documentId)) {
    return { allowed: false, role: null };
  }

  try {
    const { role } = await assertDocumentAccess({ documentId, userId: user._id, permission });
    return { allowed: true, role };
  } catch (error) {
    return { allowed: false, role: null };
  }
};

export { canAccessDocumentRoom };
