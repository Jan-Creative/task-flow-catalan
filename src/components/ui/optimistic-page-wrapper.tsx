import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface OptimisticPageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

// Wrapper that prevents flash content during navigation
export const OptimisticPageWrapper = ({ 
  children, 
  fallback, 
  delay = 150 
}: OptimisticPageWrapperProps) => {
  const [showContent, setShowContent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start navigation state
    setIsNavigating(true);
    setShowContent(false);

    // Delayed show to prevent flash
    const timer = setTimeout(() => {
      setShowContent(true);
      setIsNavigating(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, delay]);

  if (isNavigating && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};