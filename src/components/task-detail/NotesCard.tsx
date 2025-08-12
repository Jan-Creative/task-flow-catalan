import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import { useTaskNotes } from "@/hooks/useTaskNotes";

interface NotesCardProps {
  taskId: string;
}

export const NotesCard = ({ taskId }: NotesCardProps) => {
  const {
    notes,
    loading,
    isSaving,
    isModified,
    lastSaved,
    updateNotes,
    forceSave
  } = useTaskNotes(taskId);

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Notes
          </CardTitle>
          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={forceSave}
              disabled={isSaving || !isModified}
              className="gap-1 h-7 text-xs"
            >
              <Save className="h-3 w-3" />
              {isSaving ? 'Guardant...' : 'Guardar'}
            </Button>
          )}
        </div>
        {lastSaved && (
          <p className="text-xs text-muted-foreground">
            Última actualització: {lastSaved.toLocaleTimeString('ca-ES')}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <Textarea
          placeholder="Escriu les teves notes sobre aquesta tasca..."
          value={notes}
          onChange={(e) => updateNotes(e.target.value)}
          className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent text-sm leading-relaxed"
          disabled={loading}
        />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2">
          <span>{notes.length} caràcters</span>
          {isModified && (
            <span className="text-yellow-600 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse" />
              Canvis no guardats
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};