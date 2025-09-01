import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SettingsItemProps {
  label: string;
  description?: string;
  value?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SettingsItem = ({ 
  label, 
  description,
  value, 
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
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{label}</span>
            {value && !children && (
              <span className="text-muted-foreground text-sm ml-2 truncate">{value}</span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {children}
      </div>
    </div>
  );
};