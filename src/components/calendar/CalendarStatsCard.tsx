import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react";

const CalendarStatsCard = () => {
  const stats = [
    {
      label: "Tasques avui",
      value: 5,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Aquesta setmana",
      value: 23,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      label: "Pendents",
      value: 12,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      label: "Completades",
      value: 11,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    }
  ];

  return (
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resum</CardTitle>
        <CardDescription>Estadístiques del calendari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="flex items-center justify-between p-3 rounded-xl bg-background/20 hover:bg-background/30 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CalendarStatsCard;