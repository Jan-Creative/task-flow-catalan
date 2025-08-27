import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAdaptiveSidebar, SidebarCard } from '@/hooks/useAdaptiveSidebar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdaptiveSidebarContainerProps {
  cards: SidebarCard[];
  className?: string;
}

const AdaptiveSidebarContainer: React.FC<AdaptiveSidebarContainerProps> = ({
  cards,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dimensions, isMobile } = useAdaptiveSidebar(cards, containerRef);

  // Handle empty cards gracefully
  if (cards.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={cn("min-h-0 h-full overflow-auto flex flex-col gap-2 bg-background/20 backdrop-blur-sm rounded-lg border border-border/20", className)}
      >
        <div className="p-4 text-center text-muted-foreground text-sm">
          Barra lateral en construcció...
        </div>
      </div>
    );
  }

  if (isMobile) {
    // Mobile: Stack all cards vertically with scroll
    return (
      <div 
        ref={containerRef}
        className={cn("min-h-0 h-full overflow-auto flex flex-col gap-2", className)}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="animate-fade-in flex-shrink-0"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              minHeight: `${card.minHeight * 0.8}px`
            }}
          >
            {card.component}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("min-h-0 h-full overflow-auto flex flex-col gap-2", className)}
    >
      {cards.map((card, index) => {
        const cardDimensions = dimensions[card.id];
        
        if (!cardDimensions) return null;

        const isCollapsed = cardDimensions.collapsed;
        const height = cardDimensions.height;

        return (
          <div
            key={card.id}
            className="animate-fade-in transition-all duration-300 ease-in-out"
            style={{
              animationDelay: `${index * 0.1}s`,
              height: `${height}px`,
              flexShrink: 0
            }}
          >
            {isCollapsed ? (
              <CollapsedCard
                title={getCardTitle(card.id)}
                onExpand={() => {
                  // TODO: Implement expand functionality
                  console.log(`Expanding ${card.id}`);
                }}
              />
            ) : (
              <div className="h-full overflow-hidden">
                {card.component}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper component for collapsed cards
const CollapsedCard: React.FC<{
  title: string;
  onExpand: () => void;
}> = ({ title, onExpand }) => (
  <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
    <CardHeader className="py-2 px-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </CardHeader>
  </Card>
);

// Helper function to get card titles
const getCardTitle = (cardId: string): string => {
  const titles: Record<string, string> = {
    'mini-calendar': 'Navegació Ràpida',
    'categories': 'Categories',
    'tasks': 'Tasques Programades'
  };
  return titles[cardId] || cardId;
};

export default AdaptiveSidebarContainer;