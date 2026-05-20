const AI_ACTION_GROUPS = [
  {
    title: "Summarize",
    actions: [
      { id: "summarize_short", label: "Short summary", mode: "insert" },
      { id: "summarize_bullets", label: "Bullet summary", mode: "insert" },
      { id: "summarize_meeting", label: "Meeting notes", mode: "insert" },
    ],
  },
  {
    title: "Improve",
    actions: [
      { id: "grammar", label: "Fix grammar", mode: "replace", requiresSelection: true },
      { id: "improve", label: "Improve writing", mode: "replace", requiresSelection: true },
      { id: "professional", label: "Rewrite professionally", mode: "replace", requiresSelection: true },
      { id: "simplify", label: "Simplify", mode: "replace", requiresSelection: true },
      { id: "expand", label: "Expand", mode: "replace", requiresSelection: true },
      { id: "fix_tone", label: "Fix tone", mode: "replace", requiresSelection: true },
    ],
  },
  {
    title: "Generate",
    actions: [
      { id: "continue", label: "Continue writing", mode: "insert" },
      { id: "title", label: "Generate title", mode: "insert" },
      { id: "action_items", label: "Action items", mode: "insert" },
      { id: "brainstorm", label: "Brainstorm ideas", mode: "insert" },
      { id: "explain", label: "Explain selection", mode: "insert", requiresSelection: true },
    ],
  },
];

const getAiAction = (id) =>
  AI_ACTION_GROUPS.flatMap((group) => group.actions).find((action) => action.id === id);

export { AI_ACTION_GROUPS, getAiAction };
