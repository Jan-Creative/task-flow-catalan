export interface DailyChallenge {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  challenge_date: string; // Data per la qual està programat
  created_at: string;
  completed_at?: string;
  is_completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'personal' | 'work' | 'health' | 'learning' | 'creativity';
  icon?: string;
  color: string;
}

export interface CreateChallengeData {
  title: string;
  description?: string;
  challenge_date: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'personal' | 'work' | 'health' | 'learning' | 'creativity';
  icon?: string;
  color: string;
}

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeCategory = 'personal' | 'work' | 'health' | 'learning' | 'creativity';