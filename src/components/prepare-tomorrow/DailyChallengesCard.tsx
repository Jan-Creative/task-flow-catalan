import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Zap, User, Briefcase, Heart, BookOpen, Palette } from "lucide-react";
import { CreateChallengeModal } from './CreateChallengeModal';
import type { DailyChallenge, ChallengeDifficulty, ChallengeCategory } from '@/types/challenges';

// Mock data for visual implementation
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

  const completedCount = challenges.filter(c => c.is_completed).length;
  const totalCount = challenges.length;

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold">Reptes d'Avui</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tens reptes per avui</p>
              <p className="text-xs mt-1">Crea el teu primer repte!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const CategoryIcon = getCategoryIcon(challenge.category);
                return (
                  <div 
                    key={challenge.id} 
                     className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                       challenge.is_completed 
                         ? 'bg-success/5 border-success/20 opacity-75' 
                         : 'bg-card/30 border-border/30 hover:bg-card/50'
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
                      className="text-xs"
                      style={{ borderColor: getDifficultyColor(challenge.difficulty), color: getDifficultyColor(challenge.difficulty) }}
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
          
          <Button 
            variant="outline" 
            className="w-full mt-4" 
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