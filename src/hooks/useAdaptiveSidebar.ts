import { useState, useEffect, useCallback } from 'react';

export interface SidebarCard {
  id: string;
  component: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  minHeight: number;
  maxHeight: number;
  preferredHeight: number;
  canCollapse: boolean;
}

export interface AdaptiveDimensions {
  [cardId: string]: {
    height: number;
    visible: boolean;
    collapsed: boolean;
  };
}

export const useAdaptiveSidebar = (cards: SidebarCard[]) => {
  const [dimensions, setDimensions] = useState<AdaptiveDimensions>({});
  const [availableHeight, setAvailableHeight] = useState(0);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate available height with global margins
  const calculateAvailableHeight = useCallback(() => {
    const windowHeight = window.innerHeight;
    const headerHeight = 72; // Header + padding
    const bottomNavHeight = 70; // Bottom navigation space
    const globalMargins = 48; // Global padding (24px * 2)
    const containerPadding = 16; // Internal gaps
    const available = windowHeight - headerHeight - bottomNavHeight - globalMargins - containerPadding;
    
    setAvailableHeight(Math.max(350, available)); // Minimum més compacte
  }, []);

  // Detect screen size
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1200);
  }, []);

  // Intelligent distribution algorithm
  const distributeSpace = useCallback(() => {
    if (availableHeight === 0 || cards.length === 0) return;

    const totalGaps = (cards.length - 1) * 12; // 12px gap between cards
    const usableHeight = availableHeight - totalGaps;
    
    // Sort cards by priority
    const sortedCards = [...cards].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let remainingHeight = usableHeight;
    const newDimensions: AdaptiveDimensions = {};

    // Phase 1: Assign minimum heights to all cards
    for (const card of sortedCards) {
      const minHeight = isMobile ? Math.floor(card.minHeight * 0.8) : card.minHeight;
      newDimensions[card.id] = {
        height: minHeight,
        visible: true,
        collapsed: false
      };
      remainingHeight -= minHeight;
    }

    // Phase 2: If not enough space, start collapsing low priority cards
    if (remainingHeight < 0) {
      for (const card of sortedCards.reverse()) {
        if (card.priority === 'low' && card.canCollapse && remainingHeight < 0) {
          newDimensions[card.id].collapsed = true;
          newDimensions[card.id].height = 48; // Collapsed header height
          remainingHeight += newDimensions[card.id].height - 48;
        }
      }
    }

    // Phase 3: Distribute remaining space by priority
    if (remainingHeight > 0) {
      const visibleCards = sortedCards.filter(card => !newDimensions[card.id].collapsed);
      
      for (const card of visibleCards) {
        const preferredHeight = isMobile 
          ? Math.floor(card.preferredHeight * 0.9) 
          : card.preferredHeight;
        
        const maxHeight = isTablet 
          ? Math.floor(card.maxHeight * 0.85)
          : card.maxHeight;
          
        const additionalSpace = Math.min(
          preferredHeight - newDimensions[card.id].height,
          maxHeight - newDimensions[card.id].height,
          remainingHeight
        );

        if (additionalSpace > 0) {
          newDimensions[card.id].height += additionalSpace;
          remainingHeight -= additionalSpace;
        }
      }
    }

    setDimensions(newDimensions);
  }, [availableHeight, cards, isMobile, isTablet]);

  // Resize observer
  useEffect(() => {
    calculateAvailableHeight();
    updateScreenSize();
    
    const handleResize = () => {
      calculateAvailableHeight();
      updateScreenSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateAvailableHeight, updateScreenSize]);

  // Recalculate when dependencies change
  useEffect(() => {
    distributeSpace();
  }, [distributeSpace]);

  return {
    dimensions,
    availableHeight,
    isMobile,
    isTablet,
    recalculate: distributeSpace
  };
};