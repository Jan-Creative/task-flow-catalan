import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/lib/toastUtils';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error carregant el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayName = async (newDisplayName: string) => {
    if (!user) throw new Error('No user found');
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: newDisplayName })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, display_name: newDisplayName } : null);
      toast.success('Nom actualitzat correctament');
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Error actualitzant el nom');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!user) throw new Error('No user found');
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
      toast.success('Email actualitzat correctament. Revisa el teu correu per confirmar.');
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Error actualitzant l\'email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateDisplayName,
    updateEmail,
    refetch: fetchProfile
  };
};