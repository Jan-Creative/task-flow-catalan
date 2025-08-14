import { ReactNode } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";

interface SettingsRowProps {
  icon?: LucideIcon;
  label: string;
  value?: string;
  description?: string;
  children?: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export const SettingsRow = ({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  children, 
  onClick, 
  showChevron = false,
  className = "" 
}: SettingsRowProps) => {
  return (
    <div 
      className={`flex items-center justify-between px-4 py-4 min-h-[56px] active:bg-secondary/30 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-secondary/20' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">{label}</span>
            {value && !children && (
              <span className="text-muted-foreground text-sm ml-2 truncate">{value}</span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {children}
        {showChevron && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};