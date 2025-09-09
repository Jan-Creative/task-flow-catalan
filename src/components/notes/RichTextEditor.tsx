import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Heading from '@tiptap/extension-heading';
import { forwardRef, useImperativeHandle, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, List, Code, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextLevelSelector } from './TextLevelSelector';

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
  const [isPressed, setIsPressed] = useState(false);
  
  // Memoize active state to prevent unnecessary re-renders
  const isActive = useMemo(() => editor?.isActive(format) || false, [editor, format]);
  
  // Memoize commands object to prevent recreation on each render
  const commands = useMemo(() => ({
    bold: () => editor?.chain().focus().toggleBold().run(),
    italic: () => editor?.chain().focus().toggleItalic().run(),
    underline: () => editor?.chain().focus().toggleUnderline().run(),
    code: () => editor?.chain().focus().toggleCode().run(),
    bulletList: () => editor?.chain().focus().toggleBulletList().run(),
  }), [editor]);

  const handleClick = useCallback(() => {
    if (!editor) return;
    
    setIsPressed(true);
    
    // Store current selection to restore it after command
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    
    const success = commands[format as keyof typeof commands]?.();
    
    // Optimize selection restoration
    if (success) {
      requestAnimationFrame(() => {
        if (hasSelection) {
          editor.commands.setTextSelection({ from, to });
        }
        editor.commands.focus();
        setIsPressed(false);
      });
    } else {
      setIsPressed(false);
    }
  }, [editor, format, commands]);

  // Memoize button className to prevent recreation
  const buttonClassName = useMemo(() => {
    return `h-8 w-8 p-0 transition-all duration-150 ${
      isActive 
        ? "bg-secondary text-secondary-foreground shadow-sm" 
        : "hover:bg-accent hover:text-accent-foreground"
    } ${isPressed ? "scale-95" : ""}`;
  }, [isActive, isPressed]);

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={handleClick}
      className={buttonClassName}
      title={title}
      disabled={!editor}
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
    
    // Memoized debounced onChange to prevent autosave interference and unnecessary recreations
    const debouncedOnChange = useCallback((newValue: string) => {
      if (lastValueRef.current !== newValue) {
        lastValueRef.current = newValue;
        onChange(newValue);
      }
    }, [onChange]);

    // Memoized editor configuration to prevent recreation
    const editorConfig = useMemo(() => ({
      extensions: [
        StarterKit.configure({
          heading: false, // Disable heading from StarterKit to use custom Heading extension
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Heading.configure({
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'rich-text-heading',
          },
        }),
        Underline,
        TextStyle,
      ],
      content: value,
      onUpdate: ({ editor }: { editor: any }) => {
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
          class: 'rich-text-editor-content prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[400px] p-4',
        },
      },
    }), [value, isUpdating, debouncedOnChange, onBlur]);

    const editor = useEditor(editorConfig);

    // Memoized imperative handle to prevent recreation
    const imperativeHandle = useMemo(() => ({
      focus: () => {
        editor?.commands.focus();
      },
      getSelection: () => {
        if (!editor) return null;
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        return { start: from, end: to, selectedText };
      },
    }), [editor]);

    useImperativeHandle(ref, () => imperativeHandle, [imperativeHandle]);

    // Optimized content synchronization with better change detection
    useEffect(() => {
      if (editor && !initializedRef.current) {
        initializedRef.current = true;
        if (value && value !== editor.getHTML()) {
          setIsUpdating(true);
          editor.commands.setContent(value);
          // Use requestAnimationFrame for smoother updates
          requestAnimationFrame(() => setIsUpdating(false));
        }
      }
    }, [editor, value]);

    // Handle external value changes with improved performance
    useEffect(() => {
      if (editor && initializedRef.current && value !== lastValueRef.current) {
        const currentContent = editor.getHTML();
        if (value !== currentContent) {
          setIsUpdating(true);
          editor.commands.setContent(value);
          lastValueRef.current = value;
          requestAnimationFrame(() => setIsUpdating(false));
        }
      }
    }, [value, editor]);

    if (!editor) {
      return null;
    }

    return (
      <div className={className}>
        {/* Enhanced Formatting Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-gradient-to-r from-muted/40 to-muted/30 rounded-lg mb-4 border border-border/50 shadow-sm">
          {/* Text Level Selector */}
          <TextLevelSelector editor={editor} />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
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
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <ToolbarButton
            editor={editor}
            format="bulletList"
            icon={List}
            title="Llista amb bullets"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
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