import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BlockNotification {
  id: string;
  title: string;
  message: string;
  time: string;
}

export interface NotificationBlock {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  notifications: BlockNotification[];
}

export const useNotificationBlocks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all blocks with their notifications
  const { data: blocks = [], isLoading, error } = useQuery({
    queryKey: ['notification-blocks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('notification_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (blocksError) throw blocksError;

      // Fetch notifications for each block
      const blocksWithNotifications = await Promise.all(
        (blocksData || []).map(async (block) => {
          const { data: notifications, error: notificationsError } = await supabase
            .from('block_notifications')
            .select('*')
            .eq('block_id', block.id)
            .order('time', { ascending: true });

          if (notificationsError) throw notificationsError;

          return {
            ...block,
            notifications: notifications.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              time: n.time
            }))
          };
        })
      );

      return blocksWithNotifications as NotificationBlock[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create block
  const createBlockMutation = useMutation({
    mutationFn: async (blockData: Omit<NotificationBlock, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create the block
      const { data: block, error: blockError } = await supabase
        .from('notification_blocks')
        .insert({
          user_id: user.id,
          name: blockData.name,
          description: blockData.description,
          is_active: blockData.is_active
        })
        .select()
        .single();

      if (blockError) throw blockError;

      // Create the notifications for this block
      if (blockData.notifications.length > 0) {
        const { error: notificationsError } = await supabase
          .from('block_notifications')
          .insert(
            blockData.notifications.map(notification => ({
              block_id: block.id,
              title: notification.title,
              message: notification.message,
              time: notification.time
            }))
          );

        if (notificationsError) throw notificationsError;
      }

      return block;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-blocks'] });
      toast.success('Bloc creat correctament');
    },
    onError: (error) => {
      console.error('Error creating block:', error);
      toast.error('Error al crear el bloc');
    }
  });

  // Update block
  const updateBlockMutation = useMutation({
    mutationFn: async ({ blockId, blockData }: { blockId: string; blockData: Omit<NotificationBlock, 'id'> }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update the block
      const { error: blockError } = await supabase
        .from('notification_blocks')
        .update({
          name: blockData.name,
          description: blockData.description,
          is_active: blockData.is_active
        })
        .eq('id', blockId)
        .eq('user_id', user.id);

      if (blockError) throw blockError;

      // Delete existing notifications
      const { error: deleteError } = await supabase
        .from('block_notifications')
        .delete()
        .eq('block_id', blockId);

      if (deleteError) throw deleteError;

      // Create new notifications
      if (blockData.notifications.length > 0) {
        const { error: notificationsError } = await supabase
          .from('block_notifications')
          .insert(
            blockData.notifications.map(notification => ({
              block_id: blockId,
              title: notification.title,
              message: notification.message,
              time: notification.time
            }))
          );

        if (notificationsError) throw notificationsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-blocks'] });
      toast.success('Bloc actualitzat correctament');
    },
    onError: (error) => {
      console.error('Error updating block:', error);
      toast.error('Error al actualitzar el bloc');
    }
  });

  // Delete block
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First cancel any pending reminders for this block
      const { error: reminderError } = await supabase
        .from('notification_reminders')
        .update({ status: 'cancelled' })
        .eq('block_id', blockId)
        .eq('status', 'pending');

      if (reminderError) console.warn('Error cancelling reminders:', reminderError);

      // Delete notifications first (due to foreign key)
      const { error: notificationsError } = await supabase
        .from('block_notifications')
        .delete()
        .eq('block_id', blockId);

      if (notificationsError) throw notificationsError;

      // Delete the block
      const { error: blockError } = await supabase
        .from('notification_blocks')
        .delete()
        .eq('id', blockId)
        .eq('user_id', user.id);

      if (blockError) throw blockError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-blocks'] });
      toast.success('Bloc eliminat correctament');
    },
    onError: (error) => {
      console.error('Error deleting block:', error);
      toast.error('Error al eliminar el bloc');
    }
  });

  // Toggle block activation
  const toggleBlockMutation = useMutation({
    mutationFn: async ({ blockId, isActive }: { blockId: string; isActive: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update block status
      const { error: blockError } = await supabase
        .from('notification_blocks')
        .update({ is_active: isActive })
        .eq('id', blockId)
        .eq('user_id', user.id);

      if (blockError) throw blockError;

      if (isActive) {
        // When activating: create scheduled reminders for each notification in the block
        const { data: notifications } = await supabase
          .from('block_notifications')
          .select('*')
          .eq('block_id', blockId);

        if (notifications && notifications.length > 0) {
          // Create reminders for today (you might want to make this configurable)
          const today = new Date();
          const reminders = notifications.map(notification => {
            const [hours, minutes] = notification.time.split(':');
            const scheduledAt = new Date(today);
            scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // If the time has passed for today, schedule for tomorrow
            if (scheduledAt <= new Date()) {
              scheduledAt.setDate(scheduledAt.getDate() + 1);
            }

            return {
              user_id: user.id,
              block_id: blockId,
              title: notification.title,
              message: notification.message,
              scheduled_at: scheduledAt.toISOString(),
              notification_type: 'block_notification',
              status: 'pending'
            };
          });

          const { error: reminderError } = await supabase
            .from('notification_reminders')
            .insert(reminders);

          if (reminderError) throw reminderError;
        }
      } else {
        // When deactivating: cancel all pending reminders for this block
        const { error: cancelError } = await supabase
          .from('notification_reminders')
          .update({ status: 'cancelled' })
          .eq('block_id', blockId)
          .eq('status', 'pending');

        if (cancelError) throw cancelError;
      }
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['notification-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-notifications'] });
      toast.success(isActive ? 'Bloc activat' : 'Bloc desactivat');
    },
    onError: (error) => {
      console.error('Error toggling block:', error);
      toast.error('Error al canviar l\'estat del bloc');
    }
  });

  return {
    blocks,
    isLoading,
    error,
    createBlock: createBlockMutation.mutate,
    updateBlock: updateBlockMutation.mutate,
    deleteBlock: deleteBlockMutation.mutate,
    toggleBlock: toggleBlockMutation.mutate,
    isCreating: createBlockMutation.isPending,
    isUpdating: updateBlockMutation.isPending,
    isDeleting: deleteBlockMutation.isPending,
    isToggling: toggleBlockMutation.isPending
  };
};