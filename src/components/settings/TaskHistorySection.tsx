import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { useTaskCleanup } from '@/hooks/useTaskCleanup';
import { Archive, Calendar, Download, Folder, Search, Trash2, BarChart3 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ca } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const TaskHistorySection = () => {
  const { 
    taskHistory, 
    loading, 
    clearHistory, 
    clearingHistory,
    deleteFromHistory,
    deletingFromHistory 
  } = useTaskHistory();
  
  const { exportTaskData } = useTaskCleanup();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = taskHistory.filter(task => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const taskDate = new Date(task.archived_at);
        const filterDate = new Date(selectedMonth);
        const monthStart = startOfMonth(filterDate);
        const monthEnd = endOfMonth(filterDate);
        
        if (!isWithinInterval(taskDate, { start: monthStart, end: monthEnd })) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [taskHistory, searchTerm, selectedMonth, selectedPriority]);

  // Statistics
  const stats = useMemo(() => {
    const total = taskHistory.length;
    const byPriority = taskHistory.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thisMonth = taskHistory.filter(task => {
      const taskDate = new Date(task.archived_at);
      const now = new Date();
      return taskDate.getMonth() === now.getMonth() && 
             taskDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, byPriority, thisMonth };
  }, [taskHistory]);

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    taskHistory.forEach(task => {
      const date = new Date(task.archived_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [taskHistory]);

  const handleDeleteSelected = () => {
    if (selectedTasks.length > 0) {
      deleteFromHistory(selectedTasks);
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Historial de Tasques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregant historial...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Historial de Tasques
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportTaskData}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={clearingHistory}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Netejar tot
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar neteja d'historial</AlertDialogTitle>
                  <AlertDialogDescription>
                    Aquesta acció eliminarà permanentment tot l'historial de tasques completades. 
                    No es pot desfer. Vols continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearHistory()}>
                    Eliminar tot
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Aquest mes</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.thisMonth}</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Alta prioritat</span>
            <p className="text-lg font-bold text-red-500">{stats.byPriority.alta || 0}</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Mitjana prioritat</span>
            <p className="text-lg font-bold text-yellow-500">{stats.byPriority.mitjana || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cercar tasques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar per mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tots els mesos</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month), 'MMMM yyyy', { locale: ca })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar per prioritat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Totes les prioritats</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="mitjana">Mitjana</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selection controls */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedTasks.length === filteredTasks.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
              </Button>
              {selectedTasks.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.length} seleccionades
                </span>
              )}
            </div>
            
            {selectedTasks.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deletingFromHistory}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar seleccionades
              </Button>
            )}
          </div>
        )}

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {taskHistory.length === 0 
              ? 'No hi ha tasques a l\'historial encara'
              : 'No s\'han trobat tasques amb els filtres aplicats'
            }
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                    className="rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {task.title}
                      </h4>
                      {task.folder_name && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Folder className="h-3 w-3" />
                          <span>{task.folder_name}</span>
                        </div>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Arxivada: {format(new Date(task.archived_at), 'dd/MM/yyyy HH:mm', { locale: ca })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};