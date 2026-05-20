const createEmptyEditorDocument = () => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const normalizeEditorContent = (content) => {
  if (!content) return createEmptyEditorDocument();

  if (typeof content === "object" && content.type === "doc") {
    return content;
  }

  if (typeof content === "string") {
    const paragraphs = content
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      }));

    return {
      type: "doc",
      content: paragraphs.length > 0 ? paragraphs : createEmptyEditorDocument().content,
    };
  }

  return createEmptyEditorDocument();
};

export { createEmptyEditorDocument, normalizeEditorContent };
