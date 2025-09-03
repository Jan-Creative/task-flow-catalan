import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Brain, Zap, Frown, Save, Edit } from 'lucide-react';
import { useDailyReflections } from '@/hooks/useDailyReflections';
import { useDadesApp } from '@/hooks/useDadesApp';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import type { CreateReflectionData } from '@/types/reflection';
import { MOOD_TAGS, COMMON_OBSTACLES, COMMON_ACCOMPLISHMENTS } from '@/types/reflection';

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

  const toggleTag = (tag: string, type: 'mood' | 'obstacles' | 'accomplishments') => {
    const field = type === 'mood' ? 'mood_tags' : type === 'obstacles' ? 'obstacles' : 'accomplishments';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(tag) 
        ? prev[field].filter(t => t !== tag)
        : [...(prev[field] || []), tag]
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
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Reflexió del Dia
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground capitalize">{formatDate}</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl mb-1">{getRatingEmoji(existingReflection.day_rating)}</div>
              <div className="text-sm font-medium">Puntuació del dia</div>
              <div className="text-lg font-bold text-primary">{existingReflection.day_rating}/10</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm font-medium">Tasques completades</div>
              <div className="text-lg font-bold text-primary">{existingReflection.tasks_completed_percentage}%</div>
            </div>
          </div>

          {existingReflection.mood_tags && existingReflection.mood_tags.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Estat d'ànim</div>
              <div className="flex flex-wrap gap-1">
                {existingReflection.mood_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {existingReflection.notes && (
            <div>
              <div className="text-sm font-medium mb-2">Notes i reflexions</div>
              <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                {existingReflection.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {existingReflection ? 'Editar Reflexió' : 'Reflexió del Dia'}
        </CardTitle>
        <div className="text-sm text-muted-foreground capitalize">{formatDate}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Puntuació del dia
              </label>
              <span className="text-lg">{getRatingEmoji(formData.day_rating)} {formData.day_rating}/10</span>
            </div>
            <Slider
              value={[formData.day_rating]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, day_rating: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Satisfacció amb la feina
              </label>
              <span className="text-sm">{formData.work_satisfaction}/10</span>
            </div>
            <Slider
              value={[formData.work_satisfaction]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, work_satisfaction: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Energia
                </label>
                <span className="text-sm">{formData.energy_level}/10</span>
              </div>
              <Slider
                value={[formData.energy_level]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, energy_level: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Frown className="h-4 w-4" />
                  Estrès
                </label>
                <span className="text-sm">{formData.stress_level}/10</span>
              </div>
              <Slider
                value={[formData.stress_level]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stress_level: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Mood Tags */}
        <div>
          <label className="text-sm font-medium mb-2 block">Estat d'ànim</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map(tag => (
              <Badge
                key={tag}
                variant={formData.mood_tags?.includes(tag) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => toggleTag(tag, 'mood')}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Accomplishments */}
        <div>
          <label className="text-sm font-medium mb-2 block">Acompliments d'avui</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ACCOMPLISHMENTS.map(accomplishment => (
              <Badge
                key={accomplishment}
                variant={formData.accomplishments?.includes(accomplishment) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => toggleTag(accomplishment, 'accomplishments')}
              >
                {accomplishment}
              </Badge>
            ))}
          </div>
        </div>

        {/* Obstacles */}
        <div>
          <label className="text-sm font-medium mb-2 block">Obstacles del dia</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_OBSTACLES.map(obstacle => (
              <Badge
                key={obstacle}
                variant={formData.obstacles?.includes(obstacle) ? "destructive" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => toggleTag(obstacle, 'obstacles')}
              >
                {obstacle}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Notes i reflexions</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Escriu les teves reflexions del dia..."
            className="min-h-[80px]"
          />
        </div>

        {/* Tomorrow Focus */}
        <div>
          <label className="text-sm font-medium mb-2 block">Enfoc per demà</label>
          <Input
            value={formData.tomorrow_focus}
            onChange={(e) => setFormData(prev => ({ ...prev, tomorrow_focus: e.target.value }))}
            placeholder="Quin serà el teu enfoc principal demà?"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardant...' : 'Guardar Reflexió'}
        </Button>
      </CardContent>
    </Card>
  );
}