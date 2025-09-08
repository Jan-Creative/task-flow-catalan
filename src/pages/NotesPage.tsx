import { useState } from "react";
import { Plus, FileText, Search, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NotesListSidebar } from "@/components/notes/NotesListSidebar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteMetadataPanel } from "@/components/notes/NoteMetadataPanel";
import { NotesToolbar } from "@/components/notes/NotesToolbar";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";

const NotesPage = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <CreateNoteModal onNoteCreated={setSelectedNoteId} />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Notes List */}
        <div className="w-80 border-r border-border bg-card/30">
          <NotesListSidebar
            searchQuery={searchQuery}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            showFilters={showFilters}
          />
        </div>

        {/* Main Content - Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <NotesToolbar selectedNoteId={selectedNoteId} />
          
          {/* Editor */}
          <div className="flex-1 p-6">
            {selectedNoteId ? (
              <NoteEditor noteId={selectedNoteId} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    Selecciona una nota
                  </h3>
                  <p className="text-muted-foreground/80 mb-4">
                    Tria una nota de la llista o crea'n una de nova per començar
                  </p>
                  <CreateNoteModal 
                    onNoteCreated={setSelectedNoteId}
                    trigger={
                      <Button className="bg-gradient-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear primera nota
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Metadata Panel */}
        {selectedNoteId && (
          <div className="w-80 border-l border-border bg-card/30">
            <NoteMetadataPanel noteId={selectedNoteId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;