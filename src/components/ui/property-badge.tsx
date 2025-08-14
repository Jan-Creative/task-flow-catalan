import { getIconByName } from "@/lib/iconLibrary";
import { getPriorityIconComponent } from "@/utils/priorityHelpers";
import { cn } from "@/lib/utils";

interface PropertyBadgeProps {
  propertyName: string;
  optionValue: string;
  optionLabel: string;
  optionColor?: string;
  optionIcon?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PropertyBadge = ({ 
  propertyName,
  optionValue, 
  optionLabel, 
  optionColor = '#6b7280', 
  optionIcon,
  className, 
  size = "md" 
}: PropertyBadgeProps) => {
  
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

  // Determinar la icona a mostrar
  let IconComponent = null;
  
  if (propertyName === 'Prioritat') {
    // Per prioritats, usar la lògica de banderes
    const dummyGetPriorityIcon = () => optionIcon;
    IconComponent = getPriorityIconComponent(optionValue, dummyGetPriorityIcon);
  } else if (optionIcon) {
    // Per altres propietats, usar la icona personalitzada
    const iconDef = getIconByName(optionIcon);
    IconComponent = iconDef?.icon;
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full font-medium backdrop-blur-sm border border-opacity-20",
        sizeClasses[size],
        className
      )}
      style={{ 
        backgroundColor: `${optionColor}08`,
        borderColor: `${optionColor}25`,
        color: optionColor
      }}
    >
      {IconComponent && (
        <IconComponent className={iconSizes[size]} />
      )}
      <span>{optionLabel}</span>
    </div>
  );
};