"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

/**
 * TipTap Rich Text Editor Component
 *
 * Features:
 * - Bold, Italic, Underline formatting
 * - Bullet and numbered lists
 * - Text alignment (left, center, right, justify)
 * - Link insertion
 * - Placeholder text
 *
 * @param content - Initial editor content (TipTap JSON format)
 * @param onChange - Callback when content changes (returns both JSON and HTML)
 * @param placeholder - Placeholder text for empty editor
 */

interface TipTapEditorProps {
  content?: Record<string, any>;
  onChange: (json: Record<string, any>, html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Type your signature here...",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable link and underline from StarterKit since we're adding them with custom config
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline",
        },
      }),
    ],
    content: content || { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 border rounded-md",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      onChange(json, html);
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="p-4 text-sm text-gray-500">Loading editor...</div>;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-md border">
        {/* Bold */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Italic */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        {/* Underline */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Bullet List */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>

        {/* Numbered List */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Align Left */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        {/* Align Center */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        {/* Align Right */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        {/* Align Justify */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Align justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""}
          aria-label="Add link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-800 rounded-md">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
