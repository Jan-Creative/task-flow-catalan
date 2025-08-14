import { Switch } from "@/components/ui/switch";
import { SettingsRow } from "./SettingsRow";
import { LucideIcon } from "lucide-react";

interface ToggleRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const ToggleRow = ({ 
  icon, 
  label, 
  description, 
  checked, 
  onCheckedChange, 
  disabled = false,
  className = "" 
}: ToggleRowProps) => {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      description={description}
      className={className}
    >
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </SettingsRow>
  );
};