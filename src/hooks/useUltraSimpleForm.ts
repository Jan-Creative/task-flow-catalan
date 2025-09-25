/**
 * Hook per gestionar l'estat del formulari ultra simple
 * Optimitzat per la integració amb teclat d'iPhone
 */

import { useState, useCallback } from 'react';

interface UseUltraSimpleFormOptions {
  onSubmit?: (title: string) => void;
  onClose?: () => void;
}

export const useUltraSimpleForm = ({ onSubmit, onClose }: UseUltraSimpleFormOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openForm = useCallback(() => {
    console.log('📝 Obrint formulari ultra simple');
    setIsOpen(true);
  }, []);
  
  const closeForm = useCallback(() => {
    console.log('❌ Tancant formulari ultra simple');
    setIsOpen(false);
    onClose?.();
  }, [onClose]);
  
  const handleSubmit = useCallback((title: string) => {
    console.log('✅ Enviant tasca:', { title });
    onSubmit?.(title);
    setIsOpen(false);
  }, [onSubmit]);
  
  return {
    isOpen,
    openForm,
    closeForm,
    handleSubmit,
  };
};