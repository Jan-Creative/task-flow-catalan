import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SidebarState = 'expanded' | 'mini' | 'hidden';

interface MacNavigationContextType {
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  cycleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  // Legacy compatibility
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'task' | 'folder' | 'page';
  url: string;
  icon?: string;
}

const MacNavigationContext = createContext<MacNavigationContextType | null>(null);

interface MacNavigationProviderProps {
  children: ReactNode;
  sidebarState?: SidebarState;
  onSidebarStateChange?: (state: SidebarState) => void;
  // Legacy compatibility
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const MacNavigationProvider = ({ 
  children, 
  sidebarState: externalSidebarState,
  onSidebarStateChange,
  // Legacy compatibility
  isCollapsed: externalIsCollapsed,
  onToggleCollapsed
}: MacNavigationProviderProps) => {
  // Convert legacy boolean to new state system
  const legacyToState = (collapsed: boolean): SidebarState => collapsed ? 'mini' : 'expanded';
  const stateToLegacy = (state: SidebarState): boolean => state !== 'expanded';

  // Internal state management
  const [internalSidebarState, setInternalSidebarState] = useState<SidebarState>(() => {
    const stored = localStorage.getItem('mac-sidebar-state');
    if (stored && ['expanded', 'mini', 'hidden'].includes(stored)) {
      return stored as SidebarState;
    }
    // Fallback to legacy storage
    const legacyStored = localStorage.getItem('mac-sidebar-collapsed');
    return legacyStored ? legacyToState(JSON.parse(legacyStored)) : 'expanded';
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Determine current state (priority: external > legacy external > internal)
  const currentSidebarState = externalSidebarState || 
    (externalIsCollapsed !== undefined ? legacyToState(externalIsCollapsed) : internalSidebarState);

  // Legacy compatibility
  const isCollapsed = stateToLegacy(currentSidebarState);

  // Persist sidebar state
  useEffect(() => {
    if (!externalSidebarState && externalIsCollapsed === undefined) {
      localStorage.setItem('mac-sidebar-state', internalSidebarState);
      // Also maintain legacy storage for compatibility
      localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(stateToLegacy(internalSidebarState)));
    }
  }, [internalSidebarState, externalSidebarState, externalIsCollapsed]);

  // Sync external state changes to localStorage
  useEffect(() => {
    if (externalSidebarState) {
      localStorage.setItem('mac-sidebar-state', externalSidebarState);
      localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(stateToLegacy(externalSidebarState)));
    } else if (externalIsCollapsed !== undefined) {
      const newState = legacyToState(externalIsCollapsed);
      localStorage.setItem('mac-sidebar-state', newState);
      localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(externalIsCollapsed));
    }
  }, [externalSidebarState, externalIsCollapsed]);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+\ to cycle between expanded ↔ mini (VS Code style)
      if ((event.metaKey || event.ctrlKey) && event.key === '\\' && !event.altKey) {
        event.preventDefault();
        toggleSidebar();
      }
      
      // Cmd+Alt+\ to toggle hidden state
      if ((event.metaKey || event.ctrlKey) && event.key === '\\' && event.altKey) {
        event.preventDefault();
        cycleSidebar();
      }
      
      // Cmd+B to toggle sidebar visible/hidden (standard)
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        const newState = currentSidebarState === 'hidden' ? 'expanded' : 'hidden';
        setSidebarState(newState);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSidebarState]);

  // State management functions
  const setSidebarState = (newState: SidebarState) => {
    if (onSidebarStateChange) {
      onSidebarStateChange(newState);
    } else if (onToggleCollapsed && externalIsCollapsed !== undefined) {
      // Legacy external management
      const newCollapsed = stateToLegacy(newState);
      if (newCollapsed !== externalIsCollapsed) {
        onToggleCollapsed();
      }
    } else {
      // Internal management
      setInternalSidebarState(newState);
    }
  };

  // Toggle between expanded ↔ mini (maintaining hidden if currently hidden)
  const toggleSidebar = () => {
    if (currentSidebarState === 'hidden') return;
    const newState = currentSidebarState === 'expanded' ? 'mini' : 'expanded';
    setSidebarState(newState);
  };

  // Cycle through all three states: expanded → mini → hidden → expanded
  const cycleSidebar = () => {
    const cycle: Record<SidebarState, SidebarState> = {
      'expanded': 'mini',
      'mini': 'hidden', 
      'hidden': 'expanded'
    };
    setSidebarState(cycle[currentSidebarState]);
  };

  // Legacy compatibility functions
  const toggleCollapsed = () => {
    if (onToggleCollapsed) {
      onToggleCollapsed();
    } else {
      toggleSidebar();
    }
  };

  const setIsCollapsed = (collapsed: boolean) => {
    const newState = collapsed ? 'mini' : 'expanded';
    setSidebarState(newState);
  };

  const value = {
    // New 3-state API
    sidebarState: currentSidebarState,
    setSidebarState,
    toggleSidebar,
    cycleSidebar,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchResults,
    setSearchResults,
    // Legacy compatibility
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed
  };

  return (
    <MacNavigationContext.Provider value={value}>
      {children}
    </MacNavigationContext.Provider>
  );
};

export const useMacNavigation = () => {
  const context = useContext(MacNavigationContext);
  if (!context) {
    throw new Error('useMacNavigation must be used within MacNavigationProvider');
  }
  return context;
};