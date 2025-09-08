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
}

export const MacNavigationProvider = ({ children }: MacNavigationProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('mac-sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

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
        setIsCollapsed(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
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