export interface SmartFolderRules {
  keywords: string[];
  match_type: 'any' | 'all';
  case_sensitive: boolean;
  enabled: boolean;
}

export interface SmartFolder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  is_smart: boolean;
  smart_rules: SmartFolderRules;
  user_id: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSmartFolderData {
  name: string;
  color: string;
  icon?: string;
  smart_rules: SmartFolderRules;
}

export interface SmartFolderMatch {
  folder_id: string;
  folder_name: string;
  matched_keywords: string[];
}