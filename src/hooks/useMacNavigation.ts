import { useEffect } from 'react';
import { useMacNavigation } from '@/contexts/MacNavigationContext';

export const useMacKeyboardShortcuts = (onCreateTask: () => void) => {
  const { setIsSearchFocused, isSearchFocused } = useMacNavigation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Cmd+F to focus search
      if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'f')) {
        event.preventDefault();
        setIsSearchFocused(true);
      }

      // Cmd+N to create new task
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

export const useMacSearchLogic = () => {
  const { searchQuery, setSearchResults } = useMacNavigation();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Simulate search logic - in real app this would search tasks, folders, etc.
    const mockResults = [
      {
        id: '1',
        title: `Resultats per "${searchQuery}"`,
        type: 'task' as const,
        url: '/search',
        icon: 'Search'
      }
    ];

    // Add debounce
    const timeoutId = setTimeout(() => {
      setSearchResults(mockResults);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearchResults]);
};