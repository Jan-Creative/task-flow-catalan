import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import { memo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";

interface NotesCardProps {
  taskId?: string; // Optional since we can get it from context
}

export const NotesCard = memo(({ taskId: propTaskId }: NotesCardProps = {}) => {
  // Use context data as priority
  const contextData = useTaskContext();
  const {
    notes,
    notesLoading: loading,
    isSaving,
    isModified,
    lastSaved,
    updateNotes,
    forceSave
  } = contextData || {};
  
  // For backwards compatibility, if no context data is available
  const finalData = contextData || {
    notes: '',
    loading: false,
    isSaving: false,
    isModified: false,
    lastSaved: null,
    updateNotes: () => {},
    forceSave: () => {}
  };

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Notes
          </CardTitle>
          {finalData.isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={finalData.forceSave}
              disabled={finalData.isSaving || !finalData.isModified}
              className="gap-1 h-7 text-xs"
            >
              <Save className="h-3 w-3" />
              {finalData.isSaving ? 'Guardant...' : 'Guardar'}
            </Button>
          )}
        </div>
        {finalData.lastSaved && (
          <p className="text-xs text-muted-foreground">
            Última actualització: {finalData.lastSaved.toLocaleTimeString('ca-ES')}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0">
        <div className="flex-1 flex flex-col min-h-0">
          <Textarea
            placeholder="Escriu les teves notes sobre aquesta tasca..."
            value={finalData.notes}
            onChange={(e) => finalData.updateNotes(e.target.value)}
            className="flex-1 resize-none border border-border/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 p-3 bg-background/50 text-sm leading-relaxed rounded-lg"
            disabled={finalData.loading}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-2 mx-0">
          <span>{finalData.notes.length} caràcters</span>
          {finalData.isModified && (
            <span className="text-yellow-600 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse" />
              Canvis no guardats
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});