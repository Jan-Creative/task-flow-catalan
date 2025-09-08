import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Zap, User, Briefcase, Heart, BookOpen, Palette } from "lucide-react";
import { CreateChallengeModal } from './CreateChallengeModal';
import type { DailyChallenge, ChallengeDifficulty, ChallengeCategory } from '@/types/challenges';

// Mock data for visual implementation - includes today's and future challenges
const mockChallenges: DailyChallenge[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Fer 30 minuts d\'exercici',
    description: 'Rutina matinal d\'exercici cardiovascular',
    challenge_date: '2024-12-08',
    created_at: '2024-12-07T10:00:00Z',
    is_completed: false,
    difficulty: 'medium',
    category: 'health',
    color: 'hsl(var(--success))',
    icon: 'Heart'
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Llegir 20 pàgines',
    description: 'Continuar amb el llibre de desenvolupament personal',
    challenge_date: '2024-12-08',
    created_at: '2024-12-07T10:00:00Z',
    is_completed: false,
    difficulty: 'easy',
    category: 'learning',
    color: 'hsl(var(--primary))',
    icon: 'BookOpen'
  },
  {
    id: '3',
    user_id: 'user1',
    title: 'Meditar 15 minuts',
    description: 'Sessió de mindfulness al matí',
    challenge_date: '2024-12-09',
    created_at: '2024-12-07T10:00:00Z',
    is_completed: false,
    difficulty: 'easy',
    category: 'personal',
    color: 'hsl(var(--primary))',
    icon: 'User'
  },
  {
    id: '4',
    user_id: 'user1',
    title: 'Completar projecte creatiu',
    description: 'Finalitzar el disseny del logotip',
    challenge_date: '2024-12-10',
    created_at: '2024-12-07T10:00:00Z',
    is_completed: false,
    difficulty: 'hard',
    category: 'creativity',
    color: 'hsl(var(--warning))',
    icon: 'Palette'
  }
];

const getCategoryIcon = (category: ChallengeCategory) => {
  const icons = {
    personal: User,
    work: Briefcase,
    health: Heart,
    learning: BookOpen,
    creativity: Palette
  };
  return icons[category];
};

const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
  const colors = {
    easy: 'hsl(var(--success))',
    medium: 'hsl(var(--warning))',
    hard: 'hsl(var(--destructive))'
  };
  return colors[difficulty];
};

const getDifficultyLabel = (difficulty: ChallengeDifficulty) => {
  const labels = {
    easy: 'Fàcil',
    medium: 'Mitjà',
    hard: 'Difícil'
  };
  return labels[difficulty];
};

export const DailyChallengesCard = () => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>(mockChallenges);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleChallengeComplete = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, is_completed: !challenge.is_completed, completed_at: challenge.is_completed ? undefined : new Date().toISOString() }
        : challenge
    ));
  };

  // Get today's date in same format as challenges
  const today = '2024-12-08'; // In real implementation, use format(new Date(), 'yyyy-MM-dd')
  
  // Separate today's and future challenges
  const todayChallenges = challenges.filter(c => c.challenge_date === today);
  const futureChallenges = challenges.filter(c => c.challenge_date > today).slice(0, 3);
  
  const completedToday = todayChallenges.filter(c => c.is_completed).length;
  const totalToday = todayChallenges.length;

  return (
    <>
      <Card className="bg-gradient-to-br from-card via-card to-card/80 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold">Reptes Diaris</span>
            </div>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              {completedToday}/{totalToday} avui
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Today's Challenges Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <h3 className="text-sm font-medium text-foreground">Reptes d'Avui</h3>
            </div>
            
            {todayChallenges.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-secondary/20 rounded-xl">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tens reptes per avui</p>
                <p className="text-xs mt-1">Crea el teu primer repte!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayChallenges.map((challenge) => {
                  const CategoryIcon = getCategoryIcon(challenge.category);
                  return (
                    <div 
                      key={challenge.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        challenge.is_completed 
                          ? 'bg-success/5 opacity-75' 
                          : 'bg-secondary/20 hover:bg-secondary/30'
                      }`}
                    >
                      <Checkbox
                        checked={challenge.is_completed}
                        onCheckedChange={() => handleChallengeComplete(challenge.id)}
                        className="h-5 w-5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className={`font-medium text-sm ${challenge.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                            {challenge.title}
                          </h4>
                        </div>
                        {challenge.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {challenge.description}
                          </p>
                        )}
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-transparent"
                        style={{ color: getDifficultyColor(challenge.difficulty) }}
                      >
                        {getDifficultyLabel(challenge.difficulty)}
                      </Badge>
                      
                      {challenge.is_completed && (
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-success animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Future Challenges Section */}
          {futureChallenges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Programats</h3>
              </div>
              
              <div className="space-y-2">
                {futureChallenges.map((challenge) => {
                  const CategoryIcon = getCategoryIcon(challenge.category);
                  const challengeDate = new Date(challenge.challenge_date);
                  const dateLabel = challengeDate.toLocaleDateString('ca-ES', { 
                    weekday: 'short', 
                    day: 'numeric',
                    month: 'short'
                  });
                  
                  return (
                    <div 
                      key={challenge.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 opacity-75"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground/70" />
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {challenge.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground/70 capitalize">
                            {dateLabel}
                          </p>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-transparent opacity-70"
                            style={{ color: getDifficultyColor(challenge.difficulty) }}
                          >
                            {getDifficultyLabel(challenge.difficulty)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-4 bg-secondary/50 hover:bg-secondary/70" 
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Afegir Nou Repte
          </Button>
        </CardContent>
      </Card>

      <CreateChallengeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onChallengeCreated={(newChallenge) => {
          setChallenges(prev => [...prev, newChallenge]);
          setShowCreateModal(false);
        }}
      />
    </>
  );
};