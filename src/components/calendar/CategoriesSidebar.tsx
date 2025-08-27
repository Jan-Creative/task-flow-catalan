import { useState } from "react";
import { Calendar, Users, Briefcase, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: any;
  count: number;
  enabled: boolean;
}

const CategoriesSidebar = () => {
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: '1', 
      name: 'Personal', 
      color: 'hsl(var(--primary))', 
      icon: Heart, 
      count: 8, 
      enabled: true 
    },
    { 
      id: '2', 
      name: 'Feina', 
      color: 'hsl(var(--destructive))', 
      icon: Briefcase, 
      count: 12, 
      enabled: true 
    },
    { 
      id: '3', 
      name: 'Social', 
      color: 'hsl(var(--muted-foreground))', 
      icon: Users, 
      count: 5, 
      enabled: false 
    },
    { 
      id: '4', 
      name: 'Important', 
      color: 'hsl(var(--warning))', 
      icon: Star, 
      count: 3, 
      enabled: true 
    }
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

  const activeCategories = categories.filter(cat => cat.enabled);
  const totalVisibleEvents = activeCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <Card className="h-[220px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Categories
          <Badge variant="secondary" className="ml-auto text-xs">
            {activeCategories.length}/{categories.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0 space-y-3">
        <div className="space-y-2 flex-1">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <IconComponent className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{category.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {category.count}
                  </Badge>
                </div>
                <Switch
                  checked={category.enabled}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="ml-2 scale-75"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium text-foreground">{totalVisibleEvents}</span> esdeveniments visibles
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesSidebar;