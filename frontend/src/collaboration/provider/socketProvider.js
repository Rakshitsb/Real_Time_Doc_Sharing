import * as Y from "yjs";
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness";

const createCollaborationProvider = (documentId) => {
  const document = new Y.Doc();
  document.guid = documentId || document.guid;
  const awareness = new Awareness(document);

  return {
    document,
    awareness,
    destroy: () => {
      awareness.destroy();
      document.destroy();
    },
  };
};

export { applyAwarenessUpdate, createCollaborationProvider, encodeAwarenessUpdate };
