import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Home, Briefcase, Palette, GraduationCap, Heart, Coffee, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: any;
  count: number;
  enabled: boolean;
}

const CategoriesCard = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: "casa", name: "Casa", color: "#3b82f6", icon: Home, count: 8, enabled: true },
    { id: "feina", name: "Feina", color: "#f59e0b", icon: Briefcase, count: 12, enabled: true },
    { id: "disseny", name: "Disseny", color: "#8b5cf6", icon: Palette, count: 5, enabled: true },
    { id: "estudis", name: "Estudis", color: "#10b981", icon: GraduationCap, count: 3, enabled: false },
    { id: "personal", name: "Personal", color: "#ef4444", icon: Heart, count: 7, enabled: true },
    { id: "social", name: "Social", color: "#06b6d4", icon: Coffee, count: 4, enabled: false },
  ]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const enabledCount = categories.filter(cat => cat.enabled).length;
  const totalEvents = categories.reduce((sum, cat) => sum + (cat.enabled ? cat.count : 0), 0);

  return (
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Categories</CardTitle>
            <CardDescription className="text-xs">
              {enabledCount} actives · {totalEvents} esdeveniments
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto px-3 pb-3">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-all duration-300 animate-fade-in",
                "border border-transparent hover:border-border/30",
                category.enabled
                  ? "bg-background/20 hover:bg-background/30"
                  : "bg-background/10 hover:bg-background/20 opacity-60"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="p-1.5 rounded-md backdrop-blur-sm"
                  style={{
                    backgroundColor: `${category.color}15`,
                    borderColor: `${category.color}30`,
                    border: '1px solid'
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: category.color }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      category.enabled ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {category.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: category.enabled ? `${category.color}20` : undefined,
                        color: category.enabled ? category.color : undefined
                      }}
                    >
                      {category.count}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={category.enabled}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="ml-2"
                />
              </div>
            </div>
          );
        })}
        
        {/* Quick stats */}
        <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Total visibles:</span>
            <span className="font-semibold text-primary">{totalEvents}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesCard;