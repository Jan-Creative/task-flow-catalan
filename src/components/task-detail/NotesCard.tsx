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
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Notes
          </CardTitle>
          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={forceSave}
              disabled={isSaving || !isModified}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
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
      <CardContent>
        <Textarea
          placeholder="Escriu les teves notes sobre aquesta tasca..."
          value={notes}
          onChange={(e) => updateNotes(e.target.value)}
          className="min-h-[150px] resize-none"
          disabled={loading}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{notes.length} caràcters</span>
          {isModified && (
            <span className="text-yellow-600">• Canvis no guardats</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};