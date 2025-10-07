import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/contexts/NotesContext";
import { toast } from "@/lib/toastUtils";
import { RichTextEditorLazy } from "@/lib/lazyLoading";
import type { RichTextEditorRef } from "./RichTextEditor";

interface NoteEditorProps {
  noteId: string;
}


export const NoteEditor = ({ noteId }: NoteEditorProps) => {
  const { getNoteById, updateNote, flushSaveNote, saving } = useNotes();
  const note = getNoteById(noteId);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);
  const previousNoteIdRef = useRef<string | null>(null);
  const editorRef = useRef<RichTextEditorRef>(null);

  // Flush save when switching notes
  useEffect(() => {
    const flushSave = async () => {
      if (previousNoteIdRef.current && isModified && isInitializedRef.current) {
        await flushSaveNote(previousNoteIdRef.current, {
          title: title.trim() || "Sense títol",
          content: content.trim(),
        });
      }
    };

    if (noteId !== previousNoteIdRef.current) {
      flushSave();
      previousNoteIdRef.current = noteId;
    }
  }, [noteId, title, content, isModified, flushSaveNote]);

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

  // Cleanup on unmount - flush save
  useEffect(() => {
    return () => {
      if (noteId && isModified && isInitializedRef.current) {
        flushSaveNote(noteId, {
          title: title.trim() || "Sense títol",
          content: content.trim(),
        });
      }
    };
  }, []);

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

  const handleContentChange = (value: string) => {
    setContent(value);
    if (isInitializedRef.current) {
      setIsModified(true);
    }
  };

  // Save on blur for better UX
  const handleTitleBlur = () => {
    if (isModified) {
      saveNote();
    }
  };

  const handleContentBlur = () => {
    if (isModified) {
      saveNote();
    }
  };

  const handleManualSave = () => {
    if (isModified) {
      saveNote();
    }
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
              onBlur={handleTitleBlur}
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

      {/* Rich Text Editor */}
      <div className="flex-1">
        <RichTextEditorLazy
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onBlur={handleContentBlur}
          placeholder="Comença a escriure la teva nota..."
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