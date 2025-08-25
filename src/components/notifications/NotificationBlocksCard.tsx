import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Package, Edit2, Trash2 } from "lucide-react";
import { NotificationBlockModal } from "./NotificationBlockModal";

interface NotificationBlock {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
  }>;
}

export const NotificationBlocksCard = () => {
  const [blocks, setBlocks] = useState<NotificationBlock[]>([
    {
      id: "1",
      name: "Dia intens",
      description: "Motivació per dies de molt treball",
      isActive: true,
      notifications: [
        { id: "1", title: "Bon dia!", message: "Comença el dia amb energia", time: "10:00" },
        { id: "2", title: "Descans", message: "Fes una pausa i respira", time: "17:30" },
        { id: "3", title: "Final del dia", message: "Has treballat dur avui!", time: "20:30" }
      ]
    },
    {
      id: "2", 
      name: "Rutina matinal",
      description: "Recordatoris per començar bé el dia",
      isActive: false,
      notifications: [
        { id: "4", title: "Exercici", message: "Temps d'activitat física", time: "07:00" },
        { id: "5", title: "Esmorzar", message: "No oblidis esmorzar sa", time: "08:30" }
      ]
    }
  ]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    blockId?: string;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const handleToggleBlock = (blockId: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, isActive: !block.isActive }
        : block
    ));
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
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSaveBlock = (blockData: Omit<NotificationBlock, 'id'>) => {
    if (modalState.mode === 'create') {
      const newBlock: NotificationBlock = {
        id: Date.now().toString(),
        ...blockData
      };
      setBlocks(prev => [...prev, newBlock]);
    } else if (modalState.mode === 'edit' && modalState.blockId) {
      setBlocks(prev => prev.map(block => 
        block.id === modalState.blockId 
          ? { ...block, ...blockData }
          : block
      ));
    }
    
    setModalState({ isOpen: false, mode: 'create' });
  };

  const editingBlock = modalState.blockId 
    ? blocks.find(block => block.id === modalState.blockId)
    : null;

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
                      checked={block.isActive}
                      onCheckedChange={() => handleToggleBlock(block.id)}
                      className="ml-2"
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