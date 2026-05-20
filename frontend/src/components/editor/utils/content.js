const emptyDocument = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

const paragraphFromText = (text) => {
  if (!text) return { type: "paragraph" };

  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
};

const normalizeEditorContent = (content) => {
  if (!content) return emptyDocument;

  if (typeof content === "object" && content.type === "doc") {
    return content;
  }

  if (typeof content === "string") {
    const paragraphs = content
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(paragraphFromText);

    return {
      type: "doc",
      content: paragraphs.length > 0 ? paragraphs : emptyDocument.content,
    };
  }

  return emptyDocument;
};

const getTextLengthFromJson = (content) => {
  const normalized = normalizeEditorContent(content);
  let length = 0;

  const walk = (node) => {
    if (!node) return;
    if (node.text) length += node.text.length;
    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  };

  walk(normalized);
  return length;
};

const getPlainTextFromJson = (content) => {
  const normalized = normalizeEditorContent(content);
  const chunks = [];

  const walk = (node) => {
    if (!node) return;
    if (node.text) chunks.push(node.text);
    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
      if (["paragraph", "heading", "listItem"].includes(node.type)) {
        chunks.push("\n");
      }
    }
  };

  walk(normalized);
  return chunks.join(" ").replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();
};

export { emptyDocument, getPlainTextFromJson, getTextLengthFromJson, normalizeEditorContent };
