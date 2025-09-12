import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProjectNavigationContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  activeProjectPage: string;
  setActiveProjectPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchResults: ProjectSearchResult[];
  setSearchResults: (results: ProjectSearchResult[]) => void;
}

export interface ProjectSearchResult {
  id: string;
  title: string;
  type: 'task' | 'section' | 'document';
  url: string;
  icon?: string;
}

const ProjectNavigationContext = createContext<ProjectNavigationContextType | null>(null);

interface ProjectNavigationProviderProps {
  children: ReactNode;
  projectId: string;
}

export const ProjectNavigationProvider = ({ children, projectId }: ProjectNavigationProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(`project-${projectId}-sidebar-collapsed`);
    return stored ? JSON.parse(stored) : false;
  });
  
  const [activeProjectPage, setActiveProjectPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<ProjectSearchResult[]>([]);

  // Persist collapsed state per project
  useEffect(() => {
    localStorage.setItem(`project-${projectId}-sidebar-collapsed`, JSON.stringify(isCollapsed));
  }, [isCollapsed, projectId]);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+\ to toggle sidebar
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
    activeProjectPage,
    setActiveProjectPage,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchResults,
    setSearchResults
  };

  return (
    <ProjectNavigationContext.Provider value={value}>
      {children}
    </ProjectNavigationContext.Provider>
  );
};

export const useProjectNavigation = () => {
  const context = useContext(ProjectNavigationContext);
  if (!context) {
    throw new Error('useProjectNavigation must be used within ProjectNavigationProvider');
  }
  return context;
};