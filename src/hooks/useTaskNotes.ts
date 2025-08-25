import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/lib/toastUtils';

export const useTaskNotes = (taskId: string) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('task_notes')
        .select('*')
        .eq('task_id', taskId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setNotes(data.content);
        setNoteId(data.id);
      } else {
        setNotes('');
        setNoteId(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'han pogut carregar les notes"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = useCallback(async (content: string) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (noteId) {
        // Update existing note
        const { error } = await supabase
          .from('task_notes')
          .update({ content })
          .eq('id', noteId);
        
        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('task_notes')
          .insert({
            task_id: taskId,
            content
          })
          .select()
          .single();
        
        if (error) throw error;
        setNoteId(data.id);
      }
      
      setIsModified(false);
      setLastSaved(new Date());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'han pogut guardar les notes"
      });
    } finally {
      setIsSaving(false);
    }
  }, [taskId, noteId, isSaving, toast]);

  const updateNotes = (newContent: string) => {
    setNotes(newContent);
    setIsModified(true);
  };

  // Auto-save effect
  useEffect(() => {
    if (isModified && !loading) {
      const timer = setTimeout(() => {
        saveNotes(notes);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [notes, isModified, loading, saveNotes]);

  const forceSave = () => {
    if (isModified) {
      saveNotes(notes);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [taskId]);

  return {
    notes,
    loading,
    isSaving,
    isModified,
    lastSaved,
    updateNotes,
    forceSave,
    refetch: fetchNotes
  };
};