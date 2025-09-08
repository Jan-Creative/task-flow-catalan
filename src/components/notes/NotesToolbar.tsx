import { useState } from "react";
import { 
  Save, 
  Share, 
  Download, 
  Trash2, 
  Star, 
  Archive, 
  Copy, 
  Printer, 
  MoreHorizontal,
  Paperclip,
  Link
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/contexts/NotesContext";
import { toast } from "@/lib/toastUtils";

interface NotesToolbarProps {
  selectedNoteId: string | null;
  onNoteDeleted?: () => void;
}

export const NotesToolbar = ({ selectedNoteId, onNoteDeleted }: NotesToolbarProps) => {
  const { getNoteById, updateNote, deleteNote, saving } = useNotes();
  const note = selectedNoteId ? getNoteById(selectedNoteId) : null;

  const handleStar = async () => {
    if (!note) return;
    
    const success = await updateNote(note.id, {
      is_starred: !note.is_starred
    });
    
    if (success) {
      toast.success(note.is_starred ? 'Estrella eliminada' : 'Nota marcada amb estrella');
    }
  };

  const handleArchive = async () => {
    if (!note) return;
    
    const success = await updateNote(note.id, {
      is_archived: !note.is_archived
    });
    
    if (success) {
      toast.success(note.is_archived ? 'Nota desarxivada' : 'Nota arxivada');
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    const success = await deleteNote(note.id);
    if (success && onNoteDeleted) {
      onNoteDeleted();
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'duplicate':
        toast.success('Funcionalitat de duplicar pròximament');
        break;
      case 'print':
        window.print();
        break;
      case 'download':
        toast.success('Funcionalitat de descàrrega pròximament');
        break;
      case 'share':
        toast.success('Funcionalitat de compartir pròximament');
        break;
      case 'attach':
        toast.success('Funcionalitat d\'adjuntar pròximament');
        break;
      case 'link':
        toast.success('Funcionalitat d\'enllaçar pròximament');
        break;
      default:
        console.log("Action:", action);
    }
  };

  if (!selectedNoteId) {
    return (
      <div className="border-b border-border bg-card/30 p-4">
        <div className="text-sm text-muted-foreground">
          Selecciona una nota per veure les opcions
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card/30 p-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Primary Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStar}
            className={note?.is_starred ? "text-yellow-500" : ""}
            title={note?.is_starred ? "Eliminar estrella" : "Marcar amb estrella"}
          >
            <Star className={`h-4 w-4 ${note?.is_starred ? "fill-current" : ""}`} />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => handleAction("attach")}>
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => handleAction("link")}>
            <Link className="h-4 w-4" />
          </Button>
        </div>

        {/* Center - Status Indicators */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6">
            {saving ? "Desant..." : "Desat automàticament"}
          </Badge>
          {note?.is_starred && (
            <Badge variant="outline" className="h-6 text-yellow-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Favorita
            </Badge>
          )}
          {note?.is_archived && (
            <Badge variant="outline" className="h-6 text-muted-foreground">
              <Archive className="h-3 w-3 mr-1" />
              Arxivada
            </Badge>
          )}
        </div>

        {/* Right Side - Secondary Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleAction("share")}>
            <Share className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleAction("duplicate")}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar nota
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("print")}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("download")}>
                <Download className="h-4 w-4 mr-2" />
                Descarregar com a...
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                {note?.is_archived ? 'Desarxivar nota' : 'Arxivar nota'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};