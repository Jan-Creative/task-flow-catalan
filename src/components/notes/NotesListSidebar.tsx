import { useState } from "react";
import { FileText, Calendar, Tag, Star, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotes } from "@/contexts/NotesContext";

interface NotesListSidebarProps {
  searchQuery: string;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  showFilters: boolean;
}

const categories = [
  { id: "all", label: "Totes", icon: FileText },
  { id: "starred", label: "Destacades", icon: Star },
  { id: "tagged", label: "Etiquetades", icon: Tag },
  { id: "archived", label: "Arxivades", icon: Archive },
];

export const NotesListSidebar = ({ 
  searchQuery, 
  selectedNoteId, 
  onSelectNote, 
  showFilters 
}: NotesListSidebarProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { notes, loading, getFilteredNotes } = useNotes();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Avui";
    if (diffDays === 1) return "Ahir";
    if (diffDays < 7) return `Fa ${diffDays} dies`;
    return date.toLocaleDateString("ca-ES", { day: "numeric", month: "short" });
  };

  const filteredNotes = getFilteredNotes(searchQuery, selectedCategory);

  // Calculate category counts
  const getCategoryCount = (categoryId: string) => {
    switch (categoryId) {
      case "starred":
        return notes.filter(note => note.is_starred && !note.is_archived).length;
      case "archived":
        return notes.filter(note => note.is_archived).length;
      case "tagged":
        return notes.filter(note => note.tags.length > 0 && !note.is_archived).length;
      default:
        return notes.filter(note => !note.is_archived).length;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Categories */}
      {showFilters && (
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full justify-start h-8",
                    selectedCategory === category.id && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">{category.label}</span>
                  <span className="text-xs text-muted-foreground">{getCategoryCount(category.id)}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {loading ? "Carregant..." : `${filteredNotes.length} notes`}
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-sm text-muted-foreground">Carregant notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No s'han trobat notes" : "No hi ha notes"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedNoteId === note.id 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => onSelectNote(note.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground line-clamp-2 flex-1">
                        {note.title}
                      </h4>
                      {note.is_starred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current ml-2 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content.slice(0, 100)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="h-5 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};