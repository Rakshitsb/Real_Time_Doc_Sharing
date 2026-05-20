import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import CommentAnchor from "./CommentAnchor";

const lowlight = createLowlight(common);

const createCaretElement = (user) => {
  const cursor = document.createElement("span");
  cursor.classList.add("collaboration-caret");
  cursor.style.borderColor = user.color;

  const label = document.createElement("span");
  label.classList.add("collaboration-caret__label");
  label.style.backgroundColor = user.color;
  label.textContent = user.name;

  cursor.append(label);
  return cursor;
};

const createEditorExtensions = ({ collaborationProvider, collaborationUser } = {}) => {
  const collaborationExtensions = collaborationProvider
    ? [
        Collaboration.configure({
          document: collaborationProvider.document,
        }),
        CollaborationCaret.configure({
          provider: collaborationProvider,
          user: collaborationUser,
          render: createCaretElement,
          selectionRender: (user) => ({
            nodeName: "span",
            class: "collaboration-selection",
            style: `background-color: ${user.color}33`,
            "data-user": user.name,
          }),
        }),
      ]
    : [];

  return [
  StarterKit.configure({
    codeBlock: false,
    history: !collaborationProvider,
  }),
  Placeholder.configure({
    placeholder: "Start writing. Type your ideas here...",
  }),
  Underline,
  Highlight.configure({ multicolor: true }),
  CommentAnchor,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
    HTMLAttributes: {
      class: "text-accent underline underline-offset-4",
    },
  }),
  Image.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: "rounded-lg border border-border",
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: "rounded-lg bg-slate-950 p-4 text-sm text-slate-100",
    },
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "w-full border-collapse overflow-hidden rounded-lg",
    },
  }),
  TableRow,
  TableHeader,
  TableCell,
  ...collaborationExtensions,
];
};

export default createEditorExtensions;
