import {
  // Task & Work
  CheckSquare, Square, Calendar, Clock, Timer, Zap, Target, Trophy, Bookmark,
  // Status & Priority  
  AlertCircle, AlertTriangle, Circle, CheckCircle, XCircle, Star, Flame, ArrowUp, ArrowDown,
  // Categories & Organization
  Folder, FolderOpen, Tag, Hash, Grid, List, Archive, Package, Inbox,
  // Communication & Social
  Mail, MessageSquare, Phone, Users, User, Heart, Share, Bell, AtSign,
  // Technology & Tools
  Laptop, Smartphone, Monitor, Wifi, Settings, Wrench, Code, Database, Cloud,
  // Finance & Business
  DollarSign, CreditCard, TrendingUp, BarChart, PieChart, Briefcase, Building, ShoppingCart,
  // Travel & Location
  MapPin, Globe, Car, Plane, Home, Coffee, Camera, Compass, Map,
  // Health & Lifestyle
  Activity, Heart as HeartIcon, Smile, Sun, Moon, Umbrella, Flower, Leaf,
  // Media & Entertainment
  Play, Pause, Music, Film, Image, Book, Headphones, Gamepad2, Tv,
  // General & Utility
  Plus, Minus, Edit, Trash2, Search, Filter, Download, Upload, Lock, Key
} from "lucide-react";

export interface IconDefinition {
  name: string;
  icon: React.ComponentType<any>;
  category: string;
  keywords: string[];
}

export const iconCategories = [
  { id: 'all', name: 'Totes', description: 'Totes les icones disponibles' },
  { id: 'task', name: 'Tasques', description: 'Icones relacionades amb tasques i treball' },
  { id: 'status', name: 'Estats', description: 'Icones per a estats i prioritats' },
  { id: 'organization', name: 'Organització', description: 'Carpetes, etiquetes i organització' },
  { id: 'communication', name: 'Comunicació', description: 'Missatges, trucades i social' },
  { id: 'technology', name: 'Tecnologia', description: 'Dispositius i eines tecnològiques' },
  { id: 'business', name: 'Negocis', description: 'Finances i negocis' },
  { id: 'lifestyle', name: 'Estil de vida', description: 'Viatges, salut i entreteniment' },
  { id: 'utility', name: 'Utilitats', description: 'Icones generals i d\'utilitat' }
] as const;

export const iconLibrary: IconDefinition[] = [
  // Task & Work
  { name: 'CheckSquare', icon: CheckSquare, category: 'task', keywords: ['completat', 'fet', 'tasca', 'check'] },
  { name: 'Square', icon: Square, category: 'task', keywords: ['pendent', 'per fer', 'tasca', 'box'] },
  { name: 'Calendar', icon: Calendar, category: 'task', keywords: ['data', 'calendari', 'planificació'] },
  { name: 'Clock', icon: Clock, category: 'task', keywords: ['temps', 'hora', 'deadline'] },
  { name: 'Timer', icon: Timer, category: 'task', keywords: ['temporitzador', 'pomodoro', 'temps'] },
  { name: 'Zap', icon: Zap, category: 'task', keywords: ['urgent', 'ràpid', 'energia'] },
  { name: 'Target', icon: Target, category: 'task', keywords: ['objectiu', 'meta', 'focus'] },
  { name: 'Trophy', icon: Trophy, category: 'task', keywords: ['èxit', 'premi', 'guanyar'] },
  { name: 'Bookmark', icon: Bookmark, category: 'task', keywords: ['marcar', 'important', 'favorit'] },

  // Status & Priority
  { name: 'AlertCircle', icon: AlertCircle, category: 'status', keywords: ['alerta', 'atenció', 'important'] },
  { name: 'AlertTriangle', icon: AlertTriangle, category: 'status', keywords: ['advertència', 'perill', 'urgent'] },
  { name: 'Circle', icon: Circle, category: 'status', keywords: ['neutral', 'normal', 'estàndard'] },
  { name: 'CheckCircle', icon: CheckCircle, category: 'status', keywords: ['completat', 'correcte', 'èxit'] },
  { name: 'XCircle', icon: XCircle, category: 'status', keywords: ['cancel·lat', 'error', 'incorrecte'] },
  { name: 'Star', icon: Star, category: 'status', keywords: ['important', 'favorit', 'destacat'] },
  { name: 'Flame', icon: Flame, category: 'status', keywords: ['urgent', 'calent', 'prioritat'] },
  { name: 'ArrowUp', icon: ArrowUp, category: 'status', keywords: ['alta', 'pujar', 'prioritat'] },
  { name: 'ArrowDown', icon: ArrowDown, category: 'status', keywords: ['baixa', 'baixar', 'menys'] },

  // Categories & Organization
  { name: 'Folder', icon: Folder, category: 'organization', keywords: ['carpeta', 'categoria', 'organitzar'] },
  { name: 'FolderOpen', icon: FolderOpen, category: 'organization', keywords: ['carpeta oberta', 'actiu'] },
  { name: 'Tag', icon: Tag, category: 'organization', keywords: ['etiqueta', 'classificar', 'marcar'] },
  { name: 'Hash', icon: Hash, category: 'organization', keywords: ['hashtag', 'número', 'referència'] },
  { name: 'Grid', icon: Grid, category: 'organization', keywords: ['graella', 'organitzar', 'vista'] },
  { name: 'List', icon: List, category: 'organization', keywords: ['llista', 'enumerar', 'ordenar'] },
  { name: 'Archive', icon: Archive, category: 'organization', keywords: ['arxiu', 'guardar', 'emmagatzemar'] },
  { name: 'Package', icon: Package, category: 'organization', keywords: ['paquet', 'caixa', 'projecte'] },
  { name: 'Inbox', icon: Inbox, category: 'organization', keywords: ['safata', 'entrants', 'rebuts'] },

  // Communication & Social
  { name: 'Mail', icon: Mail, category: 'communication', keywords: ['correu', 'email', 'missatge'] },
  { name: 'MessageSquare', icon: MessageSquare, category: 'communication', keywords: ['missatge', 'chat', 'conversa'] },
  { name: 'Phone', icon: Phone, category: 'communication', keywords: ['telèfon', 'trucada', 'contacte'] },
  { name: 'Users', icon: Users, category: 'communication', keywords: ['equip', 'grup', 'persones'] },
  { name: 'User', icon: User, category: 'communication', keywords: ['usuari', 'persona', 'perfil'] },
  { name: 'Heart', icon: Heart, category: 'communication', keywords: ['cor', 'gusta', 'favorit'] },
  { name: 'Share', icon: Share, category: 'communication', keywords: ['compartir', 'enviar', 'distribuir'] },
  { name: 'Bell', icon: Bell, category: 'communication', keywords: ['notificació', 'avís', 'campana'] },
  { name: 'AtSign', icon: AtSign, category: 'communication', keywords: ['menció', 'arroba', 'referència'] },

  // Technology & Tools
  { name: 'Laptop', icon: Laptop, category: 'technology', keywords: ['ordinador', 'portàtil', 'tecnologia'] },
  { name: 'Smartphone', icon: Smartphone, category: 'technology', keywords: ['mòbil', 'telèfon', 'app'] },
  { name: 'Monitor', icon: Monitor, category: 'technology', keywords: ['pantalla', 'ordinador', 'desktop'] },
  { name: 'Wifi', icon: Wifi, category: 'technology', keywords: ['internet', 'connexió', 'xarxa'] },
  { name: 'Settings', icon: Settings, category: 'technology', keywords: ['configuració', 'ajustos', 'opcions'] },
  { name: 'Wrench', icon: Wrench, category: 'technology', keywords: ['eina', 'reparar', 'ajustar'] },
  { name: 'Code', icon: Code, category: 'technology', keywords: ['codi', 'programació', 'desenvolupament'] },
  { name: 'Database', icon: Database, category: 'technology', keywords: ['base dades', 'emmagatzematge'] },
  { name: 'Cloud', icon: Cloud, category: 'technology', keywords: ['núvol', 'online', 'sync'] },

  // Finance & Business
  { name: 'DollarSign', icon: DollarSign, category: 'business', keywords: ['diner', 'cost', 'preu', 'finance'] },
  { name: 'CreditCard', icon: CreditCard, category: 'business', keywords: ['targeta', 'pagament', 'compra'] },
  { name: 'TrendingUp', icon: TrendingUp, category: 'business', keywords: ['creixement', 'millora', 'progressió'] },
  { name: 'BarChart', icon: BarChart, category: 'business', keywords: ['gràfic', 'estadístiques', 'dades'] },
  { name: 'PieChart', icon: PieChart, category: 'business', keywords: ['circular', 'percentatges', 'distribució'] },
  { name: 'Briefcase', icon: Briefcase, category: 'business', keywords: ['feina', 'treball', 'professional'] },
  { name: 'Building', icon: Building, category: 'business', keywords: ['edifici', 'oficina', 'empresa'] },
  { name: 'ShoppingCart', icon: ShoppingCart, category: 'business', keywords: ['compres', 'botiga', 'ecommerce'] },

  // Travel & Location  
  { name: 'MapPin', icon: MapPin, category: 'lifestyle', keywords: ['ubicació', 'lloc', 'mapa'] },
  { name: 'Globe', icon: Globe, category: 'lifestyle', keywords: ['món', 'global', 'internacional'] },
  { name: 'Car', icon: Car, category: 'lifestyle', keywords: ['cotxe', 'transport', 'viatge'] },
  { name: 'Plane', icon: Plane, category: 'lifestyle', keywords: ['avió', 'viatge', 'vacances'] },
  { name: 'Home', icon: Home, category: 'lifestyle', keywords: ['casa', 'llar', 'personal'] },
  { name: 'Coffee', icon: Coffee, category: 'lifestyle', keywords: ['cafè', 'descans', 'reunió'] },
  { name: 'Camera', icon: Camera, category: 'lifestyle', keywords: ['càmera', 'foto', 'recordar'] },
  { name: 'Compass', icon: Compass, category: 'lifestyle', keywords: ['direcció', 'navegar', 'orientar'] },
  { name: 'Map', icon: Map, category: 'lifestyle', keywords: ['mapa', 'ubicació', 'ruta'] },

  // Health & Lifestyle
  { name: 'Activity', icon: Activity, category: 'lifestyle', keywords: ['activitat', 'esport', 'salut'] },
  { name: 'HeartIcon', icon: HeartIcon, category: 'lifestyle', keywords: ['salut', 'benestar', 'cor'] },
  { name: 'Smile', icon: Smile, category: 'lifestyle', keywords: ['felicitat', 'positiu', 'ànim'] },
  { name: 'Sun', icon: Sun, category: 'lifestyle', keywords: ['sol', 'dia', 'energia'] },
  { name: 'Moon', icon: Moon, category: 'lifestyle', keywords: ['lluna', 'nit', 'descans'] },
  { name: 'Umbrella', icon: Umbrella, category: 'lifestyle', keywords: ['protecció', 'pluja', 'seguretat'] },
  { name: 'Flower', icon: Flower, category: 'lifestyle', keywords: ['flor', 'natura', 'bellesa'] },
  { name: 'Leaf', icon: Leaf, category: 'lifestyle', keywords: ['natura', 'ecologia', 'verd'] },

  // Media & Entertainment
  { name: 'Play', icon: Play, category: 'lifestyle', keywords: ['reproduir', 'començar', 'actiu'] },
  { name: 'Pause', icon: Pause, category: 'lifestyle', keywords: ['pausa', 'aturar', 'descans'] },
  { name: 'Music', icon: Music, category: 'lifestyle', keywords: ['música', 'àudio', 'entreteniment'] },
  { name: 'Film', icon: Film, category: 'lifestyle', keywords: ['pel·lícula', 'video', 'cinema'] },
  { name: 'Image', icon: Image, category: 'lifestyle', keywords: ['imatge', 'foto', 'visual'] },
  { name: 'Book', icon: Book, category: 'lifestyle', keywords: ['llibre', 'lectura', 'aprendre'] },
  { name: 'Headphones', icon: Headphones, category: 'lifestyle', keywords: ['auriculars', 'escoltar', 'àudio'] },
  { name: 'Gamepad2', icon: Gamepad2, category: 'lifestyle', keywords: ['joc', 'entreteniment', 'gaming'] },
  { name: 'Tv', icon: Tv, category: 'lifestyle', keywords: ['televisió', 'pantalla', 'entreteniment'] },

  // General & Utility
  { name: 'Plus', icon: Plus, category: 'utility', keywords: ['afegir', 'nou', 'crear'] },
  { name: 'Minus', icon: Minus, category: 'utility', keywords: ['restar', 'menys', 'eliminar'] },
  { name: 'Edit', icon: Edit, category: 'utility', keywords: ['editar', 'modificar', 'canviar'] },
  { name: 'Trash2', icon: Trash2, category: 'utility', keywords: ['esborrar', 'eliminar', 'paperera'] },
  { name: 'Search', icon: Search, category: 'utility', keywords: ['cercar', 'trobar', 'buscar'] },
  { name: 'Filter', icon: Filter, category: 'utility', keywords: ['filtrar', 'seleccionar', 'organitzar'] },
  { name: 'Download', icon: Download, category: 'utility', keywords: ['descarregar', 'baixar', 'guardar'] },
  { name: 'Upload', icon: Upload, category: 'utility', keywords: ['pujar', 'enviar', 'carregar'] },
  { name: 'Lock', icon: Lock, category: 'utility', keywords: ['bloquejar', 'seguretat', 'privat'] },
  { name: 'Key', icon: Key, category: 'utility', keywords: ['clau', 'accés', 'permís'] }
];

// Utility functions
export const getIconByName = (name: string): IconDefinition | undefined => {
  return iconLibrary.find(icon => icon.name === name);
};

export const getIconsByCategory = (categoryId: string): IconDefinition[] => {
  if (categoryId === 'all') return iconLibrary;
  return iconLibrary.filter(icon => icon.category === categoryId);
};

export const searchIcons = (query: string, categoryId?: string): IconDefinition[] => {
  const icons = categoryId ? getIconsByCategory(categoryId) : iconLibrary;
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return icons;
  
  return icons.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm) ||
    icon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
  );
};

// Default icon suggestions based on property names
export const getDefaultIconForProperty = (propertyName: string): string => {
  const name = propertyName.toLowerCase();
  
  if (name.includes('estat') || name.includes('status')) return 'CheckCircle';
  if (name.includes('prioritat') || name.includes('priority')) return 'Star';
  if (name.includes('categoria') || name.includes('category')) return 'Tag';
  if (name.includes('tipus') || name.includes('type')) return 'Grid';
  if (name.includes('assignat') || name.includes('assigned')) return 'User';
  if (name.includes('data') || name.includes('date')) return 'Calendar';
  if (name.includes('temps') || name.includes('time')) return 'Clock';
  if (name.includes('urgent') || name.includes('urgent')) return 'Zap';
  if (name.includes('important') || name.includes('important')) return 'Star';
  
  return 'Circle'; // Default fallback
};