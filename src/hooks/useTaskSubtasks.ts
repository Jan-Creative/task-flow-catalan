import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  sort_order: number;
  completed_at?: string;
}

export const useTaskSubtasks = (taskId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubtasks = async () => {
    try {
      const { data, error } = await supabase
        .from('task_subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'han pogut carregar les subtasques"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSubtask = async (title: string) => {
    try {
      const maxOrder = Math.max(...subtasks.map(s => s.sort_order), -1);
      const { data, error } = await supabase
        .from('task_subtasks')
        .insert({
          task_id: taskId,
          title: title.trim(),
          sort_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;
      setSubtasks(prev => [...prev, data]);
      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut crear la subtasca"
      });
    }
  };

  const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
    try {
      const updateData = {
        ...updates,
        ...(updates.completed !== undefined && {
          completed_at: updates.completed ? new Date().toISOString() : null
        })
      };

      const { error } = await supabase
        .from('task_subtasks')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      setSubtasks(prev => 
        prev.map(subtask => 
          subtask.id === id 
            ? { ...subtask, ...updates }
            : subtask
        )
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut actualitzar la subtasca"
      });
    }
  };

  const deleteSubtask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut eliminar la subtasca"
      });
    }
  };

  const toggleSubtask = (id: string) => {
    const subtask = subtasks.find(s => s.id === id);
    if (subtask) {
      updateSubtask(id, { completed: !subtask.completed });
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercentage = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  return {
    subtasks,
    loading,
    completedCount,
    progressPercentage,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    refetch: fetchSubtasks
  };
};