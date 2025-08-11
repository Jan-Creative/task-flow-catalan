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
import { usePropertyLabels } from "@/hooks/usePropertyLabels";

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
  const { getStatusOptions, getPriorityOptions } = usePropertyLabels();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pendent" | "en_proces" | "completat">("pendent");
  const [priority, setPriority] = useState<"alta" | "mitjana" | "baixa">("mitjana");
  const [dueDate, setDueDate] = useState<Date>();
  const [folderId, setFolderId] = useState<string>();

  // Temporary log to debug folders
  console.log("CreateTaskDialog - folders received:", folders);

  const statusOptions = getStatusOptions();
  const priorityOptions = getPriorityOptions();

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
      <DialogContent className="bg-[#2A2A2A] border-border/30 shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold">Nova Tasca</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title" className="text-white font-medium mb-2 block">Títol</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu el títol de la tasca..."
              className="bg-[#333333] border-border/30 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] text-white placeholder:text-[#B3B3B3]"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white font-medium mb-2 block">Descripció</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripció opcional..."
              className="bg-[#333333] border-border/30 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] resize-none text-white placeholder:text-[#B3B3B3]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-medium mb-2 block">Estat</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="bg-[#333333] border-border/30 focus:border-[#008080] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-border/30 z-50">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#333333]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white font-medium mb-2 block">Prioritat</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="bg-[#333333] border-border/30 focus:border-[#008080] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-border/30 z-50">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#333333]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white font-medium mb-2 block">Carpeta</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger className="bg-[#333333] border-border/30 focus:border-[#008080] text-white">
                <SelectValue placeholder={folders.length === 0 ? "No hi ha carpetes disponibles" : "Selecciona una carpeta..."} />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-border/30 z-50">
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id} className="text-white hover:bg-[#333333]">
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white font-medium mb-2 block">Data límit</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-[#333333] border-border/30 text-white hover:bg-[#404040]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: ca }) : "Selecciona una data..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
              className="flex-1 bg-[#404040] border-border/30 text-white hover:bg-[#4A4A4A]"
            >
              Cancel·lar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:scale-105 transition-bounce text-white font-medium"
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