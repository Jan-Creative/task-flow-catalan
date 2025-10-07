import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import ProjectDashboard from "@/components/dashboard/ProjectDashboard";
import { CreateProjectModalLazy, CreateTaskModalLazy, LazyModal } from '@/lib/lazyLoading';
import { ProjectNavigationProvider } from "@/contexts/ProjectNavigationContext";
import ProjectSidebar from "@/components/navigation/ProjectSidebar";
import ProjectFloatingRestoreButton from "@/components/navigation/ProjectFloatingRestoreButton";
import { useProject } from "@/hooks/useProject";
import { cn } from "@/lib/utils";
const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isTemp = useMemo(() => (projectId?.startsWith("temp-") ?? false), [projectId]);
  const [showCreateProject, setShowCreateProject] = useState<boolean>(isTemp);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const { project } = useProject(projectId || "");

  const handleBack = () => {
    navigate("/?tab=carpetes");
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
  };

  const handleEditTask = (task: any) => {
    // TODO: Implement task editing for projects
    console.log('Edit task:', task);
  };

  const handleNavigateToTasks = () => {
    // TODO: Navigate to project tasks view
    console.log('Navigate to project tasks');
  };

  if (!projectId) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">ID del projecte no vàlid</p>
      </div>
    );
  }

  const projectName = project?.name || "Nou Projecte";
  const projectIcon = project?.icon || "💼";

  return (
    <ProjectNavigationProvider projectId={projectId}>
      <div className="min-h-screen bg-background">
        {/* Project Sidebar */}
        <ProjectSidebar
          projectId={projectId}
          projectName={projectName}
          projectIcon={projectIcon}
          activePage={activePage}
          onPageChange={setActivePage}
          onCreateTask={handleCreateTask}
        />

        {/* Floating Restore Button */}
        <ProjectFloatingRestoreButton />

        {/* Main Content with sidebar margin */}
        <div className={cn(
          "transition-all duration-300 ease-out",
          "ml-0 md:ml-64" // Always show with sidebar margin on md+ screens
        )}>
          {/* Header */}
          <div className="border-b border-border/50 bg-card/50 backdrop-blur-glass">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Carpetes
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <span className="text-xl">{projectIcon}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{projectName}</h1>
                    <p className="text-sm text-muted-foreground">ID: {projectId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Dashboard */}
          {projectId && activePage === "dashboard" && (
            <ProjectDashboard 
              projectId={projectId}
              onEditTask={handleEditTask}
              onNavigateToTasks={handleNavigateToTasks}
            />
          )}
        </div>

        {/* Modals */}
        <LazyModal>
          <CreateProjectModalLazy
            open={showCreateProject}
            onOpenChange={(open) => {
              setShowCreateProject(open);
              if (!open && isTemp) {
                navigate("/?tab=carpetes");
              }
            }}
            onCreated={(id) => {
              setShowCreateProject(false);
              navigate(`/project/${id}`);
            }}
          />
        </LazyModal>

        {showCreateTaskModal && (
          <LazyModal>
            <CreateTaskModalLazy
              open={showCreateTaskModal}
              onClose={() => setShowCreateTaskModal(false)}
              onSubmit={(taskData) => {
                console.log("Creating project task:", taskData);
                setShowCreateTaskModal(false);
              }}
              folders={[{ id: projectId, name: `Projecte: ${projectName}` }]}
            />
          </LazyModal>
        )}
      </div>
    </ProjectNavigationProvider>
  );
};

export default ProjectPage;