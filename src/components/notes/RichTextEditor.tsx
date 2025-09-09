import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { forwardRef, useImperativeHandle, useEffect, useCallback, useState, useRef } from 'react';
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

interface ToolbarButtonProps {
  editor: any;
  format: string;
  icon: any;
  title: string;
}

const ToolbarButton = ({ editor, format, icon: Icon, title }: ToolbarButtonProps) => {
  const handleClick = useCallback(() => {
    const commands = {
      bold: () => editor.chain().focus().toggleBold().run(),
      italic: () => editor.chain().focus().toggleItalic().run(),
      underline: () => editor.chain().focus().toggleUnderline().run(),
      code: () => editor.chain().focus().toggleCode().run(),
      bulletList: () => editor.chain().focus().toggleBulletList().run(),
    };
    
    commands[format as keyof typeof commands]?.();
  }, [editor, format]);

  return (
    <Button
      variant={editor.isActive(format) ? "secondary" : "ghost"}
      size="sm"
      onClick={handleClick}
      className="h-8 w-8 p-0"
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, onBlur, placeholder = "Comença a escriure...", className }, ref) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const initializedRef = useRef(false);
    const lastValueRef = useRef(value);
    
    // Debounced onChange to prevent autosave interference
    const debouncedOnChange = useCallback((newValue: string) => {
      if (lastValueRef.current !== newValue) {
        lastValueRef.current = newValue;
        onChange(newValue);
      }
    }, [onChange]);

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
        if (!isUpdating) {
          const html = editor.getHTML();
          debouncedOnChange(html);
        }
      },
      onSelectionUpdate: () => {
        // Force re-render of toolbar buttons when selection changes
        setIsUpdating(false);
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

    // Smart content synchronization - only update if content is significantly different
    useEffect(() => {
      if (editor && !initializedRef.current) {
        initializedRef.current = true;
        if (value && value !== editor.getHTML()) {
          setIsUpdating(true);
          editor.commands.setContent(value);
          setTimeout(() => setIsUpdating(false), 50);
        }
      }
    }, [editor, value]);

    // Handle external value changes (like when switching notes)
    useEffect(() => {
      if (editor && initializedRef.current && value !== lastValueRef.current) {
        const currentContent = editor.getHTML();
        if (value !== currentContent) {
          setIsUpdating(true);
          editor.commands.setContent(value);
          lastValueRef.current = value;
          setTimeout(() => setIsUpdating(false), 50);
        }
      }
    }, [value, editor]);

    if (!editor) {
      return null;
    }

    return (
      <div className={className}>
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg mb-4">
          <ToolbarButton
            editor={editor}
            format="bold"
            icon={Bold}
            title="Negreta"
          />
          
          <ToolbarButton
            editor={editor}
            format="italic"
            icon={Italic}
            title="Cursiva"
          />
          
          <ToolbarButton
            editor={editor}
            format="underline"
            icon={UnderlineIcon}
            title="Subratllat"
          />
          
          <ToolbarButton
            editor={editor}
            format="code"
            icon={Code}
            title="Codi"
          />
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <ToolbarButton
            editor={editor}
            format="bulletList"
            icon={List}
            title="Llista amb bullets"
          />
          
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