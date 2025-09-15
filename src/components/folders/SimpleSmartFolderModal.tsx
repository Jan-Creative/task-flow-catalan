import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Brain, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SmartFolderRules {
  keywords: string[];
  match_type: 'any' | 'all';
  case_sensitive: boolean;
  enabled: boolean;
}

interface CreateSmartFolderData {
  name: string;
  color: string;
  icon?: string;
  smart_rules: SmartFolderRules;
}

interface SimpleSmartFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSmartFolderData) => Promise<void>;
}

const colorOptions = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#84cc16"
];

export const SimpleSmartFolderModal: React.FC<SimpleSmartFolderModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateSmartFolderData>({
    name: '',
    color: '#6366f1',
    icon: 'Brain',
    smart_rules: {
      keywords: [],
      match_type: 'any',
      case_sensitive: false,
      enabled: true
    }
  });
  
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.smart_rules.keywords.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        color: '#6366f1',
        icon: 'Brain',
        smart_rules: {
          keywords: [],
          match_type: 'any',
          case_sensitive: false,
          enabled: true
        }
      });
      setCurrentKeyword('');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    const keyword = currentKeyword.trim();
    if (keyword && !formData.smart_rules.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        smart_rules: {
          ...prev.smart_rules,
          keywords: [...prev.smart_rules.keywords, keyword]
        }
      }));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      smart_rules: {
        ...prev.smart_rules,
        keywords: prev.smart_rules.keywords.filter(k => k !== keywordToRemove)
      }
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Crear Carpeta Intel·ligent
          </DialogTitle>
          <DialogDescription>
            Les carpetes intel·ligents organitzen automàticament les tasques segons paraules clau
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la carpeta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Emails, Reunions, Idees..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    formData.color === color 
                      ? "border-foreground scale-110" 
                      : "border-border hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Paraules Clau Intel·ligents</Label>
            <div className="flex gap-2">
              <Input
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Afegeix una paraula clau..."
              />
              <Button 
                type="button" 
                onClick={addKeyword}
                variant="outline"
                size="icon"
                disabled={!currentKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.smart_rules.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {formData.smart_rules.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeKeyword(keyword)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipus de coincidència</Label>
              <Select
                value={formData.smart_rules.match_type}
                onValueChange={(value: 'any' | 'all') => 
                  setFormData(prev => ({
                    ...prev,
                    smart_rules: { ...prev.smart_rules, match_type: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualsevol paraula clau</SelectItem>
                  <SelectItem value="all">Totes les paraules clau</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sensible a majúscules</Label>
                <p className="text-sm text-muted-foreground">
                  Distingeix entre majúscules i minúscules
                </p>
              </div>
              <Switch
                checked={formData.smart_rules.case_sensitive}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    smart_rules: { ...prev.smart_rules, case_sensitive: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activar automatització</Label>
                <p className="text-sm text-muted-foreground">
                  Mou tasques automàticament a aquesta carpeta
                </p>
              </div>
              <Switch
                checked={formData.smart_rules.enabled}
                onCheckedChange={(enabled) =>
                  setFormData(prev => ({
                    ...prev,
                    smart_rules: { ...prev.smart_rules, enabled }
                  }))
                }
              />
            </div>
          </div>

          {formData.smart_rules.keywords.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Vista prèvia de regles
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Les tasques que continguin{' '}
                <strong>
                  {formData.smart_rules.match_type === 'all' ? 'totes' : 'alguna de'}{' '}
                </strong>
                aquestes paraules es mouran automàticament a "{formData.name}":{' '}
                <em>{formData.smart_rules.keywords.join(', ')}</em>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel·lar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || formData.smart_rules.keywords.length === 0}
            >
              {loading ? 'Creant...' : 'Crear Carpeta Intel·ligent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};