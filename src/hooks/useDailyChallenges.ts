import { useState, useEffect } from 'react';
import type { DailyChallenge, CreateChallengeData } from '@/types/challenges';

// Mock hook for visual implementation
// This will be replaced with actual Supabase integration later
export const useDailyChallenges = () => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setChallenges([
        {
          id: '1',
          user_id: 'user1',
          title: 'Fer 30 minuts d\'exercici',
          description: 'Rutina matinal d\'exercici cardiovascular',
          challenge_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          is_completed: false,
          difficulty: 'medium',
          category: 'health',
          color: 'hsl(var(--success))',
          icon: 'Heart'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const createChallenge = async (challengeData: CreateChallengeData): Promise<DailyChallenge | null> => {
    try {
      setLoading(true);
      
      // Mock creation - replace with actual Supabase call
      const newChallenge: DailyChallenge = {
        id: Date.now().toString(),
        user_id: 'mock-user',
        ...challengeData,
        created_at: new Date().toISOString(),
        is_completed: false
      };

      setChallenges(prev => [...prev, newChallenge]);
      return newChallenge;
    } catch (err) {
      setError('Error creating challenge');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateChallenge = async (challengeId: string, updates: Partial<DailyChallenge>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Mock update - replace with actual Supabase call
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId ? { ...challenge, ...updates } : challenge
      ));
      
      return true;
    } catch (err) {
      setError('Error updating challenge');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Mock deletion - replace with actual Supabase call
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
      
      return true;
    } catch (err) {
      setError('Error deleting challenge');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getChallengesForDate = (date: string): DailyChallenge[] => {
    return challenges.filter(challenge => challenge.challenge_date === date);
  };

  const getCompletionStats = () => {
    const total = challenges.length;
    const completed = challenges.filter(c => c.is_completed).length;
    return {
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  };

  return {
    challenges,
    loading,
    error,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getChallengesForDate,
    getCompletionStats
  };
};