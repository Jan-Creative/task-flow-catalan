import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, FileText, Target, Heart, Sparkles } from 'lucide-react';

interface PersonalNotesCardProps {
  notes: string;
  gratitudeNotes: string;
  tomorrowFocus: string;
  onNotesChange: (value: string) => void;
  onGratitudeNotesChange: (value: string) => void;
  onTomorrowFocusChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export function PersonalNotesCard({
  notes,
  gratitudeNotes,
  tomorrowFocus,
  onNotesChange,
  onGratitudeNotesChange,
  onTomorrowFocusChange,
  onSave,
  isSaving,
  disabled
}: PersonalNotesCardProps) {
  const isComplete = notes.length > 0 || gratitudeNotes.length > 0 || tomorrowFocus.length > 0;
  
  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-primary" />
          Reflexions personals
          {isComplete && (
            <Sparkles className="h-4 w-4 text-success animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main reflection notes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Notes i reflexions del dia
          </label>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Escriu les teves reflexions del dia... Com t'has sentit? Què has après? Què destacaries?"
            className="min-h-[100px] resize-none bg-secondary/20 border-border/30 focus:border-primary/50 transition-colors"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Comparteix els teus pensaments</span>
            <span>{notes.length} caràcters</span>
          </div>
        </div>

        {/* Gratitude section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Heart className="h-4 w-4 text-destructive" />
            Pel que estic agraït avui
          </label>
          <Textarea
            value={gratitudeNotes}
            onChange={(e) => onGratitudeNotesChange(e.target.value)}
            placeholder="Tres coses pel que estic agraït avui..."
            className="min-h-[80px] resize-none bg-secondary/20 border-border/30 focus:border-destructive/50 transition-colors"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Practica la gratitud diària</span>
            <span>{gratitudeNotes.length} caràcters</span>
          </div>
        </div>

        {/* Tomorrow focus */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="h-4 w-4 text-warning" />
            Enfoc principal per demà
          </label>
          <Input
            value={tomorrowFocus}
            onChange={(e) => onTomorrowFocusChange(e.target.value)}
            placeholder="Quin serà el teu enfoc principal demà?"
            className="bg-secondary/20 border-border/30 focus:border-warning/50 transition-colors"
            disabled={disabled}
          />
          <div className="text-xs text-muted-foreground">
            Un objectiu clar per començar demà amb propòsit
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-success' : 'bg-muted'} transition-colors`} />
            <span className="text-sm text-muted-foreground">
              Reflexió {isComplete ? 'completa' : 'en curs'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {[notes, gratitudeNotes, tomorrowFocus].filter(Boolean).length}/3 seccions
          </div>
        </div>

        {/* Save button */}
        <Button 
          onClick={onSave}
          disabled={isSaving || disabled}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 transition-all duration-300"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
              Guardant reflexió...
            </>
          ) : (
            'Guardar reflexió del dia'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}