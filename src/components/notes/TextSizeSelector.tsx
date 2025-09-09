import { useMemo, useCallback } from 'react';
import { ChevronDown, Type, Text as TextIcon, ZoomIn, ZoomOut, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TextSizeOption {
  id: string;
  label: string;
  fontSize?: string; // CSS value (e.g., '14px')
}

interface TextSizeSelectorProps {
  editor: any;
}

export const TextSizeSelector = ({ editor }: TextSizeSelectorProps) => {
  const options: TextSizeOption[] = useMemo(() => ([
    { id: 'small', label: 'Petit', fontSize: '14px' },
    { id: 'body', label: 'Cos', fontSize: '16px' },
    { id: 'large', label: 'Gran', fontSize: '20px' },
    { id: 'xlarge', label: 'Molt gran', fontSize: '24px' },
    { id: 'reset', label: 'Restableix' },
  ]), []);

  const currentSize = useMemo(() => {
    if (!editor) return undefined;
    const attrs = editor.getAttributes('textStyle') || {};
    return attrs.fontSize as string | undefined;
  }, [editor, editor?.state?.selection]);

  const activeOption = useMemo(() => {
    if (!currentSize) return options.find(o => o.id === 'body') || options[0];
    return options.find(o => o.fontSize === currentSize) || options[1];
  }, [currentSize, options]);

  const applySize = useCallback((option: TextSizeOption) => {
    if (!editor) return;
    if (option.id === 'reset') {
      editor.chain().focus().unsetMark('textStyle').run();
      return;
    }
    editor.chain().focus().setMark('textStyle', { fontSize: option.fontSize }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors min-w-[120px] justify-between"
          title="Mida del text"
        >
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>{activeOption?.label}</span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-popover border border-border shadow-lg z-50">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => applySize(opt)}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
              (opt.fontSize && opt.fontSize === currentSize) ? 'bg-accent/50 text-accent-foreground' : ''
            }`}
          >
            {opt.id === 'small' && <ZoomOut className="h-4 w-4 text-muted-foreground" />}
            {opt.id === 'body' && <TextIcon className="h-4 w-4 text-muted-foreground" />}
            {opt.id === 'large' && <ZoomIn className="h-4 w-4 text-muted-foreground" />}
            {opt.id === 'xlarge' && <ZoomIn className="h-4 w-4 text-muted-foreground" />}
            {opt.id === 'reset' && <Eraser className="h-4 w-4 text-muted-foreground" />}
            <div className="flex-1">
              <div className="text-foreground">{opt.label}</div>
              {opt.fontSize && (
                <div className="text-xs text-muted-foreground mt-0.5">{opt.fontSize}</div>
              )}
            </div>
            {(opt.fontSize && opt.fontSize === currentSize) && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
