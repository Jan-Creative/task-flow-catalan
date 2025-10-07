import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toastUtils';
import { logger } from '@/lib/logger';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  is_starred?: boolean;
  is_archived?: boolean;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      logger.error('useNotes', 'Error fetching notes', error);
      toast.error('Error carregant les notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: noteData.title,
          content: noteData.content || '',
          tags: noteData.tags || [],
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newNote = data as Note;
      setNotes(prev => [newNote, ...prev]);
      toast.success('Nota creada correctament');
      return newNote;
    } catch (error) {
      logger.error('useNotes', 'Error creating note', error);
      toast.error('Error creant la nota');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateNote = useCallback(async (noteId: string, updates: UpdateNoteData): Promise<boolean> => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      const updatedNote = data as Note;
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      
      return true;
    } catch (error) {
      logger.error('useNotes', 'Error updating note', error);
      toast.error('Error actualitzant la nota');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Nota eliminada correctament');
      return true;
    } catch (error) {
      logger.error('useNotes', 'Error deleting note', error);
      toast.error('Error eliminant la nota');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const getNoteById = useCallback((noteId: string) => {
    return notes.find(note => note.id === noteId) || null;
  }, [notes]);

  const getFilteredNotes = useCallback((searchQuery: string, category: string) => {
    let filtered = notes;

    // Filter by category
    switch (category) {
      case 'starred':
        filtered = filtered.filter(note => note.is_starred);
        break;
      case 'archived':
        filtered = filtered.filter(note => note.is_archived);
        break;
      case 'tagged':
        filtered = filtered.filter(note => note.tags.length > 0);
        break;
      default:
        filtered = filtered.filter(note => !note.is_archived);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [notes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    saving,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getFilteredNotes
  };
};