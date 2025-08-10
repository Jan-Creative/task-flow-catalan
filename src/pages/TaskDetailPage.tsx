import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tornar
          </Button>
          <h1 className="text-lg font-semibold">Detalls de la tasca</h1>
        </div>
      </div>

      {/* Main content area - currently blank as requested */}
      <div className="p-4">
        <p className="text-muted-foreground text-center py-12">
          Pàgina en construcció per a la tasca ID: {taskId}
        </p>
      </div>
    </div>
  );
};

export default TaskDetailPage;