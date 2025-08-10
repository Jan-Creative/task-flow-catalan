import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    status: "pendent" | "en_proces" | "completat";
    priority: "alta" | "mitjana" | "baixa";
    due_date?: string;
    folder_id?: string;
  }) => void;
  folders: Array<{ id: string; name: string; }>;
}

const CreateTaskDialog = ({ open, onClose, onSubmit, folders }: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pendent" | "en_proces" | "completat">("pendent");
  const [priority, setPriority] = useState<"alta" | "mitjana" | "baixa">("mitjana");
  const [dueDate, setDueDate] = useState<Date>();
  const [folderId, setFolderId] = useState<string>();

  // Temporary log to debug folders
  console.log("CreateTaskDialog - folders received:", folders);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      folder_id: folderId,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setStatus("pendent");
    setPriority("mitjana");
    setDueDate(undefined);
    setFolderId(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-glass border-border/50 shadow-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Tasca</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-foreground">Títol</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu el títol de la tasca..."
              className="bg-input/80 border-border/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Descripció</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripció opcional..."
              className="bg-input/80 border-border/50 focus:border-primary resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Estat</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="bg-input/80 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendent">Pendent</SelectItem>
                  <SelectItem value="en_proces">En procés</SelectItem>
                  <SelectItem value="completat">Completat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-foreground">Prioritat</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="bg-input/80 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="mitjana">Mitjana</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-foreground">Carpeta</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger className="bg-input/80 border-border/50">
                <SelectValue placeholder="Selecciona una carpeta..." />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-glass border-border/50 z-50">
                {folders.length === 0 ? (
                  <SelectItem value="" disabled>
                    No hi ha carpetes disponibles
                  </SelectItem>
                ) : (
                  folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Data límit</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-input/80 border-border/50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: ca }) : "Selecciona una data..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-glass">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-secondary/50 border-border/50"
            >
              Cancel·lar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:scale-105 transition-bounce"
              disabled={!title.trim()}
            >
              Crear Tasca
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;