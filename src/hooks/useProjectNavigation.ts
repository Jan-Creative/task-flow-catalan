import { useEffect } from 'react';
import { useProjectNavigation } from '@/contexts/ProjectNavigationContext';

export const useProjectKeyboardShortcuts = (onCreateTask: () => void) => {
  const { setIsSearchFocused, isSearchFocused } = useProjectNavigation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Cmd+F to focus search
      if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'f')) {
        event.preventDefault();
        setIsSearchFocused(true);
      }

      // Cmd+N to create new project task
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onCreateTask();
      }

      // Escape to blur search
      if (event.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCreateTask, setIsSearchFocused, isSearchFocused]);
};

export const useProjectSearchLogic = () => {
  const { searchQuery, setSearchResults } = useProjectNavigation();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Simulate search logic for project content
    const mockResults = [
      {
        id: '1',
        title: `Tasques del projecte: "${searchQuery}"`,
        type: 'task' as const,
        url: '/project-tasks',
        icon: 'Search'
      },
      {
        id: '2',
        title: `Documents: "${searchQuery}"`,
        type: 'document' as const,
        url: '/project-docs',
        icon: 'FileText'
      }
    ];

    // Add debounce
    const timeoutId = setTimeout(() => {
      setSearchResults(mockResults);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearchResults]);
};