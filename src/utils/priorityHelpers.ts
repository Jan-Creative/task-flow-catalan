import { Flag } from "lucide-react";
import { getIconByName } from "@/lib/iconLibrary";

/**
 * Helper per gestionar les icones de prioritat segons l'estratègia de banderes
 * Retorna sempre Flag per prioritats estàndard (baixa, mitjana, alta)
 * Permet icones personalitzades només per "urgent"
 */
export const getPriorityIconComponent = (priority: string, getPriorityIcon: (value: string) => string | undefined) => {
  // Per prioritats estàndard, sempre usar Flag
  if (['baixa', 'mitjana', 'alta'].includes(priority)) {
    return Flag;
  }
  
  // Per "urgent" o altres, permetre icones personalitzades
  const priorityIconName = getPriorityIcon(priority);
  if (priorityIconName) {
    const iconDef = getIconByName(priorityIconName);
    if (iconDef) {
      return iconDef.icon;
    }
  }
  
  // Fallback a Flag si no hi ha icona personalitzada
  return Flag;
};

/**
 * Determina si una prioritat pot tenir icona personalitzada
 */
export const canHaveCustomIcon = (priority: string): boolean => {
  return !['baixa', 'mitjana', 'alta'].includes(priority);
};