import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Frown, TrendingUp } from 'lucide-react';
import { CustomSlider } from './CustomSlider';

interface MetricsCardProps {
  workSatisfaction: number;
  energyLevel: number;
  stressLevel: number;
  onWorkSatisfactionChange: (value: number) => void;
  onEnergyLevelChange: (value: number) => void;
  onStressLevelChange: (value: number) => void;
  disabled?: boolean;
}

export function MetricsCard({
  workSatisfaction,
  energyLevel,
  stressLevel,
  onWorkSatisfactionChange,
  onEnergyLevelChange,
  onStressLevelChange,
  disabled
}: MetricsCardProps) {
  const metrics = [
    {
      label: 'Satisfacció amb la feina',
      value: workSatisfaction,
      onChange: onWorkSatisfactionChange,
      icon: Brain,
      color: 'hsl(180 100% 40%)',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      label: 'Nivell d\'energia',
      value: energyLevel,
      onChange: onEnergyLevelChange,
      icon: Zap,
      color: 'hsl(50 100% 50%)',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      label: 'Nivell d\'estrès',
      value: stressLevel,
      onChange: onStressLevelChange,
      icon: Frown,
      color: 'hsl(0 84% 60%)',
      gradient: 'from-red-500/20 to-pink-500/20',
      inverted: true
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5 text-primary" />
          Mètriques del dia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          
          return (
            <div 
              key={metric.label}
              className={`
                p-4 rounded-xl bg-gradient-to-r ${metric.gradient} 
                border border-border/20 backdrop-blur-sm
                transition-all duration-300 hover:border-border/40
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconComponent 
                    className="h-4 w-4" 
                    style={{ color: metric.color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-lg font-bold"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
              
              <CustomSlider
                value={metric.value}
                onChange={metric.onChange}
                color={metric.color}
                disabled={disabled}
                inverted={metric.inverted}
              />
              
              {/* Performance indicator */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {metric.inverted ? 'Baix és millor' : 'Alt és millor'}
                </span>
                <div className="flex items-center gap-1">
                  <div 
                    className={`
                      w-2 h-2 rounded-full
                      ${metric.inverted 
                        ? (metric.value <= 3 ? 'bg-success' : metric.value <= 6 ? 'bg-warning' : 'bg-destructive')
                        : (metric.value >= 7 ? 'bg-success' : metric.value >= 4 ? 'bg-warning' : 'bg-destructive')
                      }
                    `}
                  />
                  <span className="text-muted-foreground">
                    {metric.inverted 
                      ? (metric.value <= 3 ? 'Excel·lent' : metric.value <= 6 ? 'Moderat' : 'Alt')
                      : (metric.value >= 7 ? 'Excel·lent' : metric.value >= 4 ? 'Bé' : 'Baix')
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}