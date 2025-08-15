import { getPriorityIconComponent } from "@/utils/priorityHelpers";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import { cn } from "@/lib/utils";

interface SmoothPriorityBadgeProps {
  priority: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SmoothPriorityBadge = ({ priority, className, size = "md" }: SmoothPriorityBadgeProps) => {
  const { getPriorityLabel, getPriorityColor, getPriorityIcon } = useOptimizedPropertyLabels();
  
  const priorityColor = getPriorityColor(priority);
  const priorityLabel = getPriorityLabel(priority);
  const PriorityIconComponent = getPriorityIconComponent(priority, getPriorityIcon);
  
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs gap-1",
    md: "px-2 py-1 text-xs gap-1.5", 
    lg: "px-2.5 py-1.5 text-sm gap-1.5"
  };
  
  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3"
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full font-medium backdrop-blur-sm border border-opacity-20 transition-colors duration-300",
        sizeClasses[size],
        className
      )}
      style={{ 
        backgroundColor: `${priorityColor}08`,
        borderColor: `${priorityColor}25`,
        color: priorityColor
      }}
    >
      <PriorityIconComponent className={iconSizes[size]} />
      <span>{priorityLabel}</span>
    </div>
  );
};