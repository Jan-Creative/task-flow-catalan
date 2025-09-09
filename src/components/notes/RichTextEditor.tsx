import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, List, Code, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export interface RichTextEditorRef {
  focus: () => void;
  getSelection: () => { start: number; end: number; selectedText: string } | null;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, onBlur, placeholder = "Comença a escriure...", className }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Underline,
        TextStyle,
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
      },
      onBlur: () => {
        onBlur?.();
      },
      editorProps: {
        attributes: {
          class: 'prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:text-muted-foreground focus:outline-none min-h-[400px] p-4',
        },
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.commands.focus();
      },
      getSelection: () => {
        if (!editor) return null;
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        return { start: from, end: to, selectedText };
      },
    }));

    // Update editor content when value prop changes
    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    if (!editor) {
      return null;
    }

    return (
      <div className={className}>
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg mb-4">
          <Button
            variant={editor.isActive('bold') ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
            title="Negreta"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant={editor.isActive('italic') ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant={editor.isActive('underline') ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="h-8 w-8 p-0"
            title="Subratllat"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant={editor.isActive('code') ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className="h-8 w-8 p-0"
            title="Codi"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button
            variant={editor.isActive('bulletList') ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8 p-0"
            title="Llista amb bullets"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Més opcions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <div className="rounded-lg border bg-background min-h-[400px]">
          <EditorContent 
            editor={editor} 
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";