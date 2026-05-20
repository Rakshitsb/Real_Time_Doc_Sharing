const MAX_TEXT_CHARS = 12000;
const MAX_SELECTION_CHARS = 5000;

const trimText = (text = "", limit = MAX_TEXT_CHARS) => {
  const normalized = String(text).replace(/\s+\n/g, "\n").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit)}\n\n[Context truncated for cost and latency.]`;
};

const buildActionInput = ({ action, selectedText, documentText, tone }) => {
  const selection = trimText(selectedText, MAX_SELECTION_CHARS);
  const documentContext = trimText(documentText);

  return [
    `Action: ${action}`,
    tone ? `Tone preference: ${tone}` : null,
    selection ? `Selected text:\n${selection}` : null,
    `Document context:\n${documentContext || "No document context provided."}`,
  ]
    .filter(Boolean)
    .join("\n\n");
};

const buildChatInput = ({ message, documentText, selectedText }) => {
  return [
    selectedText ? `Selected text:\n${trimText(selectedText, MAX_SELECTION_CHARS)}` : null,
    `Document context:\n${trimText(documentText) || "No document context provided."}`,
    `User question:\n${trimText(message, 2000)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
};

export { buildActionInput, buildChatInput, trimText };
