import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Smile, Target, AlertTriangle, Plus } from 'lucide-react';
import { MOOD_TAGS, COMMON_ACCOMPLISHMENTS, COMMON_OBSTACLES } from '@/types/reflection';

interface EmotionalTagsCardProps {
  moodTags: string[];
  accomplishments: string[];
  obstacles: string[];
  onToggleMoodTag: (tag: string) => void;
  onToggleAccomplishment: (tag: string) => void;
  onToggleObstacle: (tag: string) => void;
  disabled?: boolean;
}

export function EmotionalTagsCard({
  moodTags,
  accomplishments,
  obstacles,
  onToggleMoodTag,
  onToggleAccomplishment,
  onToggleObstacle,
  disabled
}: EmotionalTagsCardProps) {
  const tagSections = [
    {
      title: 'Estat d\'ànim',
      icon: Smile,
      tags: MOOD_TAGS,
      selectedTags: moodTags,
      onToggle: onToggleMoodTag,
      color: 'hsl(180 100% 40%)',
      variant: 'default' as const
    },
    {
      title: 'Acompliments d\'avui',
      icon: Target,
      tags: COMMON_ACCOMPLISHMENTS,
      selectedTags: accomplishments,
      onToggle: onToggleAccomplishment,
      color: 'hsl(120 60% 50%)',
      variant: 'default' as const
    },
    {
      title: 'Obstacles del dia',
      icon: AlertTriangle,
      tags: COMMON_OBSTACLES,
      selectedTags: obstacles,
      onToggle: onToggleObstacle,
      color: 'hsl(0 60% 50%)',
      variant: 'destructive' as const
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Smile className="h-5 w-5 text-primary" />
          Estat emocional i experiències
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {tagSections.map((section, sectionIndex) => {
          const IconComponent = section.icon;
          
          return (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <IconComponent 
                  className="h-4 w-4" 
                  style={{ color: section.color }}
                />
                <h4 className="text-sm font-medium text-foreground">
                  {section.title}
                </h4>
                {section.selectedTags.length > 0 && (
                  <Badge 
                    variant="outline" 
                    className="ml-auto text-xs"
                    style={{ 
                      borderColor: section.color + '40',
                      color: section.color 
                    }}
                  >
                    {section.selectedTags.length}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {section.tags.map(tag => {
                  const isSelected = section.selectedTags.includes(tag);
                  
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? section.variant : "outline"}
                      className={`
                        cursor-pointer text-xs transition-all duration-300 hover:scale-105
                        ${isSelected 
                          ? 'shadow-sm' 
                          : 'hover:bg-secondary/50 hover:border-border'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      style={{
                        boxShadow: isSelected 
                          ? `0 0 15px ${section.color}20, 0 2px 8px rgba(0,0,0,0.2)` 
                          : undefined,
                        borderColor: isSelected ? section.color : undefined
                      }}
                      onClick={() => !disabled && section.onToggle(tag)}
                    >
                      {isSelected && (
                        <Plus className="h-3 w-3 mr-1 rotate-45" />
                      )}
                      {tag}
                    </Badge>
                  );
                })}
              </div>
              
              {/* Selected tags count indicator */}
              {section.selectedTags.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {section.selectedTags.length} seleccionat{section.selectedTags.length !== 1 ? 's' : ''}
                </div>
              )}
              
              {sectionIndex < tagSections.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}
        
        {/* Summary */}
        <div className="mt-6 p-4 rounded-xl bg-secondary/20 border border-border/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total etiquetes seleccionades:</span>
            <span className="font-semibold text-primary">
              {moodTags.length + accomplishments.length + obstacles.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}