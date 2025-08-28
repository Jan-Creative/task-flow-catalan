import { useState, useEffect, useRef } from "react";
import { Plus, Calendar, Bell, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CircularActionMenuProps {
  onCreateTask: () => void;
  onCreateEvent?: () => void;
  onCreateNotification?: () => void;
  onCreateFolder?: () => void;
  isMobile: boolean;
}

interface MenuOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

const CircularActionMenu = ({ 
  onCreateTask, 
  onCreateEvent, 
  onCreateNotification, 
  onCreateFolder,
  isMobile 
}: CircularActionMenuProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  const menuOptions: MenuOption[] = [
    {
      id: "task",
      label: "Nova Tasca",
      icon: Plus,
      action: onCreateTask,
      color: "bg-gradient-primary"
    },
    {
      id: "event",
      label: "Nou Esdeveniment", 
      icon: Calendar,
      action: onCreateEvent || (() => console.log("Create event")),
      color: "bg-blue-500"
    },
    {
      id: "notification",
      label: "Nova Notificació",
      icon: Bell,
      action: onCreateNotification || (() => console.log("Create notification")),
      color: "bg-amber-500"
    },
    {
      id: "folder",
      label: "Nova Carpeta",
      icon: Folder,
      action: onCreateFolder || (() => console.log("Create folder")),
      color: "bg-emerald-500"
    }
  ];

  const handleButtonClick = () => {
    setClickCount(prev => prev + 1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (clickCount === 0) {
      // First click - start timeout for single click
      timeoutRef.current = setTimeout(() => {
        // Single click - create task
        onCreateTask();
        setClickCount(0);
      }, 400);
    } else {
      // Second click - expand menu
      setIsExpanded(true);
      setClickCount(0);
    }
  };

  const handleOptionClick = (option: MenuOption) => {
    option.action();
    setIsExpanded(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isExpanded]);

  // Calculate positions for circular layout
  const getOptionPosition = (index: number) => {
    const radius = isMobile ? 85 : 95;
    const startAngle = 90; // Start from top
    const totalAngle = 180; // Half circle
    const angleStep = totalAngle / (menuOptions.length - 1);
    const angle = (startAngle + (index * angleStep)) * (Math.PI / 180);
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      x: -x, // Negative to go left
      y: -y  // Negative to go up
    };
  };

  const buttonSize = isMobile ? 44 : 48;
  const mainButtonSize = isMobile ? 52 : 56;

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
      )}

      {/* Menu Container */}
      <div 
        ref={menuRef}
        className="relative z-50"
      >
        {/* Circular Menu Options */}
        {isExpanded && (
          <div className="absolute bottom-0 right-0">
            {menuOptions.map((option, index) => {
              const position = getOptionPosition(index);
              const Icon = option.icon;
              
              return (
                <Button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "absolute rounded-full p-0 shadow-[var(--shadow-floating)] hover:scale-110 active:scale-95 transition-all duration-200",
                    option.color,
                    "animate-scale-in"
                  )}
                  style={{
                    width: `${buttonSize}px`,
                    height: `${buttonSize}px`,
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "both"
                  }}
                  aria-label={option.label}
                >
                  <Icon className="h-5 w-5 text-white" />
                </Button>
              );
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <Button
          onClick={handleButtonClick}
          size="lg"
          className={cn(
            "bg-gradient-primary hover:scale-110 active:scale-95 transition-all duration-200 ease-out rounded-full shadow-[var(--shadow-floating)] hover:shadow-glow flex-shrink-0 p-0",
            isExpanded && "scale-105 shadow-glow"
          )}
          style={{
            height: `${mainButtonSize}px`,
            width: `${mainButtonSize}px`
          }}
          aria-label="Accions ràpides"
        >
          <Plus 
            className={cn(
              "transition-transform duration-200",
              isMobile ? "h-5 w-5" : "h-6 w-6",
              isExpanded && "rotate-45"
            )} 
          />
        </Button>
      </div>
    </>
  );
};

export default CircularActionMenu;