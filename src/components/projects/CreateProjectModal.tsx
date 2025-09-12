import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toastUtils";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onOpenChange, onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [submitting, setSubmitting] = useState(false);

  const colorOptions = [
    "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
    "#f59e0b", "#ef4444", "#ec4899", "#84cc16"
  ];

  const resetForm = () => {
    setName("");
    setDescription("");
    setObjective("");
    setColor("#6366f1");
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error("Inicia sessió", { description: "Has d'iniciar sessió per crear projectes" });
      return;
    }
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          objective: objective.trim() || null,
          color,
          icon: "Briefcase",
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Projecte creat", { description: "El projecte s'ha creat correctament" });
      const newId = data?.id as string;
      onOpenChange(false);
      resetForm();
      onCreated?.(newId);
    } catch (err: any) {
      console.error("Error creating project:", err);
      toast.error("No s'ha pogut crear el projecte", { description: err?.message || "Intenta-ho de nou" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="bg-card/95 backdrop-blur-glass border-border/50 shadow-elevated sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nou Projecte</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Nom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom del projecte"
              className="bg-input/80 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Descripció (opcional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripció breu"
              className="bg-input/80 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Objectiu (opcional)</Label>
            <Input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Quin és l'objectiu principal?"
              className="bg-input/80 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-border hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Selecciona color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-secondary/50 border-border/50"
              disabled={submitting}
            >
              Cancel·lar
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-primary hover:scale-105 transition-bounce"
              disabled={!name.trim() || submitting}
            >
              {submitting ? "Creant..." : "Crear Projecte"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
