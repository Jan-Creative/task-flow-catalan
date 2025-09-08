import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDailyReflections } from '@/hooks/useDailyReflections';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useReflectionAnalytics } from '@/hooks/useReflectionAnalytics';
import { useChallengesAnalytics } from '@/hooks/useChallengesAnalytics';
import { ReflectionDetailModal } from './ReflectionDetailModal';
import { 
  Heart, 
  Calendar, 
  Download, 
  Search, 
  Trash2, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Brain, 
  Target, 
  CheckCircle,
  Trophy,
  Star,
  Award,
  Flame,
  Clock
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { DailyReflection } from '@/types/reflection';
import type { DailyChallenge } from '@/types/challenges';
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

export const PersonalAnalyticsSection = () => {
  const { useAllReflections, deleteReflection } = useDailyReflections();
  const { data: reflections = [], isLoading: reflectionsLoading } = useAllReflections();
  const { challenges, loading: challengesLoading } = useDailyChallenges();
  
  const reflectionAnalytics = useReflectionAnalytics(reflections);
  const challengesAnalytics = useChallengesAnalytics(challenges);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedReflections, setSelectedReflections] = useState<string[]>([]);
  const [selectedReflectionForDetail, setSelectedReflectionForDetail] = useState<DailyReflection | null>(null);

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

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    let filtered = challenges.filter(challenge => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = challenge.title.toLowerCase().includes(searchLower);
        const matchesDescription = challenge.description?.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const challengeDate = new Date(challenge.challenge_date);
        const filterDate = new Date(selectedMonth);
        const monthStart = startOfMonth(filterDate);
        const monthEnd = endOfMonth(filterDate);
        
        if (!isWithinInterval(challengeDate, { start: monthStart, end: monthEnd })) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [challenges, searchTerm, selectedMonth]);

  // Get unique months for filter (from both reflections and challenges)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    
    reflections.forEach(reflection => {
      const date = new Date(reflection.reflection_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    challenges.forEach(challenge => {
      const date = new Date(challenge.challenge_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months).sort().reverse();
  }, [reflections, challenges]);

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

  const exportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      reflections: {
        total: reflections.length,
        analytics: reflectionAnalytics,
        data: reflections
      },
      challenges: {
        total: challenges.length,
        analytics: challengesAnalytics,
        data: challenges
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_personals_${format(new Date(), 'yyyy-MM-dd')}.json`;
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

  const getTasksCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getChallengeCategory = (category: string) => {
    const categoryMap = {
      'personal': 'Personal',
      'work': 'Treball',
      'health': 'Salut',
      'learning': 'Aprenentatge',
      'creativity': 'Creativitat'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const getChallengeDifficulty = (difficulty: string) => {
    const difficultyMap = {
      'easy': 'Fàcil',
      'medium': 'Mitjà',
      'hard': 'Difícil'
    };
    return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty;
  };

  const handleReflectionClick = (reflection: DailyReflection) => {
    setSelectedReflectionForDetail(reflection);
  };

  if (reflectionsLoading || challengesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Personals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregant analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Personals
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="reflections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reflections" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Reflexions
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Reptes Diaris
            </TabsTrigger>
            <TabsTrigger value="combined" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vista Combinada
            </TabsTrigger>
          </TabsList>

          {/* Reflections Tab */}
          <TabsContent value="reflections" className="space-y-6">
            {/* Reflection Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-pink-500">{reflectionAnalytics.totalReflections}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Aquest mes</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{reflectionAnalytics.currentMonthReflections}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Ratxa dies</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">{reflectionAnalytics.streakDays}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Mitjana dia</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">
                  {reflectionAnalytics.averageRatings.day_rating.toFixed(1)}
                </p>
              </div>
            </div>

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
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => handleReflectionClick(reflection)}
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {format(new Date(reflection.reflection_date), 'dd MMMM yyyy', { locale: ca })}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRatingColor(reflection.day_rating)}`}
                          >
                            {getRatingBadge(reflection.day_rating)} ({reflection.day_rating}/10)
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            {/* Challenge Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">{challengesAnalytics.totalChallenges}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Completats</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{challengesAnalytics.completedChallenges}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">% Èxit</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">{challengesAnalytics.completionRate.toFixed(1)}%</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Ratxa</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">{challengesAnalytics.streakDays}</p>
              </div>
            </div>

            {/* Category and Difficulty Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Per categoria</h4>
                <div className="space-y-2">
                  {challengesAnalytics.categoryStats.map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <span className="text-sm">{getChallengeCategory(stat.category)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stat.completed}/{stat.total}</span>
                        <Badge variant="outline" className="text-xs">
                          {stat.completionRate.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Per dificultat</h4>
                <div className="space-y-2">
                  {challengesAnalytics.difficultyStats.map((stat) => (
                    <div key={stat.difficulty} className="flex items-center justify-between">
                      <span className="text-sm">{getChallengeDifficulty(stat.difficulty)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stat.completed}/{stat.total}</span>
                        <Badge variant="outline" className="text-xs">
                          {stat.completionRate.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Challenges list */}
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {challenges.length === 0 
                  ? 'No hi ha reptes encara'
                  : 'No s\'han trobat reptes amb els filtres aplicats'
                }
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredChallenges.map((challenge) => (
                    <div 
                      key={challenge.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {challenge.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {challenge.is_completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getChallengeCategory(challenge.category)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getChallengeDifficulty(challenge.difficulty)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(challenge.challenge_date), 'dd MMMM yyyy', { locale: ca })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Combined Tab */}
          <TabsContent value="combined" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Combined Overview */}
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Resum General
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Reflexions totals</span>
                    <span className="font-medium">{reflectionAnalytics.totalReflections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reptes totals</span>
                    <span className="font-medium">{challengesAnalytics.totalChallenges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Productivitat mitjana</span>
                    <span className="font-medium">{reflectionAnalytics.averageRatings.tasks_completed_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Èxit en reptes</span>
                    <span className="font-medium">{challengesAnalytics.completionRate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Monthly Progress */}
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Aquest Mes
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Reflexions</span>
                    <span className="font-medium">{reflectionAnalytics.currentMonthReflections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reptes creats</span>
                    <span className="font-medium">{challengesAnalytics.currentMonthChallenges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reptes completats</span>
                    <span className="font-medium">{challengesAnalytics.currentMonthCompleted}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <ReflectionDetailModal 
        reflection={selectedReflectionForDetail}
        isOpen={!!selectedReflectionForDetail}
        onClose={() => setSelectedReflectionForDetail(null)}
      />
    </Card>
  );
};