import { useMemo, useCallback } from 'react';
import { ChevronDown, Type, Heading1, Heading2, Heading3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TextLevel {
  id: string;
  label: string;
  icon: any;
  command: () => void;
  isActive: boolean;
  className: string;
}

interface TextLevelSelectorProps {
  editor: any;
}

export const TextLevelSelector = ({ editor }: TextLevelSelectorProps) => {
  // Determine current active level
  const getCurrentLevel = useCallback(() => {
    if (!editor) return 'paragraph';
    
    if (editor.isActive('heading', { level: 1 })) return 'heading1';
    if (editor.isActive('heading', { level: 2 })) return 'heading2';
    if (editor.isActive('heading', { level: 3 })) return 'heading3';
    return 'paragraph';
  }, [editor]);

  // Memoized text levels configuration
  const textLevels = useMemo((): TextLevel[] => {
    if (!editor) return [];
    
    const currentLevel = getCurrentLevel();
    
    return [
      {
        id: 'paragraph',
        label: 'Cos',
        icon: FileText,
        command: () => editor.chain().focus().setParagraph().run(),
        isActive: currentLevel === 'paragraph',
        className: 'text-sm font-normal',
      },
      {
        id: 'heading1',
        label: 'Títol',
        icon: Heading1,
        command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: currentLevel === 'heading1',
        className: 'text-lg font-bold',
      },
      {
        id: 'heading2',
        label: 'Capçalera',
        icon: Heading2,
        command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: currentLevel === 'heading2',
        className: 'text-base font-semibold',
      },
      {
        id: 'heading3',
        label: 'Subtítol',
        icon: Heading3,
        command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: currentLevel === 'heading3',
        className: 'text-sm font-medium',
      },
    ];
  }, [editor, getCurrentLevel]);

  const activeLevel = useMemo(() => {
    return textLevels.find(level => level.isActive) || textLevels[0];
  }, [textLevels]);

  const handleLevelChange = useCallback((level: TextLevel) => {
    if (!editor) return;
    level.command();
    requestAnimationFrame(() => editor.commands.focus());
  }, [editor]);

  if (!editor) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors min-w-[100px] justify-between"
          title="Nivell de text"
        >
          <div className="flex items-center gap-2">
            <activeLevel.icon className="h-4 w-4" />
            <span>{activeLevel.label}</span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-48 bg-popover border border-border shadow-lg z-50"
      >
        {textLevels.map((level) => {
          const Icon = level.icon;
          return (
            <DropdownMenuItem
              key={level.id}
              onClick={() => handleLevelChange(level)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                level.isActive ? 'bg-accent/50 text-accent-foreground' : ''
              }`}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className={`${level.className} text-foreground`}>
                  {level.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {level.id === 'paragraph' && 'Text normal del document'}
                  {level.id === 'heading1' && 'Títol principal'}
                  {level.id === 'heading2' && 'Capçalera de secció'}
                  {level.id === 'heading3' && 'Subtítol'}
                </div>
              </div>
              {level.isActive && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};