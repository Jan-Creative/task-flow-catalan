import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Edit, Sparkles, TrendingUp } from 'lucide-react';
import { useDailyReflections } from '@/hooks/useDailyReflections';
import { useDadesApp } from '@/hooks/useDadesApp';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import type { CreateReflectionData } from '@/types/reflection';
import { MoodSelectorCard } from './reflection/MoodSelectorCard';
import { MetricsCard } from './reflection/MetricsCard';
import { EmotionalTagsCard } from './reflection/EmotionalTagsCard';
import { PersonalNotesCard } from './reflection/PersonalNotesCard';

interface DailyReflectionCardProps {
  date: Date;
}

export function DailyReflectionCard({ date }: DailyReflectionCardProps) {
  const dateString = format(date, 'yyyy-MM-dd');
  const { useReflectionByDate, saveReflection, isSaving } = useDailyReflections();
  const { data: existingReflection } = useReflectionByDate(dateString);
  const { tasks } = useDadesApp();
  
  const [isEditing, setIsEditing] = useState(!existingReflection);
  const [formData, setFormData] = useState<CreateReflectionData>({
    reflection_date: dateString,
    day_rating: 5,
    work_satisfaction: 5,
    energy_level: 5,
    stress_level: 5,
    tasks_completed_percentage: 0,
    notes: '',
    accomplishments: [],
    obstacles: [],
    mood_tags: [],
    gratitude_notes: '',
    tomorrow_focus: ''
  });

  // Calculate tasks completed percentage
  useEffect(() => {
    if (tasks.length > 0) {
      const completedToday = tasks.filter(task => 
        task.status === 'completada' && 
        format(new Date(task.created_at), 'yyyy-MM-dd') === dateString
      ).length;
      const totalTasks = tasks.filter(task => 
        format(new Date(task.created_at), 'yyyy-MM-dd') <= dateString
      ).length;
      
      const percentage = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;
      setFormData(prev => ({ ...prev, tasks_completed_percentage: percentage }));
    }
  }, [tasks, dateString]);

  // Load existing reflection data
  useEffect(() => {
    if (existingReflection) {
      setFormData({
        reflection_date: existingReflection.reflection_date,
        day_rating: existingReflection.day_rating,
        work_satisfaction: existingReflection.work_satisfaction,
        energy_level: existingReflection.energy_level,
        stress_level: existingReflection.stress_level,
        tasks_completed_percentage: existingReflection.tasks_completed_percentage,
        notes: existingReflection.notes || '',
        accomplishments: existingReflection.accomplishments || [],
        obstacles: existingReflection.obstacles || [],
        mood_tags: existingReflection.mood_tags || [],
        gratitude_notes: existingReflection.gratitude_notes || '',
        tomorrow_focus: existingReflection.tomorrow_focus || ''
      });
      setIsEditing(false);
    }
  }, [existingReflection]);

  const handleSave = async () => {
    try {
      await saveReflection({ date: dateString, data: formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  const toggleMoodTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      mood_tags: prev.mood_tags?.includes(tag) 
        ? prev.mood_tags.filter(t => t !== tag)
        : [...(prev.mood_tags || []), tag]
    }));
  };

  const toggleAccomplishment = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      accomplishments: prev.accomplishments?.includes(tag) 
        ? prev.accomplishments.filter(t => t !== tag)
        : [...(prev.accomplishments || []), tag]
    }));
  };

  const toggleObstacle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      obstacles: prev.obstacles?.includes(tag) 
        ? prev.obstacles.filter(t => t !== tag)
        : [...(prev.obstacles || []), tag]
    }));
  };

  const getRatingEmoji = (value: number) => {
    if (value <= 2) return '😔';
    if (value <= 4) return '😐';
    if (value <= 6) return '😊';
    if (value <= 8) return '😄';
    return '🤩';
  };

  const formatDate = format(date, "EEEE, d MMMM", { locale: ca });

  if (!isEditing && existingReflection) {
    return (
      <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Reflexió del Dia
            <Sparkles className="h-4 w-4 text-primary-glow animate-pulse" />
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="bg-secondary/50 hover:bg-secondary/70 border-border/50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground capitalize font-medium">{formatDate}</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20"
              style={{
                boxShadow: '0 0 20px hsl(var(--primary) / 0.1)'
              }}
            >
              <div className="text-3xl mb-2">{getRatingEmoji(existingReflection.day_rating)}</div>
              <div className="text-sm font-medium text-muted-foreground">Puntuació del dia</div>
              <div className="text-xl font-bold text-primary">{existingReflection.day_rating}/10</div>
            </div>
            <div 
              className="text-center p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20"
              style={{
                boxShadow: '0 0 20px hsl(var(--success) / 0.1)'
              }}
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm font-medium text-muted-foreground">Tasques completades</div>
              <div className="text-xl font-bold text-success">{existingReflection.tasks_completed_percentage}%</div>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-secondary/20 border border-border/30">
              <div className="text-xs text-muted-foreground">Satisfacció</div>
              <div className="text-lg font-semibold text-primary">{existingReflection.work_satisfaction}/10</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/20 border border-border/30">
              <div className="text-xs text-muted-foreground">Energia</div>
              <div className="text-lg font-semibold text-warning">{existingReflection.energy_level}/10</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/20 border border-border/30">
              <div className="text-xs text-muted-foreground">Estrès</div>
              <div className="text-lg font-semibold text-destructive">{existingReflection.stress_level}/10</div>
            </div>
          </div>

          {existingReflection.mood_tags && existingReflection.mood_tags.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Estat d'ànim i experiències
              </div>
              <div className="flex flex-wrap gap-2">
                {existingReflection.mood_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(existingReflection.notes || existingReflection.gratitude_notes) && (
            <div className="space-y-3">
              {existingReflection.notes && (
                <div>
                  <div className="text-sm font-medium mb-2">Notes i reflexions</div>
                  <div className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-border/30">
                    {existingReflection.notes}
                  </div>
                </div>
              )}
              {existingReflection.gratitude_notes && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-destructive" />
                    Gratitud
                  </div>
                  <div className="text-sm text-muted-foreground bg-destructive/5 p-4 rounded-xl border border-destructive/20">
                    {existingReflection.gratitude_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary-glow/5 to-primary/10 border-primary/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-primary animate-pulse" />
            {existingReflection ? 'Editar Reflexió del Dia' : 'Nova Reflexió del Dia'}
            <Sparkles className="h-5 w-5 text-primary-glow" />
          </CardTitle>
          <div className="text-sm text-muted-foreground capitalize font-medium">{formatDate}</div>
        </CardHeader>
      </Card>

      {/* Mood Selector - Main hero component */}
      <MoodSelectorCard
        value={formData.day_rating}
        onChange={(value) => setFormData(prev => ({ ...prev, day_rating: value }))}
        disabled={isSaving}
      />

      {/* Metrics */}
      <MetricsCard
        workSatisfaction={formData.work_satisfaction}
        energyLevel={formData.energy_level}
        stressLevel={formData.stress_level}
        onWorkSatisfactionChange={(value) => setFormData(prev => ({ ...prev, work_satisfaction: value }))}
        onEnergyLevelChange={(value) => setFormData(prev => ({ ...prev, energy_level: value }))}
        onStressLevelChange={(value) => setFormData(prev => ({ ...prev, stress_level: value }))}
        disabled={isSaving}
      />

      {/* Emotional Tags */}
      <EmotionalTagsCard
        moodTags={formData.mood_tags || []}
        accomplishments={formData.accomplishments || []}
        obstacles={formData.obstacles || []}
        onToggleMoodTag={toggleMoodTag}
        onToggleAccomplishment={toggleAccomplishment}
        onToggleObstacle={toggleObstacle}
        disabled={isSaving}
      />

      {/* Personal Notes & Save */}
      <PersonalNotesCard
        notes={formData.notes}
        gratitudeNotes={formData.gratitude_notes || ''}
        tomorrowFocus={formData.tomorrow_focus}
        onNotesChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
        onGratitudeNotesChange={(value) => setFormData(prev => ({ ...prev, gratitude_notes: value }))}
        onTomorrowFocusChange={(value) => setFormData(prev => ({ ...prev, tomorrow_focus: value }))}
        onSave={handleSave}
        isSaving={isSaving}
        disabled={isSaving}
      />
    </div>
  );
}