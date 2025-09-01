import React, { useState } from 'react';
import { usePrepareTomorrow } from '@/hooks/usePrepareTomorrow';
import { useDadesApp } from '@/hooks/useDadesApp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Clock, Target, FolderOpen, NotebookPen, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { ca } from 'date-fns/locale';

export default function PrepareTomorrowPage() {
  const navigate = useNavigate();
  const { preparation, loading, updateNotes, markCompleted, tomorrow } = usePrepareTomorrow();
  const { tasks, folders } = useDadesApp();
  
  const [notes, setNotes] = useState(preparation?.notes || '');
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    preparation?.planned_tasks?.map(t => t.id) || []
  );

  const tomorrowDate = format(addDays(new Date(), 1), "EEEE, d 'de' MMMM", { locale: ca });
  
  // Filter overdue and today's tasks for suggestions
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completada'
  );
  
  const todayTasks = tasks.filter(task => 
    task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    && task.status !== 'completada'
  );

  const pendingTasks = tasks.filter(task => task.status === 'pendent');

  const handleSaveNotes = async () => {
    await updateNotes(notes);
  };

  const handleMarkCompleted = async () => {
    await markCompleted();
    navigate('/');
  };

  const progressPercentage = preparation?.is_completed ? 100 : 
    (selectedTasks.length > 0 ? 50 : 0) + (notes.length > 0 ? 25 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregant preparació...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tornar al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Preparar el Dia de Demà
              </h1>
              <p className="text-muted-foreground">{tomorrowDate}</p>
            </div>
          </div>
          {preparation?.is_completed && (
            <Badge variant="default" className="bg-green-500/20 text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completada
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Progres de Preparació
            </CardTitle>
            <CardDescription>
              Completa els passos per tenir un dia demà ben planificat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progres total</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Planning */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Tasques Suggerides per Demà
              </CardTitle>
              <CardDescription>
                Revisa i selecciona les tasques que vols abordar demà
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overdueTasks.length > 0 && (
                <div>
                  <h4 className="font-medium text-destructive mb-2">Tasques Vençudes</h4>
                  <div className="space-y-2">
                    {overdueTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Vençuda: {format(new Date(task.due_date!), "d 'de' MMMM", { locale: ca })}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">Vençuda</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayTasks.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Tasques d'Avui Pendents</h4>
                  <div className="space-y-2">
                    {todayTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">Per completar avui</p>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Avui</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tasques Pendents</h4>
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 4).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          {task.folder_id && (
                            <p className="text-sm text-muted-foreground">
                              {folders.find(f => f.id === task.folder_id)?.name}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">Pendent</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTasks.length > 0 && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    {selectedTasks.length} tasques seleccionades per demà
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Organització Ràpida
              </CardTitle>
              <CardDescription>
                Revisa l'estat de les teves carpetes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {folders.slice(0, 4).map(folder => {
                const folderTasks = tasks.filter(t => t.folder_id === folder.id);
                const completedTasks = folderTasks.filter(t => t.status === 'completada');
                
                return (
                  <div key={folder.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: folder.color }} 
                      />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{folderTasks.length} tasques</p>
                      <p className="text-xs text-muted-foreground">
                        {completedTasks.length} completades
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="h-5 w-5 text-primary" />
                Notes de Preparació
              </CardTitle>
              <CardDescription>
                Apunta reflexions, objectius o recordatoris per demà
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Objectius per demà, coses a recordar, reflexions del dia d'avui..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button onClick={handleSaveNotes} variant="outline" className="w-full">
                Guardar Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleMarkCompleted}
                className="px-8"
                disabled={preparation?.is_completed}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {preparation?.is_completed ? 'Preparació Completada' : 'Marcar com Completada'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Continuar Més Tard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}