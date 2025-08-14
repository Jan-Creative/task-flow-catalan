import { getPriorityIconComponent } from "@/utils/priorityHelpers";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import { cn } from "@/lib/utils";
interface PriorityBadgeProps {
  priority: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}
export const PriorityBadge = ({
  priority,
  className,
  size = "md"
}: PriorityBadgeProps) => {
  const {
    getPriorityLabel,
    getPriorityColor,
    getPriorityIcon
  } = usePropertyLabels();
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
  return;
};