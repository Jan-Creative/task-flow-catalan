import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdaptiveNavigation from "@/components/navigation/AdaptiveNavigation";
import AdaptiveLayout from "@/components/layout/AdaptiveLayout";
import DeviceIndicator from "@/components/DeviceIndicator";
import { LazyPage, TodayPageLazy, FoldersPageLazy, SettingsPageLazy, NotificationsPageLazy, CreateTaskModalLazy } from "@/lib/lazyLoading";
import { SimpleTaskForm } from "@/components/SimpleTaskForm";
import { useSimpleDeviceDetection } from "@/hooks/useSimpleDeviceDetection";
import CalendarPage from "@/pages/CalendarPage";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "@/pages/AuthPage";
import PrepareTomorrowPage from "@/pages/PrepareTomorrowPage";
import NotesPage from "@/pages/NotesPage";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { usePerformanceMonitor, useCacheOptimization, useMemoryCleanup } from "@/hooks/usePerformanceOptimization";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";
import { KeepAlivePages, TabPage } from "@/components/ui/keep-alive-pages";
import { useDeviceType, usePhoneDetection } from "@/hooks/device";
import { useIOSDetection } from "@/hooks/useIOSDetection";
import { DeviceDebugPanel } from "@/components/DeviceDebugPanel";
import { KeyboardAdaptiveForm } from '@/components/KeyboardAdaptiveForm';

const Index = () => {
  // FASE 1: Mode ?noauth=1 - Bypass complet de useAuth/Supabase
  const noAuthMode = new URLSearchParams(window.location.search).get('noauth') === '1';
  
  if (noAuthMode) {
    console.log('🔧 NO AUTH MODE activat - bypassing useAuth/Supabase');
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: 'bold',
        padding: '40px',
        textAlign: 'center',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>✅ INDEX PAGE WORKS (NO AUTH)</div>
        <div style={{ fontSize: '16px', fontWeight: 'normal', maxWidth: '600px' }}>
          Si veus això, el problema ÉS useAuth/Supabase
          <br/><br/>
          El component Index es renderitza correctament quan no fem servir Supabase.
          Això confirma que el bloqueig està relacionat amb l'autenticació.
        </div>
        <button 
          onClick={() => window.location.href = '/?mockauth=1'}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#f5576c',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Provar Mock Auth Mode
        </button>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Provar Mode Normal
        </button>
      </div>
    );
  }
  
  const { user, loading, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "inici";
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarState, setSidebarState] = useState<'expanded' | 'mini' | 'hidden'>(() => {
    const stored = localStorage.getItem('mac-sidebar-state');
    if (stored && ['expanded', 'mini', 'hidden'].includes(stored)) {
      return stored as 'expanded' | 'mini' | 'hidden';
    }
    // Fallback to legacy
    const legacyStored = localStorage.getItem('mac-sidebar-collapsed');
    return legacyStored ? (JSON.parse(legacyStored) ? 'mini' : 'expanded') : 'expanded';
  });

  // Convert sidebar state to legacy format for AdaptiveLayout compatibility
  const sidebarCollapsed = sidebarState === 'hidden' ? undefined : sidebarState === 'mini';

  const handleSidebarStateChange = (newState: 'expanded' | 'mini' | 'hidden') => {
    setSidebarState(newState);
    localStorage.setItem('mac-sidebar-state', newState);
    localStorage.setItem('mac-sidebar-collapsed', JSON.stringify(newState !== 'expanded'));
  };

  const toggleSidebarCollapse = () => {
    const newState = sidebarState === 'expanded' ? 'mini' : 'expanded';
    handleSidebarStateChange(newState);
  };

  const { folders } = useDadesApp();
  const { handleCreateTask, handleEditTask: handleEditTaskOp } = useTaskOperations();
  
  // Device detection - simplified
  const { isIPhone } = useSimpleDeviceDetection();
  
  // Simple Form state
  const [showSimpleForm, setShowSimpleForm] = useState(false);
  
  const handleSimpleTaskSubmit = async (title: string) => {
    try {
      console.log('🚀 Creant tasca desde formulari simple:', title);
      await handleCreateTask({ title });
      toast.success(`Tasca creada: ${title}`);
      setShowSimpleForm(false);
    } catch (error) {
      console.error('Error creating task from simple form:', error);
    }
  };
  
  // Performance optimizations - simplified to avoid conflicts
  const performanceMetrics = usePerformanceMonitor();
  const { preloadCriticalData } = useCacheOptimization();
  useMemoryCleanup();

  // Smart task creation handler - simplified with enhanced logging
  const handleCreateTaskClick = useCallback(() => {
    console.log('🔥 CREACIÓ DE TASCA ACTIVADA');
    console.log('🔍 Device detection:', { isIPhone, userAgent: navigator.userAgent });
    
    if (isIPhone) {
      console.log('📱 iPhone detectat - Obrint formulari simple');
      setShowCreateDialog(false); // Assegurar que el formulari complex està tancat
      setShowSimpleForm(true);
    } else {
      console.log('💻 Mac/iPad detectat - Obrint formulari complex');
      setShowSimpleForm(false); // Assegurar que el formulari simple està tancat
      setEditingTask(null);
      setShowCreateDialog(true);
    }
  }, [isIPhone]);

  // Legacy toggle function for manual testing
  const toggleCreateDialog = useCallback(() => {
    if (showCreateDialog) {
      setShowCreateDialog(false);
      setEditingTask(null);
    } else {
      setShowCreateDialog(true);
    }
  }, [showCreateDialog]);

  // Registrar drecera per crear tasca - device-aware (Cmd/Ctrl + N)
  useShortcut(
    'createTask',
    'Crear Tasca',
    ['meta', 'n'],
    handleCreateTaskClick,
    {
      description: 'Obrir formulari per crear nova tasca (intel·ligent segons dispositiu)',
      category: 'actions',
      enabled: !!user // Només si l'usuari està autenticat
    }
  );

  // Registrar drecera per formulari simple (Cmd/Ctrl + Shift + N)
  useShortcut(
    'simpleTask',
    'Formulari Simple',
    ['meta', 'shift', 'n'],
    () => setShowSimpleForm(true),
    {
      description: 'Obrir formulari simple optimitzat per iPhone',
      category: 'actions',
      enabled: !!user
    }
  );

  // ⚠️ FASE 1: DESACTIVAT TEMPORALMENT - Causava bucle infinit amb searchParams
  // useEffect(() => {
  //   const tab = searchParams.get("tab") || "inici";
  //   setActiveTab(tab);
  // }, [searchParams]);

  // Actualitzar URL quan canvia activeTab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "inici") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const handleTaskSubmit = async (taskData: any, customProperties?: Array<{propertyId: string; optionId: string}>) => {
    try {
      if (editingTask) {
        await handleEditTaskOp(editingTask.id, taskData, customProperties);
        setEditingTask(null);
      } else {
        await handleCreateTask(taskData, customProperties);
      }
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating/updating task with properties:", error);
      // Error is already handled by the hook with toast notification
      // Just ensure dialog stays open for retry
    }
  };

  const handleEditTaskClick = (task: any) => {
    setEditingTask(task);
    setShowCreateDialog(true);
  };

  // Keep-alive rendering with lazy loading - All pages stay mounted
  const renderKeepAlivePages = useCallback(() => (
    <div className="relative w-full">
      <TabPage tabId="inici" activeTab={activeTab}>
        <LazyPage pageName="Inici">
          <DashboardPage 
            onEditTask={handleEditTaskClick} 
            onNavigateToTasks={() => setActiveTab("avui")}
            onNavigateToCalendar={() => setActiveTab("calendar")}
            onNavigateToNotifications={() => setActiveTab("notificacions")}
          />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="avui" activeTab={activeTab}>
        <LazyPage pageName="Tasques">
          <TodayPageLazy 
            onEditTask={handleEditTaskClick} 
            onNavigateToSettings={() => setActiveTab("configuracio")} 
          />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="carpetes" activeTab={activeTab}>
        <LazyPage pageName="Carpetes">
          <FoldersPageLazy />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="calendar" activeTab={activeTab}>
        <LazyPage pageName="Calendari">
          <CalendarPage />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="notificacions" activeTab={activeTab}>
        <LazyPage pageName="Notificacions">
          <NotificationsPageLazy />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="preparar-dema" activeTab={activeTab}>
        <LazyPage pageName="Preparar demà">
          <PrepareTomorrowPage />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="notes" activeTab={activeTab}>
        <LazyPage pageName="Notes">
          <NotesPage />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="configuracio" activeTab={activeTab}>
        <LazyPage pageName="Configuració">
          <SettingsPageLazy />
        </LazyPage>
      </TabPage>
    </div>
  ), [activeTab, handleEditTaskClick]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregant...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show main app if authenticated
  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden relative">
      {/* Adaptive Navigation */}
      <AdaptiveNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreateTask={handleCreateTaskClick}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
        sidebarState={sidebarState}
        onSidebarStateChange={handleSidebarStateChange}
      />

      {/* Main Content with Adaptive Layout */}
      <AdaptiveLayout sidebarCollapsed={sidebarCollapsed}>
        <KeepAlivePages activeTab={activeTab}>
          {renderKeepAlivePages()}
        </KeepAlivePages>
      </AdaptiveLayout>

      {/* Device Indicator for testing */}
      <DeviceIndicator />
      
      {/* Enhanced Device Debug Panel with form testing */}
      <DeviceDebugPanel 
        onTestUltraSimple={() => setShowSimpleForm(true)}
        isUltraSimpleOpen={showSimpleForm}
      />

      {/* Formulari complex NOMÉS per ordinadors/iPads */}
      {!isIPhone && (
        <CreateTaskModalLazy
          open={showCreateDialog && !showSimpleForm}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskSubmit}
          folders={folders}
          editingTask={editingTask}
        />
      )}

      {/* Formulari adaptatiu al teclat per iPhone */}
      <KeyboardAdaptiveForm
        open={showSimpleForm}
        onClose={() => {
          setShowSimpleForm(false);
          setShowCreateDialog(false); // Assegurar que ambdós estan tancats
        }}
        onSubmit={handleSimpleTaskSubmit}
      />
    </div>
  );
};

export default Index;
