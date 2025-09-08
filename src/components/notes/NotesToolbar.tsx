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

interface NotesToolbarProps {
  selectedNoteId: string | null;
}

export const NotesToolbar = ({ selectedNoteId }: NotesToolbarProps) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleStar = () => {
    setIsStarred(!isStarred);
  };

  const handleAction = (action: string) => {
    console.log("Action:", action);
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
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Desant..." : "Desar"}
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStar}
            className={isStarred ? "text-yellow-500" : ""}
          >
            <Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
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
            Desat automàticament
          </Badge>
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
              
              <DropdownMenuItem onClick={() => handleAction("archive")}>
                <Archive className="h-4 w-4 mr-2" />
                Arxivar nota
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => handleAction("delete")}
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