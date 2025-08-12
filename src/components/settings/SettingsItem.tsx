import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SettingsItemProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SettingsItem = ({ 
  label, 
  description, 
  icon: Icon, 
  children, 
  className = "",
  onClick
}: SettingsItemProps) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/30 hover:bg-secondary/30 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-accent/20 rounded-md">
            <Icon className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
        <div>
          <div className="font-medium text-foreground">{label}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};