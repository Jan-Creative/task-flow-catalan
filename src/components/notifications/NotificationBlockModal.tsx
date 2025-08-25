import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface BlockNotification {
  id: string;
  title: string;
  message: string;
  time: string;
}

interface NotificationBlock {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  notifications: BlockNotification[];
}

interface NotificationBlockModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: NotificationBlock | null;
  onClose: () => void;
  onSave: (data: Omit<NotificationBlock, 'id'>) => void;
}

export const NotificationBlockModal = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave
}: NotificationBlockModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: false,
    notifications: [] as BlockNotification[]
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        isActive: initialData.isActive,
        notifications: [...initialData.notifications]
      });
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: false,
        notifications: []
      });
    }
  }, [initialData, mode, isOpen]);

  const handleAddNotification = () => {
    const newNotification: BlockNotification = {
      id: Date.now().toString(),
      title: "",
      message: "",
      time: "09:00"
    };
    
    setFormData(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
  };

  const handleUpdateNotification = (id: string, field: keyof BlockNotification, value: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === id
          ? { ...notification, [field]: value }
          : notification
      )
    }));
  };

  const handleRemoveNotification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notification => notification.id !== id)
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("El nom del bloc és obligatori");
      return;
    }

    if (formData.notifications.length === 0) {
      toast.error("Afegeix almenys una notificació al bloc");
      return;
    }

    const hasEmptyNotifications = formData.notifications.some(
      notification => !notification.title.trim() || !notification.message.trim()
    );

    if (hasEmptyNotifications) {
      toast.error("Omple tots els camps de les notificacions");
      return;
    }

    onSave(formData);
    toast.success(mode === 'create' ? "Bloc creat correctament" : "Bloc actualitzat correctament");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear nou bloc' : 'Editar bloc'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informació bàsica del bloc */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="blockName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nom del bloc
              </Label>
              <Input
                id="blockName"
                placeholder="Ex: Dia intens, Rutina matinal..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="blockDescription" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Descripció (opcional)
              </Label>
              <Textarea
                id="blockDescription"
                placeholder="Descripció del bloc de notificacions..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
          </div>

          {/* Notificacions del bloc */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Notificacions del bloc
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Configura les notificacions que s'enviaran quan s'activi aquest bloc
                </p>
              </div>
              <Button
                onClick={handleAddNotification}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Afegir
              </Button>
            </div>

            <div className="space-y-3">
              {formData.notifications.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-lg text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hi ha notificacions configurades</p>
                  <p className="text-xs opacity-75">Afegeix la primera notificació</p>
                </div>
              ) : (
                formData.notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="p-4 bg-secondary/20 rounded-lg border border-border/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Notificació {index + 1}
                      </Badge>
                      <Button
                        onClick={() => handleRemoveNotification(notification.id)}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Títol</Label>
                        <Input
                          placeholder="Títol..."
                          value={notification.title}
                          onChange={(e) => handleUpdateNotification(notification.id, 'title', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Hora</Label>
                        <Input
                          type="time"
                          value={notification.time}
                          onChange={(e) => handleUpdateNotification(notification.id, 'time', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <Label className="text-xs">Missatge</Label>
                        <Input
                          placeholder="Missatge..."
                          value={notification.message}
                          onChange={(e) => handleUpdateNotification(notification.id, 'message', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Botons d'acció */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel·lar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              {mode === 'create' ? 'Crear bloc' : 'Guardar canvis'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};