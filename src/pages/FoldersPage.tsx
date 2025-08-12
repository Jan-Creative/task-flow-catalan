import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTasks } from "@/hooks/useTasks";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import { Folder, Plus, Inbox, MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FoldersPage = () => {
  const { tasks, folders, createFolder, updateFolder, deleteFolder, loading } = useTasks();
  const { getStatusLabel } = usePropertyLabels();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
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

  const getFolderTasks = (folderId: string) => {
    return tasks.filter(task => task.folder_id === folderId);
  };

  const getInboxTasks = () => {
    const inboxFolder = folders.find(f => f.is_system && f.name === "Bustia");
    if (inboxFolder) {
      return tasks.filter(task => task.folder_id === inboxFolder.id);
    }
    return tasks.filter(task => !task.folder_id);
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
    <div className="p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Carpetes</h1>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-primary hover:scale-105 transition-bounce"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Carpeta
        </Button>
      </div>

      {/* Inbox - System folder */}
      <Card className="bg-card/60 backdrop-blur-glass border-border/50 shadow-glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Inbox className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Bustia</h3>
                <p className="text-sm text-muted-foreground">Tasques sense assignar</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-accent/20">
              {getInboxTasks().length} tasques
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getInboxTasks().slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-accent/10 rounded-lg">
                <span className="text-sm font-medium truncate">{task.title}</span>
                <Badge variant="outline" className="text-xs">
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            ))}
            {getInboxTasks().length > 3 && (
              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  i {getInboxTasks().length - 3} tasques més...
                </span>
              </div>
            )}
            {getInboxTasks().length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                La bustia està buida
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User folders */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Les meves carpetes</h2>
        
        {folders.filter(folder => !folder.is_system).length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-glass border-border/50">
            <CardContent className="p-8 text-center">
              <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Encara no tens cap carpeta</p>
              <p className="text-sm text-muted-foreground mt-2">Crea la teva primera carpeta per organitzar les tasques</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folders
              .filter(folder => !folder.is_system)
              .map((folder) => (
                <Card 
                  key={folder.id} 
                  className="bg-card/60 backdrop-blur-glass border-border/50 shadow-glass hover:shadow-elevated transition-smooth cursor-pointer"
                  onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${folder.color}20` }}
                        >
                          <Folder 
                            className="h-5 w-5" 
                            style={{ color: folder.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getTaskCountByFolder(folder.id)} tasques
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-accent/20">
                          {getTaskCountByFolder(folder.id)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-sm border-border/50">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFolder(folder);
                              }}
                              className="cursor-pointer hover:bg-accent"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder);
                              }}
                              className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  {selectedFolder === folder.id && (
                    <CardContent>
                      <div className="space-y-2">
                        {getFolderTasks(folder.id).slice(0, 5).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 bg-accent/10 rounded-lg">
                            <span className="text-sm font-medium truncate">{task.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>
                        ))}
                        {getFolderTasks(folder.id).length > 5 && (
                          <div className="text-center pt-2">
                            <span className="text-xs text-muted-foreground">
                              i {getFolderTasks(folder.id).length - 5} tasques més...
                            </span>
                          </div>
                        )}
                        {getFolderTasks(folder.id).length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Aquesta carpeta està buida
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Create folder dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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