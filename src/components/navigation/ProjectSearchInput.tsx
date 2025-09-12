import { Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectNavigation } from "@/contexts/ProjectNavigationContext";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const ProjectSearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearchFocused, 
    setIsSearchFocused,
    searchResults 
  } = useProjectNavigation();

  // Focus input when isSearchFocused is true
  useEffect(() => {
    if (isSearchFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchFocused]);

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    // Small delay to allow interaction with search results
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Cercar en el projecte..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "pl-10 pr-20 h-10 bg-background/50 border-border/50",
            "focus:bg-background focus:border-primary/50 transition-colors",
            "placeholder:text-muted-foreground/70"
          )}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <kbd className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isSearchFocused && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchResults.map((result) => (
            <Button
              key={result.id}
              variant="ghost"
              className="w-full h-auto p-3 justify-start hover:bg-accent/60 rounded-none first:rounded-t-lg last:rounded-b-lg"
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
                // Navigate to result - future implementation
              }}
            >
              <div className="text-left">
                <div className="font-medium text-sm">{result.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSearchInput;