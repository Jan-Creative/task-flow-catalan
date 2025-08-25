/**
 * Notification Block Management Hook - Simplifica la gestió dels blocs de notificacions
 */

import { useState, useCallback } from 'react';
import { useNotificationBlocks } from './useNotificationBlocks';
import { logger } from '@/lib/debugUtils';
import { useErrorHandler } from './useErrorHandler';

export interface BlockModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  blockId?: string;
}

export interface NotificationBlockFormData {
  name: string;
  description?: string;
  notifications: Array<{
    id?: string;
    time: string;
    title: string;
    message: string;
  }>;
}

export const useBlockManager = () => {
  const blocksHook = useNotificationBlocks();
  const { handleAsyncError } = useErrorHandler();
  
  const [modalState, setModalState] = useState<BlockModalState>({
    isOpen: false,
    mode: 'create'
  });

  // Modal management
  const openCreateModal = useCallback(() => {
    logger.debug('BlockManager', 'Opening create modal');
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  }, []);

  const openEditModal = useCallback((blockId: string) => {
    logger.debug('BlockManager', 'Opening edit modal for block', blockId);
    setModalState({
      isOpen: true,
      mode: 'edit',
      blockId
    });
  }, []);

  const closeModal = useCallback(() => {
    logger.debug('BlockManager', 'Closing modal');
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  }, []);

  // Block operations with error handling
  const handleSaveBlock = useCallback(async (blockData: NotificationBlockFormData) => {
    const context = {
      component: 'BlockManager',
      action: modalState.mode === 'create' ? 'createBlock' : 'updateBlock'
    };

    const result = await handleAsyncError(async () => {
      if (modalState.mode === 'create') {
        // Transform notifications for the API (without id for creation)
        const transformedNotifications = blockData.notifications.map(n => ({
          time: n.time,
          title: n.title,
          message: n.message,
          id: n.id || '',
          block_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        return await blocksHook.createBlock({
          name: blockData.name,
          description: blockData.description,
          is_active: false,
          notifications: transformedNotifications
        });
      } else if (modalState.blockId) {
        // Transform notifications for the API (with existing ids)
        const transformedNotifications = blockData.notifications.map(n => ({
          time: n.time,
          title: n.title,
          message: n.message,
          id: n.id || '',
          block_id: modalState.blockId!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        return await blocksHook.updateBlock({
          blockId: modalState.blockId,
          blockData: {
            name: blockData.name,
            description: blockData.description,
            is_active: false,
            notifications: transformedNotifications
          }
        });
      }
    }, context);

    if (result !== null) {
      closeModal();
      logger.info(`Block ${modalState.mode === 'create' ? 'created' : 'updated'} successfully`);
    }
  }, [modalState, blocksHook, handleAsyncError, closeModal]);

  const handleToggleBlock = useCallback(async (blockId: string, currentState: boolean) => {
    const context = {
      component: 'BlockManager',
      action: 'toggleBlock'
    };

    await handleAsyncError(async () => {
      return await blocksHook.toggleBlock({
        blockId,
        isActive: !currentState
      });
    }, context);
  }, [blocksHook, handleAsyncError]);

  const handleDeleteBlock = useCallback(async (blockId: string) => {
    const context = {
      component: 'BlockManager',
      action: 'deleteBlock'
    };

    const result = await handleAsyncError(async () => {
      return await blocksHook.deleteBlock(blockId);
    }, context);

    if (result !== null) {
      logger.info('Block deleted successfully');
    }
  }, [blocksHook, handleAsyncError]);

  // Get current block data for editing
  const getCurrentBlockData = useCallback((): NotificationBlockFormData | null => {
    if (modalState.mode === 'edit' && modalState.blockId) {
      const block = blocksHook.blocks?.find(b => b.id === modalState.blockId);
      if (block) {
        return {
          name: block.name,
          description: block.description || '',
          notifications: block.notifications || []
        };
      }
    }
    return null;
  }, [modalState, blocksHook.blocks]);

  return {
    // State from hooks
    blocks: blocksHook.blocks,
    isLoading: blocksHook.isLoading,
    error: blocksHook.error,
    
    // Loading states
    isCreating: blocksHook.isCreating,
    isUpdating: blocksHook.isUpdating,
    isDeleting: blocksHook.isDeleting,
    isToggling: blocksHook.isToggling,
    
    // Modal state
    modalState,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveBlock,
    handleToggleBlock,
    handleDeleteBlock,
    
    // Utilities
    getCurrentBlockData
  };
};