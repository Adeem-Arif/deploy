"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { Bold, Italic, Underline as UnderlineIcon, List, Heading2 } from "lucide-react";
import { useEffect } from "react";

type Props = {
  content: string;
  onChange: (value: string) => void;
};

export default function TipTapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Heading, BulletList, ListItem],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] p-4 outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:text-white",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      {editor && (
        <>
          <EditorContent editor={editor} />
          <div className="flex gap-3 p-2 border-t border-gray-200 dark:border-zinc-700 justify-center flex-wrap">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 ${
                editor.isActive("bold") ? "text-blue-500" : ""
              }`}
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 ${
                editor.isActive("italic") ? "text-blue-500" : ""
              }`}
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 ${
                editor.isActive("underline") ? "text-blue-500" : ""
              }`}
              title="Underline"
            >
              <UnderlineIcon size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 ${
                editor.isActive("bulletList") ? "text-blue-500" : ""
              }`}
              title="Bullet List"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 ${
                editor.isActive("heading", { level: 2 }) ? "text-blue-500" : ""
              }`}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
