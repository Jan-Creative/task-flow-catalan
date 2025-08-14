import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  isDestructive = true,
}: DeleteConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${isDestructive ? 'text-destructive' : 'text-warning'}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {itemName && (
              <p className="font-medium text-foreground">
                Ítem: <span className="text-primary">{itemName}</span>
              </p>
            )}
            {isDestructive && (
              <p className="text-sm text-destructive font-medium">
                Aquesta acció no es pot desfer.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={isDestructive 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
          >
            {isDestructive ? "Eliminar" : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};