import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MacNavigationContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
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
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const MacNavigationProvider = ({ 
  children, 
  isCollapsed: externalIsCollapsed,
  onToggleCollapsed
}: MacNavigationProviderProps) => {
  // Use external state if provided, otherwise use internal state
  const [internalIsCollapsed, setInternalIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('mac-sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Determine which collapsed state to use
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  // Persist collapsed state only when using internal state
  useEffect(() => {
    if (externalIsCollapsed === undefined) {
      localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(internalIsCollapsed));
    }
  }, [internalIsCollapsed, externalIsCollapsed]);

  // Sync external state changes to internal state for localStorage persistence
  useEffect(() => {
    if (externalIsCollapsed !== undefined) {
      localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(externalIsCollapsed));
    }
  }, [externalIsCollapsed]);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+\ to toggle sidebar (like VS Code)
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault();
        toggleCollapsed();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapsed]);

  const toggleCollapsed = () => {
    if (onToggleCollapsed) {
      // Use external toggle handler
      onToggleCollapsed();
    } else {
      // Use internal state
      setInternalIsCollapsed(prev => !prev);
    }
  };

  const setIsCollapsed = (collapsed: boolean) => {
    if (onToggleCollapsed && externalIsCollapsed !== undefined) {
      // External state management - only call toggle if state would change
      if (collapsed !== externalIsCollapsed) {
        onToggleCollapsed();
      }
    } else {
      // Internal state management
      setInternalIsCollapsed(collapsed);
    }
  };

  const value = {
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchResults,
    setSearchResults
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