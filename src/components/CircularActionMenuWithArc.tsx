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

const CircularActionMenuWithArc = ({ 
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

  // Debug: confirm arc version is mounted and track expansion state
  useEffect(() => {
    console.info("🟢 Using CircularActionMenuWithArc (ARC MODE)");
  }, []);

  useEffect(() => {
    console.info("🔄 Arc menu expanded:", isExpanded);
  }, [isExpanded]);

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
      timeoutRef.current = setTimeout(() => {
        onCreateTask();
        setClickCount(0);
      }, 400);
    } else {
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

  // Same intelligent positioning logic
  const getOptimalPositioning = () => {
    if (!fabRef.current) {
      return { radius: isMobile ? 72 : 90, startAngle: 180, endAngle: 240 };
    }

    const fabRect = fabRef.current.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const cx = fabRect.left + fabRect.width / 2;
    const cy = fabRect.top + fabRect.height / 2;

    const availableSpace = {
      left: cx,
      right: viewport.width - cx,
      top: cy,
      bottom: viewport.height - cy,
    };

    const optionBtn = isMobile ? 56 : 60;
    const safeMargin = optionBtn / 2 + 16;

    let radius = Math.max(
      36,
      Math.min(availableSpace.left - safeMargin, availableSpace.top - safeMargin, isMobile ? 100 : 120)
    );

    let startAngle = 180;
    let endAngle = Math.min(270, startAngle + 120);

    const n = menuOptions.length;

    const fitsAll = (r: number, sDeg: number, eDeg: number) => {
      const total = Math.max(0, eDeg - sDeg);
      const step = n > 1 ? total / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        const ang = (sDeg + i * step) * (Math.PI / 180);
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
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

    const arcCandidates = [90, 80, 70, 60, 50, 40];
    for (const arc of arcCandidates) {
      startAngle = 180;
      endAngle = Math.min(270, startAngle + arc);
      if (fitsAll(radius, startAngle, endAngle)) {
        return { radius, startAngle, endAngle };
      }
    }

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

    return { radius, startAngle: 180, endAngle: 220 };
  };

  const getOptionPosition = (index: number) => {
    const { radius, startAngle, endAngle } = getOptimalPositioning();

    const totalAngle = Math.max(0, endAngle - startAngle);
    const angleStep = menuOptions.length > 1 ? totalAngle / (menuOptions.length - 1) : 0;
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return { x, y };
  };

  // Generate SVG arc path
  const generateArcPath = () => {
    const { radius, startAngle, endAngle } = getOptimalPositioning();
    
    const startRad = startAngle * (Math.PI / 180);
    const endRad = endAngle * (Math.PI / 180);
    
    const x1 = Math.cos(startRad) * radius;
    const y1 = Math.sin(startRad) * radius;
    const x2 = Math.cos(endRad) * radius;
    const y2 = Math.sin(endRad) * radius;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
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

      {/* Main FAB Container */}
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

        {/* Arc SVG and Menu Options */}
        {isExpanded && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-floating)] animate-fade-in" style={{animationDelay:'50ms'}}>
              ARC MODE
            </div>
            {/* Arc Visual */}
            <svg 
              className="absolute inset-0 w-full h-full animate-scale-in"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px'
              }}
              viewBox="-200 -200 400 400"
            >
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Main arc path */}
              <path
                d={generateArcPath()}
                stroke="url(#arcGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-fade-in"
                style={{ animationDelay: '100ms', animationFillMode: 'both' }}
              />
              
              {/* Arc nodes (where buttons will be positioned) */}
              {menuOptions.map((_, index) => {
                const position = getOptionPosition(index);
                return (
                  <circle
                    key={index}
                    cx={position.x}
                    cy={position.y}
                    r="6"
                    fill="hsl(var(--primary))"
                    className="animate-scale-in"
                    style={{ 
                      animationDelay: `${200 + index * 50}ms`, 
                      animationFillMode: 'both' 
                    }}
                  />
                );
              })}
            </svg>

            {/* Menu option buttons positioned on the arc */}
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
                    "animate-scale-in border-2 border-white/20"
                  )}
                  style={{
                    width: `${buttonSize}px`,
                    height: `${buttonSize}px`,
                    left: `calc(50% + ${position.x}px - ${buttonSize/2}px)`,
                    top: `calc(50% + ${position.y}px - ${buttonSize/2}px)`,
                    animationDelay: `${300 + index * 80}ms`,
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

export default CircularActionMenuWithArc;