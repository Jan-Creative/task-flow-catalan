import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import ProjectDashboard from "@/components/dashboard/ProjectDashboard";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isTemp = useMemo(() => (projectId?.startsWith("temp-") ?? false), [projectId]);
  const [showCreateProject, setShowCreateProject] = useState<boolean>(isTemp);

  const handleBack = () => {
    navigate("/?tab=carpetes");
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

  return (
    <div className="min-h-screen bg-background">
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
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Nou Projecte</h1>
                <p className="text-sm text-muted-foreground">ID: {projectId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Dashboard */}
      {projectId && (
        <ProjectDashboard 
          projectId={projectId}
          onEditTask={handleEditTask}
          onNavigateToTasks={handleNavigateToTasks}
        />
      )}

      {/* Create project modal for temp routes */}
      <CreateProjectModal
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
    </div>
  );
};

export default ProjectPage;