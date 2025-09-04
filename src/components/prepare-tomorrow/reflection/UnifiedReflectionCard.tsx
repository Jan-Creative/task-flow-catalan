import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Save,
  Zap,
  Brain,
  TrendingUp,
  StickyNote,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOOD_TAGS, COMMON_ACCOMPLISHMENTS, COMMON_OBSTACLES } from '@/types/reflection';
import type { CreateReflectionData } from '@/types/reflection';

interface UnifiedReflectionCardProps {
  initialData: CreateReflectionData;
  onDataChange: (data: CreateReflectionData) => void;
  onSave: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

type Step = 'mood' | 'metrics' | 'tags' | 'notes';

const STEPS: { id: Step; title: string; icon: any; description: string }[] = [
  { id: 'mood', title: 'Com t\'has sentit?', icon: Heart, description: 'Selecciona el teu estat d\'ànim' },
  { id: 'metrics', title: 'Mètriques del dia', icon: TrendingUp, description: 'Valora diferents aspectes' },
  { id: 'tags', title: 'Emocions i experiències', icon: Brain, description: 'Tria etiquetes que et representin' },
  { id: 'notes', title: 'Reflexions personals', icon: StickyNote, description: 'Afegeix notes i pensaments' }
];

const MOOD_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Molt malament', color: 'from-red-500/20 to-red-600/20' },
  { value: 2, emoji: '😟', label: 'Malament', color: 'from-orange-500/20 to-orange-600/20' },
  { value: 3, emoji: '😐', label: 'Regular', color: 'from-yellow-500/20 to-yellow-600/20' },
  { value: 4, emoji: '🙂', label: 'Bé', color: 'from-blue-500/20 to-blue-600/20' },
  { value: 5, emoji: '😊', label: 'Molt bé', color: 'from-green-500/20 to-green-600/20' },
  { value: 6, emoji: '😄', label: 'Genial', color: 'from-emerald-500/20 to-emerald-600/20' },
  { value: 7, emoji: '🤩', label: 'Fantàstic', color: 'from-purple-500/20 to-purple-600/20' },
];

const METRICS = [
  { key: 'work_satisfaction', label: 'Satisfacció laboral', icon: '💼', color: 'blue' },
  { key: 'energy_level', label: 'Nivell d\'energia', icon: '⚡', color: 'yellow' },
  { key: 'stress_level', label: 'Nivell d\'estrès', icon: '😰', color: 'red', inverted: true },
];

export function UnifiedReflectionCard({
  initialData,
  onDataChange,
  onSave,
  isSaving,
  disabled = false
}: UnifiedReflectionCardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('mood');
  const [formData, setFormData] = useState<CreateReflectionData>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  useEffect(() => {
    // Check which steps are completed
    const completed = new Set<Step>();
    if (formData.day_rating > 0) completed.add('mood');
    if (formData.work_satisfaction > 0 || formData.energy_level > 0 || formData.stress_level > 0) completed.add('metrics');
    if ((formData.mood_tags?.length || 0) > 0 || (formData.accomplishments?.length || 0) > 0 || (formData.obstacles?.length || 0) > 0) completed.add('tags');
    if (formData.notes || formData.gratitude_notes || formData.tomorrow_focus) completed.add('notes');
    setCompletedSteps(completed);
  }, [formData]);

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const selectedMood = MOOD_OPTIONS.find(mood => mood.value === formData.day_rating);

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = Math.min(currentStepIndex + 1, STEPS.length - 1);
    setCurrentStep(STEPS[nextIndex].id);
  };

  const goPrevious = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(STEPS[prevIndex].id);
  };

  const updateFormData = (updates: Partial<CreateReflectionData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[] | undefined, item: string) => {
    const currentArray = array || [];
    return currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
  };

  const renderProgressDots = () => (
    <div className="flex items-center justify-center gap-3 mb-6">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        
        return (
          <button
            key={step.id}
            onClick={() => goToStep(step.id)}
            disabled={disabled}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
              isActive && "border-primary bg-primary/10 scale-110",
              isCompleted && "border-success bg-success/10",
              !isActive && !isCompleted && "border-border bg-secondary/30 hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCompleted ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            
            {isActive && (
              <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderMoodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Com t'has sentit avui?
        </h3>
        <p className="text-muted-foreground">Tria l'emoji que millor representi el teu dia</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => updateFormData({ day_rating: mood.value })}
            disabled={disabled}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300 group",
              "hover:scale-105 hover:shadow-lg",
              formData.day_rating === mood.value
                ? "border-primary bg-gradient-to-br " + mood.color + " scale-105"
                : "border-border hover:border-primary/50 bg-secondary/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={formData.day_rating === mood.value ? {
              boxShadow: '0 0 30px hsl(var(--primary) / 0.3)'
            } : {}}
          >
            <div className="text-4xl mb-2 transition-transform group-hover:scale-110">
              {mood.emoji}
            </div>
            <div className={cn(
              "text-sm font-medium transition-colors",
              formData.day_rating === mood.value ? "text-primary" : "text-muted-foreground"
            )}>
              {mood.label}
            </div>
            <div className={cn(
              "text-xs text-muted-foreground",
              formData.day_rating === mood.value && "text-primary/70"
            )}>
              {mood.value}/7
            </div>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary-glow/5 border border-primary/20">
          <div className="text-2xl mb-2">{selectedMood.emoji}</div>
          <div className="font-medium text-primary">{selectedMood.label}</div>
          <div className="text-sm text-muted-foreground">Puntuació: {selectedMood.value}/7</div>
        </div>
      )}
    </div>
  );

  const renderMetricsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Mètriques del dia
        </h3>
        <p className="text-muted-foreground">Valora aquests aspectes del teu dia</p>
      </div>

      <div className="space-y-6">
        {METRICS.map((metric) => {
          const value = formData[metric.key as keyof CreateReflectionData] as number;
          
          return (
            <div key={metric.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <span className="font-medium">{metric.label}</span>
                </div>
                <div className="text-lg font-bold text-primary">{value}/10</div>
              </div>
              
              <div className="relative">
                <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      metric.inverted 
                        ? "bg-gradient-to-r from-green-500 to-red-500"
                        : "bg-gradient-to-r from-red-500 to-green-500"
                    )}
                    style={{ 
                      width: `${(value / 10) * 100}%`,
                      transform: metric.inverted ? 'scaleX(-1)' : 'none'
                    }}
                  />
                </div>
                
                <div className="flex justify-between mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateFormData({ [metric.key]: num })}
                      disabled={disabled}
                      className={cn(
                        "w-6 h-6 rounded-full text-xs font-medium transition-all",
                        value === num
                          ? "bg-primary text-primary-foreground scale-125"
                          : "bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTagsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Emocions i experiències
        </h3>
        <p className="text-muted-foreground">Selecciona les etiquetes que millor descriuen el teu dia</p>
      </div>

      <div className="space-y-6">
        {/* Mood Tags */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Estat d'ànim ({formData.mood_tags?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => {
              const isSelected = formData.mood_tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => updateFormData({ mood_tags: toggleArrayItem(formData.mood_tags, tag) })}
                  disabled={disabled}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/30 text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/10"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accomplishments */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-success" />
            Èxits ({formData.accomplishments?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {COMMON_ACCOMPLISHMENTS.map((accomplishment) => {
              const isSelected = formData.accomplishments?.includes(accomplishment);
              return (
                <button
                  key={accomplishment}
                  onClick={() => updateFormData({ accomplishments: toggleArrayItem(formData.accomplishments, accomplishment) })}
                  disabled={disabled}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all border",
                    isSelected
                      ? "bg-success text-success-foreground border-success"
                      : "bg-secondary/30 text-muted-foreground border-border hover:border-success/50 hover:bg-success/10"
                  )}
                >
                  {accomplishment}
                </button>
              );
            })}
          </div>
        </div>

        {/* Obstacles */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            Obstacles ({formData.obstacles?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {COMMON_OBSTACLES.map((obstacle) => {
              const isSelected = formData.obstacles?.includes(obstacle);
              return (
                <button
                  key={obstacle}
                  onClick={() => updateFormData({ obstacles: toggleArrayItem(formData.obstacles, obstacle) })}
                  disabled={disabled}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all border",
                    isSelected
                      ? "bg-warning text-warning-foreground border-warning"
                      : "bg-secondary/30 text-muted-foreground border-border hover:border-warning/50 hover:bg-warning/10"
                  )}
                >
                  {obstacle}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <StickyNote className="h-6 w-6 text-primary" />
          Reflexions personals
        </h3>
        <p className="text-muted-foreground">Afegeix notes, gratitud i plans per demà</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Notes del dia</label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Com ha anat el dia? Què has après?"
            disabled={disabled}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4 text-destructive" />
            Gratitud
          </label>
          <Textarea
            value={formData.gratitude_notes || ''}
            onChange={(e) => updateFormData({ gratitude_notes: e.target.value })}
            placeholder="Per què estàs agraït avui?"
            disabled={disabled}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Focus per demà</label>
          <Input
            value={formData.tomorrow_focus || ''}
            onChange={(e) => updateFormData({ tomorrow_focus: e.target.value })}
            placeholder="En què et vols centrar demà?"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'mood': return renderMoodStep();
      case 'metrics': return renderMetricsStep();
      case 'tags': return renderTagsStep();
      case 'notes': return renderNotesStep();
      default: return null;
    }
  };

  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoPrevious = currentStepIndex > 0;
  const allStepsCompleted = completedSteps.size === STEPS.length;

  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Reflexió del Dia
          <Sparkles className="h-5 w-5 text-primary-glow animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderProgressDots()}
        
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={!canGoPrevious || disabled}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {currentStepIndex + 1} de {STEPS.length}
          </div>
          
          {canGoNext ? (
            <Button
              onClick={goNext}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              Següent
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onSave}
              disabled={disabled || isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardant...' : 'Guardar Reflexió'}
            </Button>
          )}
        </div>
        
        {allStepsCompleted && (
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
            <div className="text-success font-medium">🎉 Reflexió completa!</div>
            <div className="text-sm text-muted-foreground">Has completat totes les seccions</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}