import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useNotificationContext } from "@/contexts/NotificationContextMigrated";

export const PurgeSubscriptionsButton = () => {
  const [isPurging, setIsPurging] = useState(false);
  const { purgeAllSubscriptions, refreshData } = useNotificationContext();

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      await purgeAllSubscriptions();
      await refreshData();
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
          disabled={isPurging}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isPurging ? "Eliminant..." : "Purgar tot"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Purgar totes les subscripcions</AlertDialogTitle>
          <AlertDialogDescription>
            Aquesta acció eliminarà <strong>totes</strong> les subscripcions de notificacions de tots els dispositius.
            <br /><br />
            Després hauràs de reactivar les notificacions en cada dispositiu on vulguis rebre-les.
            <br /><br />
            <strong>Això és recomanable per solucionar problemes amb múltiples subscripcions.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePurge}
            className="bg-red-600 hover:bg-red-700"
          >
            Sí, purgar tot
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};