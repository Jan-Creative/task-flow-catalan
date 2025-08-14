import { getPriorityIconComponent } from "@/utils/priorityHelpers";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PriorityBadge = ({ priority, className, size = "md" }: PriorityBadgeProps) => {
  const { getPriorityLabel, getPriorityColor, getPriorityIcon } = usePropertyLabels();
  
  const priorityColor = getPriorityColor(priority);
  const priorityLabel = getPriorityLabel(priority);
  const PriorityIconComponent = getPriorityIconComponent(priority, getPriorityIcon);
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-2.5 py-1.5 text-xs gap-2", 
    lg: "px-3 py-2 text-sm gap-2"
  };
  
  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5"
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full font-medium backdrop-blur-sm border",
        sizeClasses[size],
        className
      )}
      style={{ 
        backgroundColor: `${priorityColor}15`,
        borderColor: `${priorityColor}30`,
        color: priorityColor
      }}
    >
      <PriorityIconComponent className={iconSizes[size]} />
      <span>{priorityLabel}</span>
    </div>
  );
};