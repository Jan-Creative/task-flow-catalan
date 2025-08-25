import React, { useState } from 'react';
import { ArrowLeft, Bell, Plus, Clock, CheckCircle, Play, Square, Edit, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toastUtils';
import { FloatingBackgroundButton } from '@/components/backgrounds/FloatingBackgroundButton';
import BottomNavigation from '@/components/BottomNavigation';

interface NotificationBlock {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  notifications: BlockNotification[];
}

interface BlockNotification {
  id: string;
  title: string;
  message: string;
  time: string; // Format: "HH:MM"
}

interface NotificationBlockForm {
  name: string;
  description: string;
  notifications: BlockNotification[];
}

export default function NotificationsPage() {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NotificationBlockForm>({
    name: '',
    description: '',
    notifications: []
  });

  // Mock data for notification blocks
  const [notificationBlocks, setNotificationBlocks] = useState<NotificationBlock[]>([
    {
      id: '1',
      name: 'Dia intens',
      description: 'Notificacions per dies amb molta feina',
      isActive: true,
      notifications: [
        { id: '1-1', title: 'Motivació matutina', message: 'És hora de començar el dia amb energia!', time: '10:00' },
        { id: '1-2', title: 'Descans de tarda', message: 'Pren-te un descans i relaxa\'t', time: '17:30' },
        { id: '1-3', title: 'Revisió nocturna', message: 'Revisa les tasques del dia', time: '20:30' }
      ]
    },
    {
      id: '2',
      name: 'Cap de setmana',
      description: 'Recordatoris per al cap de setmana',
      isActive: false,
      notifications: [
        { id: '2-1', title: 'Bon matí!', message: 'Gaudeix del teu cap de setmana', time: '09:00' },
        { id: '2-2', title: 'Temps per tu', message: 'Dedica temps a les teves aficions', time: '15:00' }
      ]
    }
  ]);

  const handleToggleBlock = (blockId: string) => {
    setNotificationBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, isActive: !block.isActive }
          : block
      )
    );
    
    const block = notificationBlocks.find(b => b.id === blockId);
    if (block) {
      toast.success(`Bloc "${block.name}" ${!block.isActive ? 'activat' : 'desactivat'}`);
    }
  };

  const handleCreateBlock = () => {
    setCurrentView('create');
    setFormData({
      name: '',
      description: '',
      notifications: []
    });
  };

  const handleEditBlock = (blockId: string) => {
    const block = notificationBlocks.find(b => b.id === blockId);
    if (block) {
      setEditingBlockId(blockId);
      setCurrentView('edit');
      setFormData({
        name: block.name,
        description: block.description || '',
        notifications: [...block.notifications]
      });
    }
  };

  const handleSaveBlock = () => {
    if (!formData.name.trim()) {
      toast.error('El nom del bloc és obligatori');
      return;
    }

    if (formData.notifications.length === 0) {
      toast.error('Afegeix almenys una notificació al bloc');
      return;
    }

    if (currentView === 'create') {
      const newBlock: NotificationBlock = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        isActive: false,
        notifications: formData.notifications
      };
      setNotificationBlocks(prev => [...prev, newBlock]);
      toast.success('Bloc creat correctament');
    } else if (currentView === 'edit' && editingBlockId) {
      setNotificationBlocks(prev =>
        prev.map(block =>
          block.id === editingBlockId
            ? {
                ...block,
                name: formData.name,
                description: formData.description,
                notifications: formData.notifications
              }
            : block
        )
      );
      toast.success('Bloc actualitzat correctament');
    }

    setCurrentView('list');
    setEditingBlockId(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingBlockId(null);
    setFormData({
      name: '',
      description: '',
      notifications: []
    });
  };

  const handleAddNotification = () => {
    const newNotification: BlockNotification = {
      id: Date.now().toString(),
      title: '',
      message: '',
      time: '09:00'
    };
    setFormData(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
  };

  const handleUpdateNotification = (notificationId: string, field: keyof BlockNotification, value: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, [field]: value }
          : notification
      )
    }));
  };

  const handleRemoveNotification = (notificationId: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notification => notification.id !== notificationId)
    }));
  };

  const activeBlocks = notificationBlocks.filter(block => block.isActive).length;
  const totalNotifications = notificationBlocks.reduce((total, block) => total + block.notifications.length, 0);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="hover:bg-background/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Notificacions</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona els teus blocs de notificacions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {currentView === 'list' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Summary and Actions Card */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Resum</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-primary/5">
                      <div className="text-2xl font-bold text-primary">{activeBlocks}</div>
                      <div className="text-sm text-muted-foreground">Blocs actius</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold">{totalNotifications}</div>
                      <div className="text-sm text-muted-foreground">Notificacions totals</div>
                    </div>
                  </div>
                  <Button onClick={handleCreateBlock} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Nou bloc
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Blocks Card */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Blocs de notificacions
                  </CardTitle>
                  <CardDescription>
                    {notificationBlocks.length} blocs configurats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notificationBlocks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No hi ha blocs configurats
                      </p>
                    ) : (
                      notificationBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleEditBlock(block.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{block.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {block.notifications.length} notif.
                              </Badge>
                            </div>
                            {block.description && (
                              <p className="text-sm text-muted-foreground">{block.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={block.isActive}
                              onCheckedChange={() => handleToggleBlock(block.id)}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Blocks Details */}
            {activeBlocks > 0 && (
              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" />
                    Blocs actius
                  </CardTitle>
                  <CardDescription>
                    Notificacions que s'enviaran automàticament
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notificationBlocks
                      .filter(block => block.isActive)
                      .map((block, blockIndex) => (
                        <div key={block.id}>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <span>{block.name}</span>
                            <Badge variant="secondary" className="text-xs">Actiu</Badge>
                          </h4>
                          <div className="space-y-2 pl-4">
                            {block.notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                              >
                                <div>
                                  <span className="font-medium">{notification.title}</span>
                                  <span className="text-muted-foreground ml-2">- {notification.message}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {notification.time}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          {blockIndex < notificationBlocks.filter(b => b.isActive).length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Create/Edit Form */}
        {(currentView === 'create' || currentView === 'edit') && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentView === 'create' ? 'Crear nou bloc' : 'Editar bloc'}
              </CardTitle>
              <CardDescription>
                Configura un bloc de notificacions que es poden activar i desactivar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Block Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="blockName">Nom del bloc</Label>
                  <Input
                    id="blockName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Dia intens, Cap de setmana..."
                  />
                </div>
                <div>
                  <Label htmlFor="blockDescription">Descripció (opcional)</Label>
                  <Input
                    id="blockDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripció breu del bloc"
                  />
                </div>
              </div>

              <Separator />

              {/* Notifications List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Notificacions del bloc</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNotification}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Afegir notificació
                  </Button>
                </div>

                {formData.notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                    Afegeix notificacions a aquest bloc
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.notifications.map((notification, index) => (
                      <div key={notification.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Notificació {index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNotification(notification.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`title-${notification.id}`} className="text-xs">Títol</Label>
                            <Input
                              id={`title-${notification.id}`}
                              value={notification.title}
                              onChange={(e) => handleUpdateNotification(notification.id, 'title', e.target.value)}
                              placeholder="Títol de la notificació"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`time-${notification.id}`} className="text-xs">Hora</Label>
                            <Input
                              id={`time-${notification.id}`}
                              type="time"
                              value={notification.time}
                              onChange={(e) => handleUpdateNotification(notification.id, 'time', e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-1">
                            <Label htmlFor={`message-${notification.id}`} className="text-xs">Missatge</Label>
                            <Input
                              id={`message-${notification.id}`}
                              value={notification.message}
                              onChange={(e) => handleUpdateNotification(notification.id, 'message', e.target.value)}
                              placeholder="Contingut del missatge"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveBlock} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {currentView === 'create' ? 'Crear bloc' : 'Guardar canvis'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel·lar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed elements */}
      <FloatingBackgroundButton />
      <BottomNavigation 
        activeTab="notificacions"
        onTabChange={() => {}}
        onCreateTask={() => {}}
      />
    </div>
  );
}