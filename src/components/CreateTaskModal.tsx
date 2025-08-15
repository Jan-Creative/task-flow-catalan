import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, MoreHorizontal, CalendarIcon } from "lucide-react";
import { PropertyBadge } from "@/components/ui/property-badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { useCreateTaskForm } from "@/hooks/tasks/useCreateTaskForm";
import { useProperties } from "@/hooks/useProperties";
import type { Tasca } from "@/types";
import { cn } from "@/lib/utils";

interface CreateTaskModalProps {
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

interface PropertyDropdownState {
  isOpen: boolean;
  selectedProperty: string | null;
}

const CreateTaskModal = ({ open, onClose, onSubmit, folders, editingTask }: CreateTaskModalProps) => {
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

  const { properties } = useProperties();
  
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [morePropsDropdown, setMorePropsDropdown] = useState<PropertyDropdownState>({
    isOpen: false,
    selectedProperty: null
  });

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const titleInput = document.getElementById('task-title');
        if (titleInput) {
          titleInput.focus();
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle Escape key
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

  const currentStatusOption = statusOptions.find(opt => opt.value === status);
  const currentPriorityOption = priorityOptions.find(opt => opt.value === priority);
  const currentFolder = folders.find(f => f.id === folderId);

  const handlePropertySelect = (propertyName: string) => {
    setMorePropsDropdown({
      isOpen: true,
      selectedProperty: propertyName
    });
  };

  const handleMorePropsBack = () => {
    setMorePropsDropdown({
      isOpen: true,
      selectedProperty: null
    });
  };

  const getMorePropsOptions = () => {
    const { selectedProperty } = morePropsDropdown;
    
    if (selectedProperty === 'Carpeta') {
      return folders.map(folder => ({
        value: folder.id,
        label: folder.name,
        color: '#6366f1',
        onSelect: () => {
          setFolderId(folder.id);
          setMorePropsDropdown({ isOpen: false, selectedProperty: null });
        }
      }));
    }
    
    if (selectedProperty === 'Descripció') {
      return [
        {
          value: 'description',
          label: 'Afegir descripció',
          color: '#64748b',
          onSelect: () => {
            // Focus description input (we'll add it in a future iteration)
            setMorePropsDropdown({ isOpen: false, selectedProperty: null });
          }
        }
      ];
    }

    // Default property list
    return [
      { name: 'Carpeta', icon: 'Folder', currentValue: currentFolder?.name },
      { name: 'Data límit', icon: 'Calendar', currentValue: dueDate ? format(dueDate, "dd/MM/yyyy") : null },
      { name: 'Descripció', icon: 'FileText', currentValue: description ? 'Afegida' : null },
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-md p-0 bg-black/80 backdrop-blur-md border border-white/10",
          "shadow-2xl rounded-2xl overflow-hidden"
        )}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Editar Tasca" : "Nova Tasca"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Title Input - Main focus */}
          <div>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu el títol de la tasca..."
              className={cn(
                "bg-white/5 border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/30",
                "text-white placeholder:text-white/40 h-12 text-base backdrop-blur-sm"
              )}
              required
            />
          </div>

          {/* Property Buttons Row */}
          <div className="flex gap-2">
            {/* Status Button */}
            <Popover open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white/5 border-white/20 hover:bg-white/10 text-white",
                    "backdrop-blur-sm h-8 px-3 text-xs"
                  )}
                >
                  {currentStatusOption && (
                    <PropertyBadge
                      propertyName="Estat"
                      optionValue={currentStatusOption.value}
                      optionLabel={currentStatusOption.label}
                      optionColor={currentStatusOption.color}
                      optionIcon={currentStatusOption.icon}
                      size="sm"
                      className="border-0 bg-transparent px-0"
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-black/90 backdrop-blur-md border-white/20" align="start">
                <div className="space-y-1">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatus(option.value as any);
                        setStatusDropdownOpen(false);
                      }}
                      className="w-full justify-start text-white hover:bg-white/10 h-8"
                    >
                      <PropertyBadge
                        propertyName="Estat"
                        optionValue={option.value}
                        optionLabel={option.label}
                        optionColor={option.color}
                        optionIcon={option.icon}
                        size="sm"
                        className="border-0 bg-transparent px-0"
                      />
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Priority Button */}
            <Popover open={priorityDropdownOpen} onOpenChange={setPriorityDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white/5 border-white/20 hover:bg-white/10 text-white",
                    "backdrop-blur-sm h-8 px-3 text-xs"
                  )}
                >
                  {currentPriorityOption && (
                    <PropertyBadge
                      propertyName="Prioritat"
                      optionValue={currentPriorityOption.value}
                      optionLabel={currentPriorityOption.label}
                      optionColor={currentPriorityOption.color}
                      optionIcon={currentPriorityOption.icon}
                      size="sm"
                      className="border-0 bg-transparent px-0"
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-black/90 backdrop-blur-md border-white/20" align="start">
                <div className="space-y-1">
                  {priorityOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPriority(option.value as any);
                        setPriorityDropdownOpen(false);
                      }}
                      className="w-full justify-start text-white hover:bg-white/10 h-8"
                    >
                      <PropertyBadge
                        propertyName="Prioritat"
                        optionValue={option.value}
                        optionLabel={option.label}
                        optionColor={option.color}
                        optionIcon={option.icon}
                        size="sm"
                        className="border-0 bg-transparent px-0"
                      />
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* More Properties Button */}
            <Popover 
              open={morePropsDropdown.isOpen} 
              onOpenChange={(open) => setMorePropsDropdown({ 
                isOpen: open, 
                selectedProperty: open ? morePropsDropdown.selectedProperty : null 
              })}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white/5 border-white/20 hover:bg-white/10 text-white",
                    "backdrop-blur-sm h-8 px-3 text-xs"
                  )}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-black/90 backdrop-blur-md border-white/20" align="start">
                {morePropsDropdown.selectedProperty ? (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMorePropsBack}
                      className="w-full justify-start text-white/60 hover:bg-white/10 h-7 text-xs"
                    >
                      ← Tornar
                    </Button>
                    {morePropsDropdown.selectedProperty === 'Data límit' ? (
                      <div className="p-2">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={(date) => {
                            setDueDate(date);
                            setMorePropsDropdown({ isOpen: false, selectedProperty: null });
                          }}
                          initialFocus
                          className="p-0 bg-transparent text-white"
                        />
                      </div>
                    ) : (
                      getMorePropsOptions().map((option: any) => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          size="sm"
                          onClick={option.onSelect}
                          className="w-full justify-start text-white hover:bg-white/10 h-8"
                        >
                          <span style={{ color: option.color }}>{option.label}</span>
                        </Button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {getMorePropsOptions().map((prop: any) => (
                      <Button
                        key={prop.name}
                        variant="ghost"
                        size="sm"
                        onClick={() => prop.name === 'Data límit' ? 
                          handlePropertySelect(prop.name) : 
                          handlePropertySelect(prop.name)
                        }
                        className="w-full justify-between text-white hover:bg-white/10 h-8 text-xs"
                      >
                        <span>{prop.name}</span>
                        {prop.currentValue && (
                          <span className="text-white/60 text-xs">{prop.currentValue}</span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={cn(
                "flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10",
                "backdrop-blur-sm h-10"
              )}
            >
              Cancel·lar
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 bg-gradient-primary hover:scale-105 transition-all duration-200",
                "text-white font-medium h-10 shadow-lg"
              )}
              disabled={!isValid}
            >
              {isEditing ? "Actualitzar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;