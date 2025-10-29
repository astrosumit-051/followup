"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  FileText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PolishDraftModal } from "./PolishDraftModal";
import { TemplateLibrary } from "./TemplateLibrary";
import type { EmailTemplate } from "@/lib/graphql/email-templates";

interface EmailComposerProps {
  selectedContactIds?: string[];
  emailType?: "followup" | "cold" | null;
  onContentChange?: (content: string) => void;
  onSubjectChange?: (subject: string) => void;
  initialContent?: string;
  initialSubject?: string;
}

export function EmailComposer({
  selectedContactIds = [],
  emailType = null,
  onContentChange,
  onSubjectChange,
  initialContent = "",
  initialSubject = "",
}: EmailComposerProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [isPolishModalOpen, setIsPolishModalOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);

  // Initialize TipTap editor with all required extensions
  // Note: StarterKit v3 includes Bold, Italic, Underline, Link, BulletList, OrderedList
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Compose your email...",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] max-h-[600px] overflow-y-auto px-4 py-3 border border-input rounded-md bg-background",
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
  });

  // Handle subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubject = e.target.value;
    setSubject(newSubject);
    if (onSubjectChange) {
      onSubjectChange(newSubject);
    }
  };

  // Handle polished version selection
  const handlePolishedVersionSelect = (polishedContent: string) => {
    if (editor) {
      editor.commands.setContent(polishedContent);
      if (onContentChange) {
        onContentChange(polishedContent);
      }
    }
  };

  // Handle template load
  const handleLoadTemplate = (template: EmailTemplate) => {
    if (editor) {
      // Load subject
      setSubject(template.subject);
      if (onSubjectChange) {
        onSubjectChange(template.subject);
      }

      // Load body content
      const content = template.bodyHtml || template.body;
      editor.commands.setContent(content);
      if (onContentChange) {
        onContentChange(content);
      }
    }
  };

  // Open template library for browsing
  const openTemplateLibrary = () => {
    setShowSaveAsTemplate(false);
    setIsTemplateLibraryOpen(true);
  };

  // Open template library in "save as" mode
  const openSaveAsTemplate = () => {
    setShowSaveAsTemplate(true);
    setIsTemplateLibraryOpen(true);
  };

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    label,
  }: {
    onClick: () => void;
    isActive: boolean;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 px-2",
        isActive && "bg-accent text-accent-foreground"
      )}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Email Context Badge */}
      {emailType && (
        <div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium",
              emailType === "followup"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            )}
          >
            {emailType === "followup" ? "Follow-Up Email" : "Cold Email"} • First
            Contact
          </Badge>
        </div>
      )}

      {/* Recipient Display for Campaign Mode */}
      {selectedContactIds.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Sending to {selectedContactIds.length} contact
            {selectedContactIds.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Subject Field */}
      <div className="space-y-2">
        <label htmlFor="email-subject" className="text-sm font-medium">
          Subject:
        </label>
        <div className="relative">
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={handleSubjectChange}
            placeholder="Email subject..."
            className="w-full border border-input rounded-md p-2 bg-background
                     focus:outline-none focus:ring-2 focus:ring-ring pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {subject.length} chars
          </span>
        </div>
      </div>

      {/* TipTap Editor with Toolbar */}
      <div className="space-y-2">
        <label id="email-message-label" className="text-sm font-medium">
          Message:
        </label>

        {/* Formatting Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border border-input rounded-md bg-muted/50" role="toolbar" aria-label="Email formatting toolbar">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={Bold}
            label="Bold (Cmd+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={Italic}
            label="Italic (Cmd+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon={UnderlineIcon}
            label="Underline (Cmd+U)"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
            label="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={ListOrdered}
            label="Numbered List"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            icon={AlignLeft}
            label="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            icon={AlignCenter}
            label="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            icon={AlignRight}
            label="Align Right"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            icon={AlignJustify}
            label="Justify"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Link */}
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              }
            }}
            isActive={editor.isActive("link")}
            icon={LinkIcon}
            label="Insert Link"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Template Actions */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openTemplateLibrary}
            className="h-8 px-3 text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-950"
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            Browse Templates
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openSaveAsTemplate}
            className="h-8 px-3 text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950"
            disabled={!editor.getText().trim() || !subject.trim()}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Save as Template
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Polish Draft Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPolishModalOpen(true)}
            className="h-8 px-3 text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-950"
            disabled={!editor.getText().trim()}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Polish Draft
          </Button>
        </div>

        {/* Editor Content */}
        <div aria-labelledby="email-message-label">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Polish Draft Modal */}
      <PolishDraftModal
        isOpen={isPolishModalOpen}
        roughDraft={editor?.getText() || ""}
        contextType={emailType === "followup" ? "FOLLOW_UP" : emailType === "cold" ? "COLD_EMAIL" : undefined}
        onClose={() => setIsPolishModalOpen(false)}
        onSelectVersion={handlePolishedVersionSelect}
      />

      {/* Template Library Modal */}
      <TemplateLibrary
        isOpen={isTemplateLibraryOpen}
        onClose={() => {
          setIsTemplateLibraryOpen(false);
          setShowSaveAsTemplate(false);
        }}
        onLoadTemplate={handleLoadTemplate}
        showSaveAs={showSaveAsTemplate}
        defaultSubject={subject}
        defaultBody={editor?.getHTML() || ""}
      />
    </div>
  );
}
