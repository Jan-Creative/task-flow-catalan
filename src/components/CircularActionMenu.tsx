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
  const fabRef = useRef<HTMLButtonElement>(null);

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

  const handleBackdropClick = () => {
    setIsExpanded(false);
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

  // Intelligent boundary detection and positioning (ensures all buttons stay on-screen)
  const getOptimalPositioning = () => {
    // Reasonable default if ref not yet ready
    if (!fabRef.current) {
      return { radius: isMobile ? 72 : 90, startAngle: 180, endAngle: 240 };
    }

    const fabRect = fabRef.current.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const cx = fabRect.left + fabRect.width / 2;
    const cy = fabRect.top + fabRect.height / 2;

    // Available space from FAB center to viewport edges
    const availableSpace = {
      left: cx,
      right: viewport.width - cx,
      top: cy,
      bottom: viewport.height - cy,
    };

    // Button size + safe margin
    const optionBtn = isMobile ? 56 : 60;
    const safeMargin = optionBtn / 2 + 16; // include half button + padding

    // Base radius limited by top-left space and a max cap
    let radius = Math.max(
      36,
      Math.min(availableSpace.left - safeMargin, availableSpace.top - safeMargin, isMobile ? 100 : 120)
    );

    // We prefer the top-left quadrant only: [180°, 270°]. Max arc = 90°
    let startAngle = 180;
    let endAngle = Math.min(270, startAngle + 120); // will clamp via candidates below

    const n = menuOptions.length;

    // Helper: check if all option centers are within viewport with margins
    const fitsAll = (r: number, sDeg: number, eDeg: number) => {
      const total = Math.max(0, eDeg - sDeg);
      const step = n > 1 ? total / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        const ang = (sDeg + i * step) * (Math.PI / 180);
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r; // y positive is downwards; negative goes up
        const px = cx + x;
        const py = cy + y;
        if (
          px - safeMargin < 0 ||
          px + safeMargin > viewport.width ||
          py - safeMargin < 0 ||
          py + safeMargin > viewport.height
        ) {
          return false;
        }
      }
      return true;
    };

    // Try decreasing arc first (keeps buttons tighter together)
    const arcCandidates = [90, 80, 70, 60, 50, 40];
    for (const arc of arcCandidates) {
      startAngle = 180;
      endAngle = Math.min(270, startAngle + arc);
      if (fitsAll(radius, startAngle, endAngle)) {
        return { radius, startAngle, endAngle };
      }
    }

    // If still not fitting, progressively reduce radius and retry arc candidates
    for (let i = 0; i < 8; i++) {
      radius = Math.max(28, radius - 10);
      for (const arc of arcCandidates) {
        startAngle = 180;
        endAngle = Math.min(270, startAngle + arc);
        if (fitsAll(radius, startAngle, endAngle)) {
          return { radius, startAngle, endAngle };
        }
      }
    }

    // Fallback: very tight arc in TL quadrant
    return { radius, startAngle: 180, endAngle: 220 };
  };

  // Calculate positions with intelligent positioning
  const getOptionPosition = (index: number) => {
    const { radius, startAngle, endAngle } = getOptimalPositioning();

    const totalAngle = Math.max(0, endAngle - startAngle);
    const angleStep = menuOptions.length > 1 ? totalAngle / (menuOptions.length - 1) : 0;
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return { x, y };
  };

  const buttonSize = isMobile ? 56 : 60;
  const mainButtonSize = isMobile ? 64 : 68;

  return (
    <>
      {/* Full-screen backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
      )}

      {/* Main FAB Container - Always positioned relative to its normal flow */}
      <div className="relative z-50">
        {/* Main FAB Button */}
        <Button
          ref={fabRef}
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
              "transition-transform duration-200 text-white",
              isMobile ? "h-5 w-5" : "h-6 w-6",
              isExpanded && "rotate-45"
            )} 
          />
        </Button>

        {/* Circular Menu Options - Positioned relative to FAB center */}
        {isExpanded && (
          <div className="absolute inset-0 pointer-events-none">
            {menuOptions.map((option, index) => {
              const position = getOptionPosition(index);
              const Icon = option.icon;
              
              return (
                <Button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "absolute rounded-full p-0 shadow-[var(--shadow-floating)] hover:scale-110 active:scale-95 transition-all duration-200 pointer-events-auto",
                    option.color,
                    "animate-scale-in"
                  )}
                  style={{
                    width: `${buttonSize}px`,
                    height: `${buttonSize}px`,
                    // Position relative to FAB center
                    left: `calc(50% + ${position.x}px - ${buttonSize/2}px)`,
                    top: `calc(50% + ${position.y}px - ${buttonSize/2}px)`,
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: "both"
                  }}
                  aria-label={option.label}
                >
                  <Icon className={cn("text-white", isMobile ? "h-6 w-6" : "h-7 w-7")} />
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default CircularActionMenu;