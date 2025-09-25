import { useState, useEffect, useRef } from "react";
import { Plus, Calendar, Bell, Folder, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CircularActionMenuProps {
  onCreateTask: () => void;
  onCreateEvent?: () => void;
  onCreateNotification?: () => void;
  onCreateFolder?: () => void;
  isMobile: boolean;
  onToggleMode?: () => void; // Callback to switch back to sphere mode
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
  isMobile,
  onToggleMode
}: CircularActionMenuProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [arcAnimationProgress, setArcAnimationProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fabRef = useRef<HTMLButtonElement>(null);

  // Debug: confirm arc version is mounted
  useEffect(() => {
    console.info("🟢 Using CircularActionMenuWithArc (ARC MODE)");
  }, []);

  // Animate arc drawing when expanded
  useEffect(() => {
    if (isExpanded) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.1;
        setArcAnimationProgress(progress);
        if (progress >= 1) {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    } else {
      setArcAnimationProgress(0);
    }
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
    },
    // Add toggle option if available
    ...(onToggleMode ? [{
      id: "toggle",
      label: "Mode Esfèric",
      icon: RotateCcw,
      action: onToggleMode,
      color: "bg-secondary"
    }] : [])
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

  // Generate arc path for SVG with animation progress
  const generateArcPath = () => {
    const { radius, startAngle, endAngle } = getOptimalPositioning();
    
    // Calculate the animated end angle
    const totalArc = endAngle - startAngle;
    const animatedEndAngle = startAngle + (totalArc * arcAnimationProgress);
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (animatedEndAngle * Math.PI) / 180;
    
    const startX = Math.cos(startAngleRad) * radius;
    const startY = Math.sin(startAngleRad) * radius;
    const endX = Math.cos(endAngleRad) * radius;
    const endY = Math.sin(endAngleRad) * radius;
    
    const largeArcFlag = animatedEndAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
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
            {/* Mode Badge */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm animate-fade-in z-10" style={{animationDelay:'50ms'}}>
              ⚡ ARC MODE
            </div>
            
            {/* Dramatic Arc Visual */}
            <svg 
              className="absolute inset-0 w-full h-full"
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
                {/* Enhanced Gradient with Neon Effect */}
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(280 100% 70%)" stopOpacity="1" />
                  <stop offset="25%" stopColor="hsl(260 100% 60%)" stopOpacity="1" />
                  <stop offset="50%" stopColor="hsl(220 100% 65%)" stopOpacity="1" />
                  <stop offset="75%" stopColor="hsl(200 100% 70%)" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(180 100% 60%)" stopOpacity="1" />
                </linearGradient>
                
                {/* Ultra Intense Glow Filter */}
                <filter id="intensiveGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feGaussianBlur stdDeviation="12" result="mediumBlur"/>
                  <feGaussianBlur stdDeviation="24" result="bigBlur"/>
                  <feMerge>
                    <feMergeNode in="bigBlur"/>
                    <feMergeNode in="mediumBlur"/>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Traveling Light Animation */}
                <linearGradient id="travelingLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" stopOpacity="0">
                    <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="50%" stopColor="hsl(60 100% 90%)" stopOpacity="1">
                    <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                  </stop>
                  <stop offset="100%" stopColor="transparent" stopOpacity="0">
                    <animate attributeName="stop-opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                  </stop>
                </linearGradient>
                
                {/* Pulse Effect */}
                <filter id="pulse" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="pulse">
                    <animate attributeName="stdDeviation" values="3;8;3" dur="2s" repeatCount="indefinite"/>
                  </feGaussianBlur>
                </filter>
              </defs>
              
              {/* Main Dramatic Arc Path */}
              <path
                d={generateArcPath()}
                stroke="url(#arcGradient)"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                filter="url(#intensiveGlow)"
                className="drop-shadow-2xl"
                style={{
                  opacity: arcAnimationProgress
                }}
              />
              
              {/* Traveling Light Effect */}
              <path
                d={generateArcPath()}
                stroke="url(#travelingLight)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                filter="url(#pulse)"
                style={{
                  opacity: arcAnimationProgress > 0.8 ? 1 : 0
                }}
              />
            </svg>

            {/* Arc-Integrated Action Buttons */}
            {menuOptions.map((option, index) => {
              const position = getOptionPosition(index);
              const Icon = option.icon;
              const isVisible = arcAnimationProgress > (index / menuOptions.length) * 0.8;
              
              return (
                <Button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "absolute rounded-full p-0 transition-all duration-300 pointer-events-auto border-2 border-white/30",
                    option.color,
                    "shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]",
                    "hover:scale-125 active:scale-95",
                    "backdrop-blur-sm"
                  )}
                  style={{
                    width: `${isMobile ? 44 : 48}px`,
                    height: `${isMobile ? 44 : 48}px`,
                    left: `calc(50% + ${position.x}px - ${(isMobile ? 44 : 48)/2}px)`,
                    top: `calc(50% + ${position.y}px - ${(isMobile ? 44 : 48)/2}px)`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scale(1)' : 'scale(0.3)',
                    transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 150 + 500}ms`,
                    filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))'
                  }}
                  aria-label={option.label}
                >
                  <Icon className={cn("text-white drop-shadow-sm", isMobile ? "h-5 w-5" : "h-6 w-6")} />
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