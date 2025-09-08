import { useState } from "react";
import { FileText, Calendar, Tag, Star, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotesListSidebarProps {
  searchQuery: string;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  showFilters: boolean;
}

// Mock data - replace with real data later
const mockNotes = [
  {
    id: "1",
    title: "Reflexions del dia",
    preview: "Avui ha estat un dia molt productiu. He completat la majoria de tasques...",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    tags: ["reflexio", "diari"],
    isStarred: true,
    hasAttachments: false,
    linkedTasks: 2,
    linkedEvents: 1,
  },
  {
    id: "2", 
    title: "Idees projecte nou",
    preview: "Conceptes per al nou sistema de notes integrat. Funcionalitats clau...",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-15"),
    tags: ["projecte", "idees"],
    isStarred: false,
    hasAttachments: true,
    linkedTasks: 5,
    linkedEvents: 0,
  },
  {
    id: "3",
    title: "Checklist setmana",
    preview: "- [ ] Revisar codi\n- [x] Reunió equip\n- [ ] Documentació...",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-14"),
    tags: ["checklist", "setmana"],
    isStarred: false,
    hasAttachments: false,
    linkedTasks: 3,
    linkedEvents: 2,
  },
];

const categories = [
  { id: "all", label: "Totes", icon: FileText, count: 3 },
  { id: "starred", label: "Destacades", icon: Star, count: 1 },
  { id: "tagged", label: "Etiquetades", icon: Tag, count: 3 },
  { id: "archived", label: "Arxivades", icon: Archive, count: 0 },
];

export const NotesListSidebar = ({ 
  searchQuery, 
  selectedNoteId, 
  onSelectNote, 
  showFilters 
}: NotesListSidebarProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Avui";
    if (diffDays === 1) return "Ahir";
    if (diffDays < 7) return `Fa ${diffDays} dies`;
    return date.toLocaleDateString("ca-ES", { day: "numeric", month: "short" });
  };

  const filteredNotes = mockNotes.filter(note => {
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !note.preview.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (selectedCategory === "starred" && !note.isStarred) return false;
    
    return true;
  });

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
                  <span className="text-xs text-muted-foreground">{category.count}</span>
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
              {filteredNotes.length} notes
            </h3>
          </div>
          
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
                    {note.isStarred && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current ml-2 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.preview}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.updatedAt)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {note.linkedTasks > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {note.linkedTasks} tasques
                        </Badge>
                      )}
                      {note.linkedEvents > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {note.linkedEvents}
                        </Badge>
                      )}
                    </div>
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
        </div>
      </div>
    </div>
  );
};