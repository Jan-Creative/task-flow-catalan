import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";

interface NotesCardProps {
  taskId: string;
}

export const NotesCard = ({ taskId }: NotesCardProps) => {
  const [notes, setNotes] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Simulated auto-save functionality
  useEffect(() => {
    if (isModified) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [notes, isModified]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setIsModified(true);
  };

  const handleSave = async () => {
    if (!isModified) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsModified(false);
    setIsSaving(false);
    setLastSaved(new Date());
  };

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
              onClick={handleSave}
              disabled={isSaving}
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
          onChange={(e) => handleNotesChange(e.target.value)}
          className="min-h-[150px] resize-none"
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