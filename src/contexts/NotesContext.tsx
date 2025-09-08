import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toastUtils';

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

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  saving: boolean;
  fetchNotes: () => Promise<void>;
  createNote: (noteData: CreateNoteData) => Promise<Note | null>;
  updateNote: (noteId: string, updates: UpdateNoteData) => Promise<boolean>;
  deleteNote: (noteId: string) => Promise<boolean>;
  getNoteById: (noteId: string) => Note | null;
  getFilteredNotes: (searchQuery: string, category: string) => Note[];
  flushSaveNote: (noteId: string, updates: UpdateNoteData) => Promise<boolean>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const subscriptionRef = useRef<any>(null);

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
      console.error('Error fetching notes:', error);
      toast.error('Error carregant les notes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      subscriptionRef.current = supabase
        .channel('notes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Realtime note change:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newNote = payload.new as Note;
              setNotes(prev => {
                // Avoid duplicates
                if (prev.find(note => note.id === newNote.id)) return prev;
                return [newNote, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedNote = payload.new as Note;
              setNotes(prev => {
                const filtered = prev.filter(note => note.id !== updatedNote.id);
                return [updatedNote, ...filtered]; // Move to top
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedNote = payload.old as Note;
              setNotes(prev => prev.filter(note => note.id !== deletedNote.id));
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
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
      
      // Optimistically update local state (realtime will also update)
      setNotes(prev => {
        if (prev.find(note => note.id === newNote.id)) return prev;
        return [newNote, ...prev];
      });
      
      toast.success('Nota creada correctament');
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Error creant la nota');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateNote = useCallback(async (noteId: string, updates: UpdateNoteData): Promise<boolean> => {
    try {
      setSaving(true);
      
      // Optimistically update local state first
      setNotes(prev => {
        const noteIndex = prev.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return prev;
        
        const updatedNote = { 
          ...prev[noteIndex], 
          ...updates, 
          updated_at: new Date().toISOString() 
        };
        
        // Move updated note to top
        const newNotes = prev.filter(note => note.id !== noteId);
        return [updatedNote, ...newNotes];
      });

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      // Update with server response
      const updatedNote = data as Note;
      setNotes(prev => {
        const filtered = prev.filter(note => note.id !== noteId);
        return [updatedNote, ...filtered];
      });
      
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Error actualitzant la nota');
      
      // Revert optimistic update on error
      await fetchNotes();
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchNotes]);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      setSaving(true);
      
      // Optimistically remove from local state
      setNotes(prev => prev.filter(note => note.id !== noteId));

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast.success('Nota eliminada correctament');
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Error eliminant la nota');
      
      // Revert optimistic update on error
      await fetchNotes();
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchNotes]);

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

  // Flush save for when switching notes or unmounting
  const flushSaveNote = useCallback(async (noteId: string, updates: UpdateNoteData): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      const updatedNote = data as Note;
      setNotes(prev => {
        const filtered = prev.filter(note => note.id !== noteId);
        return [updatedNote, ...filtered];
      });
      
      return true;
    } catch (error) {
      console.error('Error flush saving note:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const value: NotesContextType = {
    notes,
    loading,
    saving,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getFilteredNotes,
    flushSaveNote
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};