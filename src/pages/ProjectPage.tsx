import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/?tab=carpetes");
  };

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

      {/* Main Content - Dashboard Placeholder */}
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-primary mx-auto flex items-center justify-center">
            <Briefcase className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard del Projecte</h2>
          <p className="text-muted-foreground">
            Aquí es desenvoluparà el dashboard intel·ligent del projecte amb mètriques, 
            timeline de tasques i eines especialitzades per completar els objectius.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span>En desenvolupament - Fase 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;