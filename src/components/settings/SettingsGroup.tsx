import { ReactNode } from "react";

interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const SettingsGroup = ({ title, children, className = "" }: SettingsGroupProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground px-4 py-2 uppercase tracking-wide">
          {title}
        </h3>
      )}
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
};