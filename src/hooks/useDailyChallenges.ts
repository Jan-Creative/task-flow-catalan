import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { DailyChallenge, CreateChallengeData, ChallengeDifficulty, ChallengeCategory } from '@/types/challenges';
import { toast } from 'sonner';

export const useDailyChallenges = () => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch challenges from database
  const fetchChallenges = async () => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('challenge_date', { ascending: false });

      if (error) throw error;

      // Cast the data to proper types since Supabase returns strings
      const typedChallenges = (data || []).map(challenge => ({
        ...challenge,
        difficulty: challenge.difficulty as ChallengeDifficulty,
        category: challenge.category as ChallengeCategory,
      }));

      setChallenges(typedChallenges);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
      toast.error('Error carregant els reptes');
    } finally {
      setLoading(false);
    }
  };

  // Create new challenge
  const createChallenge = async (challengeData: CreateChallengeData): Promise<DailyChallenge | null> => {
    if (!user) {
      toast.error('Has d\'estar autenticat per crear reptes');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .insert({
          ...challengeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Cast the returned data to proper types
      const typedChallenge = {
        ...data,
        difficulty: data.difficulty as ChallengeDifficulty,
        category: data.category as ChallengeCategory,
      };

      setChallenges(prev => [typedChallenge, ...prev]);
      toast.success('Repte creat correctament');
      return typedChallenge;
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
      toast.error('Error creant el repte');
      return null;
    }
  };

  // Update challenge completion status
  const toggleChallengeComplete = async (challengeId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Has d\'estar autenticat');
      return false;
    }

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    const newCompletedStatus = !challenge.is_completed;
    const updateData = {
      is_completed: newCompletedStatus,
      completed_at: newCompletedStatus ? new Date().toISOString() : null,
    };

    try {
      const { error } = await supabase
        .from('daily_challenges')
        .update(updateData)
        .eq('id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setChallenges(prev => prev.map(c => 
        c.id === challengeId 
          ? { ...c, ...updateData }
          : c
      ));

      toast.success(newCompletedStatus ? 'Repte completat!' : 'Repte marcat com a pendent');
      return true;
    } catch (err) {
      console.error('Error updating challenge:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
      toast.error('Error actualitzant el repte');
      return false;
    }
  };

  // Update challenge
  const updateChallenge = async (challengeId: string, updates: Partial<DailyChallenge>): Promise<boolean> => {
    if (!user) {
      toast.error('Has d\'estar autenticat');
      return false;
    }

    try {
      const { error } = await supabase
        .from('daily_challenges')
        .update(updates)
        .eq('id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setChallenges(prev => prev.map(c => 
        c.id === challengeId ? { ...c, ...updates } : c
      ));

      toast.success('Repte actualitzat correctament');
      return true;
    } catch (err) {
      console.error('Error updating challenge:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
      toast.error('Error actualitzant el repte');
      return false;
    }
  };

  // Delete challenge
  const deleteChallenge = async (challengeId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Has d\'estar autenticat');
      return false;
    }

    try {
      const { error } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setChallenges(prev => prev.filter(c => c.id !== challengeId));
      toast.success('Repte eliminat correctament');
      return true;
    } catch (err) {
      console.error('Error deleting challenge:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
      toast.error('Error eliminant el repte');
      return false;
    }
  };

  // Get challenges for specific date
  const getChallengesForDate = (date: string) => {
    return challenges.filter(c => c.challenge_date === date);
  };

  // Get today's challenges
  const getTodayChallenges = () => {
    const today = new Date().toISOString().split('T')[0];
    return getChallengesForDate(today);
  };

  // Get future challenges (limited amount)
  const getFutureChallenges = (limit: number = 3) => {
    const today = new Date().toISOString().split('T')[0];
    return challenges
      .filter(c => c.challenge_date > today)
      .slice(0, limit);
  };

  // Load challenges on component mount and when user changes
  useEffect(() => {
    fetchChallenges();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('daily_challenges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_challenges',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch challenges when changes occur
          fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    challenges,
    loading,
    error,
    createChallenge,
    toggleChallengeComplete,
    updateChallenge,
    deleteChallenge,
    getChallengesForDate,
    getTodayChallenges,
    getFutureChallenges,
    refetch: fetchChallenges,
  };
};