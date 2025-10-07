import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useSmartFolders } from "@/hooks/useSmartFolders";
import { Briefcase, Brain, Sparkles, Plus } from "lucide-react";
import { FolderItem } from "@/components/FolderItem";
import { UnifiedFolderModal } from "@/components/folders/UnifiedFolderModal";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CreateProjectModalLazy, LazyModal } from "@/lib/lazyLoading";

const FoldersPage = React.memo(() => {
  const { tasks, folders, createFolder, updateFolder, deleteFolder, loading } = useDadesApp();
  const { createSmartFolder, smartFolders, regularFolders, smartFolderStats } = useSmartFolders();
  const navigate = useNavigate();
  
  // Unified folder modal state
  const [showUnifiedFolderModal, setShowUnifiedFolderModal] = useState(false);
  
  // Edit folder state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string; color: string } | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderColor, setEditFolderColor] = useState("#6366f1");
  
  // Delete folder state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<{ id: string; name: string } | null>(null);

  // Project modal state
  const [showCreateProject, setShowCreateProject] = useState(false);

  const colorOptions = [
    "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
    "#f59e0b", "#ef4444", "#ec4899", "#84cc16"
  ];

  const getTaskCountByFolder = (folderId: string) => {
    return tasks.filter(task => task.folder_id === folderId).length;
  };

  const getTaskCountWithoutFolder = () => {
    return tasks.filter(task => !task.folder_id).length;
  };

  const handleUnifiedFolderSubmit = async (data: any, isSmartFolder: boolean) => {
    if (isSmartFolder) {
      await createSmartFolder({
        name: data.name,
        color: data.color,
        icon: data.icon,
        smart_rules: data.smart_rules
      });
    } else {
      await createFolder({ 
        name: data.name, 
        color: data.color,
        icon: data.icon || 'Folder'
      });
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

  const onSelectFolder = (folderId: string | null) => {
    console.log("Selected folder:", folderId);
    // Navigation will be implemented in future versions
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Carpetes</h1>
          {smartFolderStats.total > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>
                {smartFolderStats.active} carpetes intel·ligents actives • 
                {smartFolderStats.tasksAutoAssigned} tasques automatitzades
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleCreateProject}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Nou Projecte
          </Button>
          <Button 
            onClick={() => setShowUnifiedFolderModal(true)}
            className="bg-gradient-primary hover:scale-105 transition-bounce"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Carpeta
          </Button>
        </div>
      </div>

      {/* Bustia (Inbox) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground/80">Bustia</h2>
        {(() => {
          const inboxFolder = folders.find(f => f.is_system && f.name === 'Bustia');
          return (
            <FolderItem
              folder={inboxFolder || {
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
          );
        })()}
      </div>

      {/* Regular folders */}
      {regularFolders.filter(folder => !folder.is_system).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground/80">Carpetes Normals</h2>
          <div className="space-y-2">
            {regularFolders.filter(folder => !folder.is_system).map((folder) => (
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
      )}

      {/* Smart folders */}
      {smartFolders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground/80 flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Carpetes Intel·ligents
          </h2>
          <div className="space-y-2">
            {smartFolders.map((folder) => (
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
      )}

      {/* Unified folder modal */}
      <UnifiedFolderModal
        open={showUnifiedFolderModal}
        onClose={() => setShowUnifiedFolderModal(false)}
        onSubmit={handleUnifiedFolderSubmit}
      />

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

      {/* Create project modal */}
      <LazyModal>
        <CreateProjectModalLazy
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          onCreated={(id) => navigate(`/project/${id}`)}
        />
      </LazyModal>

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
});

export default FoldersPage;