import React, { createContext, useContext, useState } from 'react';

interface PropertyDialogContextType {
  isCreateDialogOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
}

const PropertyDialogContext = createContext<PropertyDialogContextType | undefined>(undefined);

export const usePropertyDialog = () => {
  const context = useContext(PropertyDialogContext);
  if (!context) {
    throw new Error('usePropertyDialog must be used within a PropertyDialogProvider');
  }
  return context;
};

interface PropertyDialogProviderProps {
  children: React.ReactNode;
}

export const PropertyDialogProvider: React.FC<PropertyDialogProviderProps> = ({ children }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const openCreateDialog = () => {
    console.log('🎯 Property Dialog: Opening create dialog');
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    console.log('🎯 Property Dialog: Closing create dialog');
    setIsCreateDialogOpen(false);
  };

  return (
    <PropertyDialogContext.Provider
      value={{
        isCreateDialogOpen,
        openCreateDialog,
        closeCreateDialog,
      }}
    >
      {children}
    </PropertyDialogContext.Provider>
  );
};