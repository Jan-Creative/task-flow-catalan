import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useDadesApp } from './useDadesApp';
import { logger } from '@/lib/debugUtils';
import type { CreateSmartFolderData, SmartFolderRules, SmartFolderMatch } from '@/types/smartFolders';
import type { Task } from '@/types';

export const useSmartFolders = () => {
  const { folders, tasks, createFolder, refreshData } = useDadesApp();

  // Get all smart folders
  const smartFolders = useMemo(() => 
    folders.filter(folder => (folder as any).is_smart === true),
    [folders]
  );

  // Get regular folders
  const regularFolders = useMemo(() => 
    folders.filter(folder => (folder as any).is_smart !== true),
    [folders]
  );

  // Create smart folder
  const createSmartFolder = useCallback(async (data: CreateSmartFolderData) => {
    try {
      logger.debug('SmartFolders', 'Creating smart folder', data);
      
      // Validate keywords
      if (!data.smart_rules.keywords.length) {
        throw new Error('Cal afegir almenys una paraula clau');
      }

      const folderData = {
        name: data.name,
        color: data.color,
        icon: data.icon,
        is_smart: true,
        smart_rules: {
          ...data.smart_rules,
          keywords: data.smart_rules.keywords.filter(k => k.trim().length > 0)
        }
      };

      await createFolder(folderData);
      toast.success(`Carpeta intel·ligent "${data.name}" creada correctament`);
      
      // Force immediate refresh without timeout
      await refreshData();
      
    } catch (error) {
      logger.error('Failed to create smart folder', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la carpeta intel·ligent');
      throw error;
    }
  }, [createFolder, refreshData]);

  // Evaluate if a task matches smart folder rules
  const evaluateTaskMatch = useCallback((task: Task, rules: SmartFolderRules): SmartFolderMatch | null => {
    if (!rules.enabled || !rules.keywords.length) {
      return null;
    }

    const searchText = `${task.title || ''} ${task.description || ''}`;
    const normalizedSearchText = rules.case_sensitive ? searchText : searchText.toLowerCase();
    
    const matchedKeywords: string[] = [];
    
    for (const keyword of rules.keywords) {
      const normalizedKeyword = rules.case_sensitive ? keyword : keyword.toLowerCase();
      
      if (normalizedSearchText.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword);
      }
    }

    // Check match type
    if (rules.match_type === 'all') {
      // All keywords must match
      if (matchedKeywords.length === rules.keywords.length) {
        return {
          folder_id: '',
          folder_name: '',
          matched_keywords: matchedKeywords
        };
      }
    } else {
      // Any keyword matches (default)
      if (matchedKeywords.length > 0) {
        return {
          folder_id: '',
          folder_name: '',
          matched_keywords: matchedKeywords
        };
      }
    }

    return null;
  }, []);

  // Find matching smart folders for a task
  const findMatchingSmartFolders = useCallback((task: Task): SmartFolderMatch[] => {
    const matches: SmartFolderMatch[] = [];
    
    for (const folder of smartFolders) {
      const folderWithSmartRules = folder as any;
      const match = evaluateTaskMatch(task, folderWithSmartRules.smart_rules);
      if (match) {
        matches.push({
          ...match,
          folder_id: folder.id,
          folder_name: folder.name
        });
      }
    }

    return matches;
  }, [smartFolders, evaluateTaskMatch]);

  // Get smart folder statistics
  const smartFolderStats = useMemo(() => {
    const stats = {
      total: smartFolders.length,
      active: smartFolders.filter(f => (f as any).smart_rules?.enabled).length,
      tasksAutoAssigned: 0
    };

    // Count tasks that were auto-assigned to smart folders
    for (const task of tasks) {
      if (task.folder_id) {
        const folder = smartFolders.find(f => f.id === task.folder_id) as any;
        if (folder && folder?.smart_rules?.enabled) {
          const match = evaluateTaskMatch(task, folder.smart_rules);
          if (match) {
            stats.tasksAutoAssigned++;
          }
        }
      }
    }

    return stats;
  }, [smartFolders, tasks, evaluateTaskMatch]);

  return {
    smartFolders,
    regularFolders,
    createSmartFolder,
    evaluateTaskMatch,
    findMatchingSmartFolders,
    smartFolderStats
  };
};