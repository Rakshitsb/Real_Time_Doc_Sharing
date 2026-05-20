import { Mark, mergeAttributes } from "@tiptap/core";

const CommentAnchor = Mark.create({
  name: "commentAnchor",

  inclusive: false,

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-thread-id"),
        renderHTML: (attributes) => ({ "data-thread-id": attributes.threadId }),
      },
      status: {
        default: "open",
        parseHTML: (element) => element.getAttribute("data-comment-status") || "open",
        renderHTML: (attributes) => ({ "data-comment-status": attributes.status || "open" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-comment-anchor]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-comment-anchor": "true",
        class: "comment-anchor",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCommentAnchor:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      unsetCommentAnchor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default CommentAnchor;
