/**
 * Dialogue de rappel d'export régulier des données HDS
 * Encourage les utilisateurs à faire des sauvegardes préventives
 */

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Download, Clock } from 'lucide-react';

const EXPORT_REMINDER_KEY = 'hds_last_export_reminder';
const REMINDER_INTERVAL_DAYS = 30;

interface ExportReminderDialogProps {
  onExport: () => void;
}

export const ExportReminderDialog: React.FC<ExportReminderDialogProps> = ({ onExport }) => {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Vérifier si un rappel est nécessaire
    const checkReminderNeeded = () => {
      const lastReminder = localStorage.getItem(EXPORT_REMINDER_KEY);
      
      if (!lastReminder) {
        // Première utilisation : définir la date et ne pas afficher
        localStorage.setItem(EXPORT_REMINDER_KEY, new Date().toISOString());
        return;
      }

      const lastReminderDate = new Date(lastReminder);
      const daysSinceLastReminder = Math.floor(
        (Date.now() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastReminder >= REMINDER_INTERVAL_DAYS) {
        setShowReminder(true);
      }
    };

    // Vérifier 5 secondes après le montage (laisser l'app se charger)
    const timer = setTimeout(checkReminderNeeded, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => {
    localStorage.setItem(EXPORT_REMINDER_KEY, new Date().toISOString());
    setShowReminder(false);
    onExport();
  };

  const handleRemindLater = () => {
    // Reporter de 7 jours
    const nextReminder = new Date();
    nextReminder.setDate(nextReminder.getDate() + 7);
    localStorage.setItem(EXPORT_REMINDER_KEY, nextReminder.toISOString());
    setShowReminder(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(EXPORT_REMINDER_KEY, new Date().toISOString());
    setShowReminder(false);
  };

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Rappel de sauvegarde
          </DialogTitle>
          <DialogDescription>
            Il est temps de sauvegarder vos données HDS
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-2">Important : Protection contre la perte de données</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Vos données HDS sont chiffrées localement</li>
                <li><strong>En cas d'oubli du mot de passe, elles sont définitivement perdues</strong></li>
                <li>Un export régulier vous protège contre cet oubli</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Recommandations :</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Exportez vos données tous les mois</li>
              <li>• Stockez le fichier d'export dans un lieu sûr</li>
              <li>• Notez votre mot de passe dans un gestionnaire sécurisé</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Ne plus me le rappeler
          </Button>
          <Button
            variant="outline"
            onClick={handleRemindLater}
            className="w-full sm:w-auto"
          >
            Me le rappeler dans 7 jours
          </Button>
          <Button
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter maintenant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
