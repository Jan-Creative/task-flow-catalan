import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarDays, User, Briefcase, Heart, BookOpen, Palette, Target } from "lucide-react";
import type { CreateChallengeData, DailyChallenge, ChallengeDifficulty, ChallengeCategory } from '@/types/challenges';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChallengeCreated: (challenge: DailyChallenge) => void;
}

const categoryOptions = [
  { value: 'personal' as ChallengeCategory, label: 'Personal', icon: User, color: 'hsl(var(--primary))' },
  { value: 'work' as ChallengeCategory, label: 'Treball', icon: Briefcase, color: 'hsl(var(--chart-1))' },
  { value: 'health' as ChallengeCategory, label: 'Salut', icon: Heart, color: 'hsl(var(--success))' },
  { value: 'learning' as ChallengeCategory, label: 'Aprenentatge', icon: BookOpen, color: 'hsl(var(--chart-2))' },
  { value: 'creativity' as ChallengeCategory, label: 'Creativitat', icon: Palette, color: 'hsl(var(--chart-3))' }
];

const difficultyOptions = [
  { value: 'easy' as ChallengeDifficulty, label: 'Fàcil', color: 'hsl(var(--success))' },
  { value: 'medium' as ChallengeDifficulty, label: 'Mitjà', color: 'hsl(var(--warning))' },
  { value: 'hard' as ChallengeDifficulty, label: 'Difícil', color: 'hsl(var(--destructive))' }
];

export const CreateChallengeModal = ({ open, onOpenChange, onChallengeCreated }: CreateChallengeModalProps) => {
  const [formData, setFormData] = useState<CreateChallengeData>({
    title: '',
    description: '',
    challenge_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow by default
    difficulty: 'medium',
    category: 'personal',
    color: 'hsl(var(--primary))'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);
    
    const newChallenge: DailyChallenge = {
      id: Date.now().toString(), // Mock ID for visual implementation
      user_id: 'mock-user',
      title: formData.title,
      description: formData.description,
      challenge_date: formData.challenge_date,
      created_at: new Date().toISOString(),
      is_completed: false,
      difficulty: formData.difficulty,
      category: formData.category,
      color: selectedCategory?.color || formData.color,
      icon: selectedCategory?.icon.name
    };

    onChallengeCreated(newChallenge);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      challenge_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      difficulty: 'medium',
      category: 'personal',
      color: 'hsl(var(--primary))'
    });
  };

  const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);
  const selectedDifficulty = difficultyOptions.find(diff => diff.value === formData.difficulty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            Crear Nou Repte
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview Card */}
          <Card className="p-4 bg-card/30 border-border/30">
            <div className="flex items-center gap-3">
              {selectedCategory && <selectedCategory.icon className="h-5 w-5" style={{ color: selectedCategory.color }} />}
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {formData.title || 'Títol del repte...'}
                </h4>
                {formData.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description}
                  </p>
                )}
              </div>
              <Badge variant="outline" style={{ borderColor: selectedDifficulty?.color, color: selectedDifficulty?.color }}>
                {selectedDifficulty?.label}
              </Badge>
            </div>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Títol del repte *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Fer 30 minuts d'exercici"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripció (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalls adicionals sobre el repte..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data del repte</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.challenge_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenge_date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificultat</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value: ChallengeDifficulty) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: option.color }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Categoria</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {categoryOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={formData.category === option.value ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-1"
                    onClick={() => setFormData(prev => ({ ...prev, category: option.value, color: option.color }))}
                  >
                    <option.icon className="h-4 w-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel·lar
            </Button>
            <Button type="submit" disabled={!formData.title.trim()} className="flex-1">
              Crear Repte
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};