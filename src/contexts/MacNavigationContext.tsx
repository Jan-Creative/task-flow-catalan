import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MacNavigationContextType {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const value = {
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