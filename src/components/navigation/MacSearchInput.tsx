import { useRef, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { useMacNavigation } from '@/contexts/MacNavigationContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MacSearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearchFocused, 
    setIsSearchFocused,
    searchResults 
  } = useMacNavigation();

  useEffect(() => {
    if (isSearchFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchFocused]);

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    // Delay blur to allow clicking on search results
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cercar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full h-9 pl-9 pr-16 rounded-lg border border-border bg-background/50 backdrop-blur-sm",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "transition-all duration-200"
          )}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <kbd className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-muted">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>
      </div>

      {/* Search Results */}
      {isSearchFocused && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg backdrop-blur-2xl z-50">
          <div className="p-2 space-y-1">
            {searchResults.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => {
                  // Handle navigation
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{result.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MacSearchInput;