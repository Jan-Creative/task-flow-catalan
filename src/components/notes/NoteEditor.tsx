import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Link, Code, Quote, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  noteId: string;
}

// Mock data - replace with real data later
const mockNote = {
  id: "1",
  title: "Reflexions del dia",
  content: `# Reflexions del dia

Avui ha estat un dia molt productiu. He completat la majoria de tasques pendents i he pogut avançar significativament en el projecte principal.

## Tasques completades
- [x] Revisar codi del component de notes
- [x] Implementar funcionalitat de cerca
- [ ] Documentar API endpoints
- [x] Reunió amb l'equip de disseny

## Reflexions
La integració del sistema de notes amb les tasques existents està funcionant millor del que esperava. La sincronització en temps real millora molt l'experiència d'usuari.

## Idees per demà
1. Implementar sistema d'etiquetes avançat
2. Afegir suport per adjunts
3. Millorar el rendiment de la cerca

> "La simplicitat és la màxima sofisticació" - Leonardo da Vinci

## Codi d'exemple
\`\`\`javascript
const saveNote = async (note) => {
  await supabase
    .from('notes')
    .upsert(note);
};
\`\`\``,
  tags: ["reflexio", "diari"],
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  isModified: false,
};

const formatToolbarButtons = [
  { id: "bold", icon: Bold, tooltip: "Negreta (Cmd+B)" },
  { id: "italic", icon: Italic, tooltip: "Cursiva (Cmd+I)" },
  { id: "separator1", type: "separator" },
  { id: "list", icon: List, tooltip: "Llista amb vinyetes" },
  { id: "ordered-list", icon: ListOrdered, tooltip: "Llista numerada" },
  { id: "separator2", type: "separator" },
  { id: "link", icon: Link, tooltip: "Enllaç" },
  { id: "code", icon: Code, tooltip: "Codi" },
  { id: "quote", icon: Quote, tooltip: "Cita" },
];

export const NoteEditor = ({ noteId }: NoteEditorProps) => {
  const [note, setNote] = useState(mockNote);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    setNote(prev => ({ ...prev, title: newTitle, isModified: true }));
  };

  const handleContentChange = (newContent: string) => {
    setNote(prev => ({ ...prev, content: newContent, isModified: true }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save - replace with real save logic later
    await new Promise(resolve => setTimeout(resolve, 500));
    setNote(prev => ({ ...prev, isModified: false, updatedAt: new Date() }));
    setIsSaving(false);
  };

  const handleFormatClick = (formatId: string) => {
    // Implement formatting logic later
    console.log("Format clicked:", formatId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Note Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Input
              value={note.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
              placeholder="Títol de la nota..."
            />
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {note.isModified && (
              <Badge variant="secondary" className="h-6">
                No desat
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={!note.isModified || isSaving}
              size="sm"
              className="bg-gradient-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Desant..." : "Desar"}
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Creat: {note.createdAt.toLocaleDateString("ca-ES")}</span>
          <span>Modificat: {note.updatedAt.toLocaleDateString("ca-ES")}</span>
          <span>{note.content.length} caràcters</span>
        </div>
      </div>

      {/* Format Toolbar */}
      <Card className="p-2 mb-4">
        <div className="flex items-center gap-1">
          {formatToolbarButtons.map((button) => {
            if (button.type === "separator") {
              return <Separator key={button.id} orientation="vertical" className="h-6 mx-1" />;
            }
            
            const Icon = button.icon!;
            return (
              <Button
                key={button.id}
                variant="ghost"
                size="sm"
                onClick={() => handleFormatClick(button.id)}
                className="h-8 w-8 p-0"
                title={button.tooltip}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Editor */}
      <div className="flex-1">
        <Textarea
          value={note.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="h-full resize-none border-none shadow-none focus-visible:ring-0 font-mono text-sm"
          placeholder="Comença a escriure la teva nota..."
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{note.content.split('\n').length} línies</span>
            <span>{note.content.split(' ').length} paraules</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Markdown suportat</span>
          </div>
        </div>
      </div>
    </div>
  );
};