import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDadesApp } from "@/hooks/useDadesApp";
import { FolderPlus } from "lucide-react";
import { FolderItem } from "@/components/FolderItem";
import { cn } from "@/lib/utils";

const FoldersPage = () => {
  const { tasks, folders, createFolder, updateFolder, deleteFolder, loading } = useDadesApp();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  // Edit folder state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string; color: string } | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderColor, setEditFolderColor] = useState("#6366f1");
  
  // Delete folder state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<{ id: string; name: string } | null>(null);

  const getTaskCountByFolder = (folderId: string) => {
    return tasks.filter(task => task.folder_id === folderId).length;
  };

  const getTaskCountWithoutFolder = () => {
    return tasks.filter(task => !task.folder_id).length;
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName("");
      setShowCreateDialog(false);
    }
  };

  const handleEditFolder = (folder: { id: string; name: string; color: string }) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderColor(folder.color);
    setShowEditDialog(true);
  };

  const handleUpdateFolder = () => {
    if (editingFolder && editFolderName.trim()) {
      updateFolder(editingFolder.id, {
        name: editFolderName.trim(),
        color: editFolderColor
      });
      setShowEditDialog(false);
      setEditingFolder(null);
      setEditFolderName("");
      setEditFolderColor("#6366f1");
    }
  };

  const handleDeleteFolder = (folder: { id: string; name: string }) => {
    setDeletingFolder(folder);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFolder = async () => {
    if (deletingFolder) {
      const success = await deleteFolder(deletingFolder.id);
      if (success) {
        setShowDeleteDialog(false);
        setDeletingFolder(null);
      }
    }
  };

  const colorOptions = [
    "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", 
    "#f59e0b", "#ef4444", "#ec4899", "#84cc16"
  ];

  const onSelectFolder = (folderId: string | null) => {
    // Navigate to tasks filtered by folder
    // TODO: Implement folder navigation
  };

  if (loading) {
    return (
      <div className="p-6 pb-24">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregant carpetes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Carpetes</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <FolderPlus className="mr-2 h-4 w-4" />
              Nova carpeta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-glass border-border/50 shadow-elevated sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Carpeta</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nom de la carpeta..."
                  className="bg-input/80 border-border/50 focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateFolder();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 bg-secondary/50 border-border/50"
                >
                  Cancel·lar
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  className="flex-1 bg-gradient-primary hover:scale-105 transition-bounce"
                  disabled={!newFolderName.trim()}
                >
                  Crear Carpeta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bustia (Inbox) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground/80">Bustia</h2>
        <FolderItem
          folder={{
            id: 'inbox',
            name: 'Bustia',
            color: 'hsl(var(--primary))',
            is_system: true
          }}
          taskCount={getTaskCountWithoutFolder()}
          onSelect={() => onSelectFolder(null)}
          onEdit={() => {}}
          onDelete={() => {}}
          isInbox={true}
        />
      </div>

      {/* User's folders */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground/80">Les meves carpetes</h2>
        <div className="space-y-2">
          {folders.filter(f => !f.is_system).map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              taskCount={getTaskCountByFolder(folder.id)}
              onSelect={() => onSelectFolder(folder.id)}
              onEdit={() => handleEditFolder(folder)}
              onDelete={() => handleDeleteFolder(folder)}
            />
          ))}
        </div>
      </div>


      {/* Edit folder dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-glass border-border/50 shadow-elevated sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Carpeta</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                placeholder="Nom de la carpeta..."
                className="bg-input/80 border-border/50 focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateFolder();
                  }
                }}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Color de la carpeta</p>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditFolderColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      editFolderColor === color 
                        ? "border-foreground scale-110" 
                        : "border-border hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1 bg-secondary/50 border-border/50"
              >
                Cancel·lar
              </Button>
              <Button
                onClick={handleUpdateFolder}
                className="flex-1 bg-gradient-primary hover:scale-105 transition-bounce"
                disabled={!editFolderName.trim()}
              >
                Actualitzar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete folder confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Carpeta</AlertDialogTitle>
            <AlertDialogDescription>
              Estàs segur que vols eliminar la carpeta "{deletingFolder?.name}"? 
              Aquesta acció no es pot desfer. La carpeta només s'eliminarà si no conté tasques.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary/50 border-border/50">
              Cancel·lar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteFolder}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FoldersPage;