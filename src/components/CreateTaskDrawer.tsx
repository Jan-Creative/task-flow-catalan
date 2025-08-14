import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { useCreateTaskForm } from "@/hooks/tasks/useCreateTaskForm";
import type { Tasca } from "@/types";

interface CreateTaskDrawerProps {
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
  editingTask?: Tasca | null;
}

const CreateTaskDrawer = ({ open, onClose, onSubmit, folders, editingTask }: CreateTaskDrawerProps) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    folderId,
    setFolderId,
    statusOptions,
    priorityOptions,
    handleSubmit,
    isEditing,
    isValid,
  } = useCreateTaskForm({ editingTask, onSubmit, onClose });

  // Auto-focus al camp de títol quan s'obre el drawer
  useEffect(() => {
    if (open) {
      // Petit delay per assegurar que el DOM està completament carregat
      const timer = setTimeout(() => {
        const titleInput = document.getElementById('title');
        if (titleInput) {
          titleInput.focus();
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Gestionar tecla Escape per tancar el drawer
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="bg-[#2A2A2A] border-border/30 rounded-t-3xl max-h-[85vh] pb-8">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-white font-semibold text-xl">
            {isEditing ? "Editar Tasca" : "Nova Tasca"}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title" className="text-white font-medium mb-2 block">Títol</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escriu el títol de la tasca..."
                className="bg-[#333333] border-border/30 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] text-white placeholder:text-[#B3B3B3] h-12"
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
                  <SelectTrigger className="bg-[#333333] border-border/30 focus:border-[#008080] text-white h-12">
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
                  <SelectTrigger className="bg-[#333333] border-border/30 focus:border-[#008080] text-white h-12">
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
                <SelectTrigger className="bg-[#333333] border-border/30 focus:border-[#008080] text-white h-12">
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
                    className="w-full justify-start text-left font-normal bg-[#333333] border-border/30 text-white hover:bg-[#404040] h-12"
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

            <div className="flex gap-3 pt-6 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-[#404040] border-border/30 text-white hover:bg-[#4A4A4A] h-12"
              >
                Cancel·lar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:scale-105 transition-bounce text-white font-medium h-12"
                disabled={!isValid}
              >
                {isEditing ? "Actualitzar Tasca" : "Crear Tasca"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateTaskDrawer;