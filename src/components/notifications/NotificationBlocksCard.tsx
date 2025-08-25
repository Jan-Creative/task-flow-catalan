import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Package, Edit2, Trash2, Loader2 } from "lucide-react";
import { NotificationBlockModal } from "./NotificationBlockModal";
import { useNotificationBlocks } from "@/hooks/useNotificationBlocks";

export const NotificationBlocksCard = () => {
  const { 
    blocks, 
    isLoading, 
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    toggleBlock,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling
  } = useNotificationBlocks();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    blockId?: string;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const handleToggleBlock = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      toggleBlock({ blockId, isActive: !block.is_active });
    }
  };

  const handleCreateBlock = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  const handleEditBlock = (blockId: string) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      blockId
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (window.confirm('Estàs segur que vols eliminar aquest bloc?')) {
      deleteBlock(blockId);
    }
  };

  const handleSaveBlock = (blockData: any) => {
    // Convert the modal data format to our hook format
    const formattedData = {
      name: blockData.name,
      description: blockData.description,
      is_active: blockData.isActive,
      notifications: blockData.notifications
    };

    if (modalState.mode === 'create') {
      createBlock(formattedData);
    } else if (modalState.mode === 'edit' && modalState.blockId) {
      updateBlock({ blockId: modalState.blockId, blockData: formattedData });
    }
    
    setModalState({ isOpen: false, mode: 'create' });
  };

  // Convert block data format for the modal
  const editingBlock = modalState.blockId 
    ? (() => {
        const block = blocks.find(b => b.id === modalState.blockId);
        return block ? {
          ...block,
          isActive: block.is_active
        } : null;
      })()
    : null;

  if (error) {
    return (
      <Card className="animate-fade-in h-full" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4 pt-6">
          <div className="text-center py-8 text-destructive">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Error al carregar els blocs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="animate-fade-in h-full" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Blocs i rutines
            </CardTitle>
            <Button
              onClick={handleCreateBlock}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nou
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {blocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tens blocs creats</p>
              </div>
            ) : (
              blocks.map(block => (
                <div
                  key={block.id}
                  className="p-3 bg-secondary/20 rounded-lg border border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{block.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {block.notifications.length} notif.
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {block.description}
                      </p>
                    </div>
                    
                    <Switch
                      checked={block.is_active}
                      onCheckedChange={() => handleToggleBlock(block.id)}
                      className="ml-2"
                      disabled={isToggling}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      onClick={() => handleEditBlock(block.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteBlock(block.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <NotificationBlockModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={editingBlock}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        onSave={handleSaveBlock}
      />
    </>
  );
};