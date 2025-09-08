import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Bold, Italic, Underline, List, Code, Link, Image, MoreHorizontal, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotes } from "@/hooks/useNotes";
import { toast } from "@/lib/toastUtils";

interface NoteEditorProps {
  noteId: string;
}

const formatToolbarButtons = [
  { icon: Bold, tooltip: "Negreta", action: "bold" },
  { icon: Italic, tooltip: "Cursiva", action: "italic" },
  { icon: Underline, tooltip: "Subratllat", action: "underline" },
  { icon: List, tooltip: "Llista", action: "list" },
  { icon: Code, tooltip: "Codi", action: "code" },
  { icon: Link, tooltip: "Enllaç", action: "link" },
  { icon: Image, tooltip: "Imatge", action: "image" },
];

export const NoteEditor = ({ noteId }: NoteEditorProps) => {
  const { getNoteById, updateNote, saving } = useNotes();
  const note = getNoteById(noteId);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);

  // Initialize editor with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLastSaved(new Date(note.updated_at));
      setIsModified(false);
      isInitializedRef.current = true;
    }
  }, [note]);

  // Auto-save functionality
  const saveNote = useCallback(async () => {
    if (!note || !isModified) return;

    const success = await updateNote(noteId, {
      title: title.trim() || "Sense títol",
      content: content.trim(),
    });

    if (success) {
      setIsModified(false);
      setLastSaved(new Date());
    }
  }, [note, noteId, title, content, isModified, updateNote]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!isInitializedRef.current || !isModified) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, isModified, saveNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (isInitializedRef.current) {
      setIsModified(true);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (isInitializedRef.current) {
      setIsModified(true);
    }
  };

  const handleManualSave = () => {
    if (isModified) {
      saveNote();
    }
  };

  const handleFormatClick = (action: string) => {
    // Placeholder for rich text formatting
    console.log(`Format action: ${action}`);
    toast.success(`Format ${action} aplicat`);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return "Desat ara mateix";
    if (minutes < 60) return `Desat fa ${minutes}m`;
    if (minutes < 1440) return `Desat fa ${Math.floor(minutes / 60)}h`;
    return `Desat ${lastSaved.toLocaleDateString()}`;
  };

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nota no trobada
          </h3>
          <p className="text-sm text-muted-foreground">
            La nota seleccionada no existeix o no es pot carregar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Títol de la nota..."
            className="text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0 bg-transparent"
          />
          {note.is_starred && (
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualSave}
            disabled={!isModified || saving}
            size="sm"
            className="bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Desant..." : "Desar"}
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatLastSaved()}
        </div>
        {isModified && (
          <Badge variant="outline" className="text-xs">
            Modificat
          </Badge>
        )}
        <span>
          {content.length} caràcters
        </span>
        <span>
          {content.split(/\s+/).filter(Boolean).length} paraules
        </span>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg mb-4">
        {formatToolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleFormatClick(button.action)}
            className="h-8 w-8 p-0"
            title={button.tooltip}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        
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

      {/* Content Editor */}
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Comença a escriure la teva nota..."
          className="h-full min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>

      {/* Tags Display */}
      {note.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};