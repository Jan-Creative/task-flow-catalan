import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTaskCleanup } from '@/hooks/useTaskCleanup';
import { Trash2, Download, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export const TaskResetSection = () => {
  const { 
    resetAllTasks, 
    resettingTasks, 
    deleteCompletedTasks, 
    deletingCompletedTasks,
    exportTaskData 
  } = useTaskCleanup();
  
  const [confirmStep, setConfirmStep] = useState(0);

  const handleResetWithHistory = () => {
    resetAllTasks({ includeHistory: true });
    setConfirmStep(0);
  };

  const handleResetKeepHistory = () => {
    resetAllTasks({ includeHistory: false });
    setConfirmStep(0);
  };

  const resetMultiStepDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={resettingTasks}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Total de l'App
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            ATENCIÓ: Reset Total
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>Aquesta acció eliminarà TOTES les tasques de l'aplicació.</strong>
            </p>
            <p>
              Què vols fer amb l'historial de tasques completades?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2">
          <div className="flex gap-2 w-full">
            <AlertDialogCancel className="flex-1">Cancel·lar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetKeepHistory}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Eliminar tasques (conservar historial)
            </AlertDialogAction>
          </div>
          <AlertDialogAction 
            onClick={handleResetWithHistory}
            className="w-full bg-destructive hover:bg-destructive/90"
          >
            Eliminar TOT (inclòs historial)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perill
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Important:</strong> Aquestes accions són irreversibles. 
            Recomana'm fer una còpia de seguretat abans de procedir.
          </p>
          
          <div className="space-y-3">
            {/* Export backup */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Còpia de Seguretat</h4>
                <p className="text-sm text-muted-foreground">
                  Descarrega totes les dades abans de fer canvis
                </p>
              </div>
              <Button
                variant="outline"
                onClick={exportTaskData}
              >
                <Download className="h-4 w-4 mr-2" />
                Descarregar
              </Button>
            </div>

            {/* Delete completed tasks */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Eliminar Tasques Completades</h4>
                <p className="text-sm text-muted-foreground">
                  Elimina només les tasques marcades com a completades
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    disabled={deletingCompletedTasks}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Completades
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar eliminació</AlertDialogTitle>
                    <AlertDialogDescription>
                      Aquesta acció eliminarà totes les tasques completades. 
                      Les tasques no completades es mantindran intactes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCompletedTasks()}>
                      Eliminar completades
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Total reset */}
            <div className="flex items-center justify-between pt-2 border-t border-destructive/20">
              <div>
                <h4 className="font-medium text-destructive">Reset Total</h4>
                <p className="text-sm text-muted-foreground">
                  Elimina totes les tasques i deixa l'app com nova
                </p>
              </div>
              {resetMultiStepDialog()}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          💡 <strong>Consell:</strong> Utilitza l'arxivat diari per mantenir l'app neta 
          sense perdre l'historial de les teves tasques completades.
        </div>
      </CardContent>
    </Card>
  );
};