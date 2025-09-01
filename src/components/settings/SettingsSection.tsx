import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export const SettingsSection = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = "" 
}: SettingsSectionProps) => {
  return (
    <Card className={`bg-card shadow-[var(--shadow-card)] border-border/30 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary/20 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
};