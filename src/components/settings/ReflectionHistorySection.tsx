import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDailyReflections } from '@/hooks/useDailyReflections';
import { useReflectionAnalytics } from '@/hooks/useReflectionAnalytics';
import { Heart, Calendar, Download, Search, Trash2, BarChart3, TrendingUp, Zap, Brain, Target } from 'lucide-react';
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

export const ReflectionHistorySection = () => {
  const { useAllReflections, deleteReflection } = useDailyReflections();
  const { data: reflections = [], isLoading: loading } = useAllReflections();
  const analytics = useReflectionAnalytics(reflections);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedReflections, setSelectedReflections] = useState<string[]>([]);

  // Filter reflections
  const filteredReflections = useMemo(() => {
    let filtered = reflections.filter(reflection => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesNotes = reflection.notes?.toLowerCase().includes(searchLower);
        const matchesAccomplishments = reflection.accomplishments?.some(a => 
          a.toLowerCase().includes(searchLower)
        );
        const matchesObstacles = reflection.obstacles?.some(o => 
          o.toLowerCase().includes(searchLower)
        );
        const matchesGratitude = reflection.gratitude_notes?.toLowerCase().includes(searchLower);
        const matchesFocus = reflection.tomorrow_focus?.toLowerCase().includes(searchLower);
        
        if (!matchesNotes && !matchesAccomplishments && !matchesObstacles && !matchesGratitude && !matchesFocus) {
          return false;
        }
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const reflectionDate = new Date(reflection.reflection_date);
        const filterDate = new Date(selectedMonth);
        const monthStart = startOfMonth(filterDate);
        const monthEnd = endOfMonth(filterDate);
        
        if (!isWithinInterval(reflectionDate, { start: monthStart, end: monthEnd })) {
          return false;
        }
      }

      // Mood filter (based on day_rating)
      if (selectedMood !== 'all') {
        if (selectedMood === 'high' && reflection.day_rating < 7) return false;
        if (selectedMood === 'medium' && (reflection.day_rating < 4 || reflection.day_rating > 7)) return false;
        if (selectedMood === 'low' && reflection.day_rating > 4) return false;
      }

      return true;
    });

    return filtered;
  }, [reflections, searchTerm, selectedMonth, selectedMood]);

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    reflections.forEach(reflection => {
      const date = new Date(reflection.reflection_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [reflections]);

  const handleDeleteSelected = async () => {
    if (selectedReflections.length > 0) {
      try {
        await Promise.all(selectedReflections.map(id => deleteReflection(id)));
        setSelectedReflections([]);
      } catch (error) {
        console.error('Error deleting reflections:', error);
      }
    }
  };

  const handleSelectReflection = (reflectionId: string) => {
    setSelectedReflections(prev => 
      prev.includes(reflectionId) 
        ? prev.filter(id => id !== reflectionId)
        : [...prev, reflectionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReflections.length === filteredReflections.length) {
      setSelectedReflections([]);
    } else {
      setSelectedReflections(filteredReflections.map(reflection => reflection.id));
    }
  };

  const exportReflections = () => {
    const data = {
      exported_at: new Date().toISOString(),
      total_reflections: reflections.length,
      analytics: analytics,
      reflections: reflections
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflexions_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    if (rating >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 8) return 'Excellent';
    if (rating >= 6) return 'Bé';
    if (rating >= 4) return 'Regular';
    return 'Difícil';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historial de Reflexions
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
            <Heart className="h-5 w-5" />
            Historial de Reflexions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportReflections}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
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
            <p className="text-2xl font-bold text-primary">{analytics.totalReflections}</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Aquest mes</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{analytics.currentMonthReflections}</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Ratxa dies</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{analytics.streakDays}</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">Mitjana dia</span>
            </div>
            <p className="text-2xl font-bold text-pink-500">
              {analytics.averageRatings.day_rating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Energia mitjana</span>
            </div>
            <p className="text-lg font-bold text-yellow-500">
              {analytics.averageRatings.energy_level.toFixed(1)}/10
            </p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Estrès mitjà</span>
            </div>
            <p className="text-lg font-bold text-purple-500">
              {analytics.averageRatings.stress_level.toFixed(1)}/10
            </p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Tasques completes</span>
            </div>
            <p className="text-lg font-bold text-green-500">
              {analytics.averageRatings.tasks_completed_percentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Top Mood Tags */}
        {analytics.topMoodTags.length > 0 && (
          <div className="bg-muted/20 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Estat d'ànim més freqüent</h4>
            <div className="flex flex-wrap gap-2">
              {analytics.topMoodTags.map(({ tag, count }) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cercar reflexions..."
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
          
          <Select value={selectedMood} onValueChange={setSelectedMood}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar per estat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tots els estats</SelectItem>
              <SelectItem value="high">Bon dia (8-10)</SelectItem>
              <SelectItem value="medium">Regular (4-7)</SelectItem>
              <SelectItem value="low">Difícil (1-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selection controls */}
        {filteredReflections.length > 0 && (
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedReflections.length === filteredReflections.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
              </Button>
              {selectedReflections.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedReflections.length} seleccionades
                </span>
              )}
            </div>
            
            {selectedReflections.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar seleccionades
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar eliminació</AlertDialogTitle>
                    <AlertDialogDescription>
                      Aquesta acció eliminarà permanentment les reflexions seleccionades. 
                      No es pot desfer. Vols continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* Reflections list */}
        {filteredReflections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {reflections.length === 0 
              ? 'No hi ha reflexions encara'
              : 'No s\'han trobat reflexions amb els filtres aplicats'
            }
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredReflections.map((reflection) => (
                <div 
                  key={reflection.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedReflections.includes(reflection.id)}
                    onChange={() => handleSelectReflection(reflection.id)}
                    className="rounded mt-1"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">
                          {format(new Date(reflection.reflection_date), 'dd MMMM yyyy', { locale: ca })}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRatingColor(reflection.day_rating)}`}
                        >
                          {getRatingBadge(reflection.day_rating)} ({reflection.day_rating}/10)
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reflection.tasks_completed_percentage}% tasques
                      </div>
                    </div>
                    
                    {reflection.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {reflection.notes}
                      </p>
                    )}
                    
                    {reflection.mood_tags && reflection.mood_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reflection.mood_tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {reflection.mood_tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{reflection.mood_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>Energia: {reflection.energy_level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3 text-purple-500" />
                        <span>Estrès: {reflection.stress_level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-500" />
                        <span>Satisfacció: {reflection.work_satisfaction}</span>
                      </div>
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