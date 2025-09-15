import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Brain, Sparkles, Command, Folder } from 'lucide-react';
import {
  Dialog,
  DialogContent,
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

interface FolderData {
  name: string;
  color: string;
  icon?: string;
  is_smart?: boolean;
  smart_rules?: SmartFolderRules;
}

interface UnifiedFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FolderData, isSmartFolder: boolean) => Promise<void>;
}

const colorOptions = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#84cc16"
];

export const UnifiedFolderModal: React.FC<UnifiedFolderModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [isSmartFolder, setIsSmartFolder] = useState(false);
  const [formData, setFormData] = useState<FolderData>({
    name: '',
    color: '#6366f1',
    icon: 'Folder',
    smart_rules: {
      keywords: [],
      match_type: 'any',
      case_sensitive: false,
      enabled: true
    }
  });
  
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      name: '',
      color: '#6366f1',
      icon: 'Folder',
      smart_rules: {
        keywords: [],
        match_type: 'any',
        case_sensitive: false,
        enabled: true
      }
    });
    setCurrentKeyword('');
    setIsSmartFolder(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    if (isSmartFolder && (!formData.smart_rules?.keywords.length)) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        icon: isSmartFolder ? 'Brain' : 'Folder',
        is_smart: isSmartFolder
      };
      
      await onSubmit(submitData, isSmartFolder);
      handleClose();
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const addKeyword = () => {
    const keyword = currentKeyword.trim();
    if (keyword && !formData.smart_rules?.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        smart_rules: {
          ...prev.smart_rules!,
          keywords: [...prev.smart_rules!.keywords, keyword]
        }
      }));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      smart_rules: {
        ...prev.smart_rules!,
        keywords: prev.smart_rules!.keywords.filter(k => k !== keywordToRemove)
      }
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const toggleSmartFolder = (checked: boolean) => {
    setIsSmartFolder(checked);
    if (!checked) {
      // Reset smart folder data when disabled
      setFormData(prev => ({
        ...prev,
        smart_rules: {
          keywords: [],
          match_type: 'any',
          case_sensitive: false,
          enabled: true
        }
      }));
      setCurrentKeyword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-background/5 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/5 rounded-2xl shadow-lg/10"
        overlayClassName="bg-transparent"
        onKeyDown={handleKeyDown}
      >
        {/* Glass-style Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-2 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Nova Carpeta
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Crea una carpeta normal o intel·ligent per organitzar les teves tasques
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Shortcut hint */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <Command className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground/70">⌘ Return per crear</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-9 w-9 p-0 hover:bg-white/15 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form with Glass styling */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col" autoComplete="off">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            {/* Basic folder info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/90">
                  Nom de la carpeta
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Projectes, Emails, Reunions..."
                  className="bg-white/10 border-white/10 backdrop-blur-sm focus:bg-white/15 focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/90">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        "w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                        formData.color === color 
                          ? "border-white/50 scale-110 shadow-lg" 
                          : "border-white/20 hover:border-white/40"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Smart folder toggle */}
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground/90">
                      Carpeta Intel·ligent
                    </Label>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      Organitza automàticament les tasques segons paraules clau
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isSmartFolder}
                  onCheckedChange={toggleSmartFolder}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>

            {/* Smart folder configuration - animated */}
            <div className={cn(
              "transition-all duration-300 ease-out",
              isSmartFolder 
                ? "opacity-100 max-h-[1000px] translate-y-0" 
                : "opacity-0 max-h-0 -translate-y-4 overflow-hidden"
            )}>
              {isSmartFolder && (
                <div className="space-y-6 p-4 bg-blue-500/5 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  
                  {/* Keywords */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground/90">
                      Paraules Clau Intel·ligents
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentKeyword}
                        onChange={(e) => setCurrentKeyword(e.target.value)}
                        onKeyPress={handleKeywordKeyPress}
                        placeholder="Afegeix una paraula clau..."
                        className="bg-white/10 border-white/10 backdrop-blur-sm focus:bg-white/15 focus:border-blue-400/50"
                      />
                      <Button 
                        type="button" 
                        onClick={addKeyword}
                        variant="outline"
                        size="icon"
                        disabled={!currentKeyword.trim()}
                        className="bg-white/10 border-white/10 hover:bg-white/20"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {formData.smart_rules?.keywords.length! > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                        {formData.smart_rules!.keywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-200 border-blue-500/30">
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

                  {/* Smart folder options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/90">
                        Tipus de coincidència
                      </Label>
                      <Select
                        value={formData.smart_rules?.match_type}
                        onValueChange={(value: 'any' | 'all') => 
                          setFormData(prev => ({
                            ...prev,
                            smart_rules: { ...prev.smart_rules!, match_type: value }
                          }))
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/10 backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Qualsevol paraula clau</SelectItem>
                          <SelectItem value="all">Totes les paraules clau</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <Label className="text-sm font-medium text-foreground/90">
                            Sensible a majúscules
                          </Label>
                          <p className="text-xs text-muted-foreground/70">
                            Distingeix majúscules i minúscules
                          </p>
                        </div>
                        <Switch
                          checked={formData.smart_rules?.case_sensitive}
                          onCheckedChange={(checked) =>
                            setFormData(prev => ({
                              ...prev,
                              smart_rules: { ...prev.smart_rules!, case_sensitive: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <Label className="text-sm font-medium text-foreground/90">
                            Activar automatització
                          </Label>
                          <p className="text-xs text-muted-foreground/70">
                            Mou tasques automàticament
                          </p>
                        </div>
                        <Switch
                          checked={formData.smart_rules?.enabled}
                          onCheckedChange={(enabled) =>
                            setFormData(prev => ({
                              ...prev,
                              smart_rules: { ...prev.smart_rules!, enabled }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {formData.smart_rules?.keywords.length! > 0 && (
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">
                          Vista prèvia de regles
                        </span>
                      </div>
                      <p className="text-xs text-blue-200/80">
                        Les tasques que continguin{' '}
                        <strong>
                          {formData.smart_rules?.match_type === 'all' ? 'totes' : 'alguna de'}{' '}
                        </strong>
                        aquestes paraules es mouran automàticament a "{formData.name}":{' '}
                        <em>{formData.smart_rules?.keywords.join(', ')}</em>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Glass-style Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-white/2 backdrop-blur-sm">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="bg-white/10 border-white/10 hover:bg-white/20 backdrop-blur-sm"
            >
              Cancel·lar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || (isSmartFolder && !formData.smart_rules?.keywords.length)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 backdrop-blur-sm border border-white/10"
            >
              {loading ? 'Creant...' : `Crear ${isSmartFolder ? 'Carpeta Intel·ligent' : 'Carpeta'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};