import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Clock } from "lucide-react";
import { checkBackupReminder, exportBackup } from "@/services/backup-service";
import { toast } from "sonner";

/**
 * Bannière de rappel de sauvegarde
 *
 * S'affiche si l'utilisateur n'a pas effectué de sauvegarde depuis X jours
 */
export function BackupReminderBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [daysSinceBackup, setDaysSinceBackup] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si le rappel est déjà masqué pour cette session
    const dismissedThisSession = sessionStorage.getItem("backup_reminder_dismissed");
    if (dismissedThisSession === "true") {
      setIsDismissed(true);
      return;
    }

    const { shouldRemind, daysSinceLastBackup } = checkBackupReminder();
    setDaysSinceBackup(daysSinceLastBackup);
    setIsVisible(shouldRemind && !isDismissed);
  }, [isDismissed]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportBackup();
      toast.success("Sauvegarde téléchargée avec succès !");
      setIsVisible(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("backup_reminder_dismissed", "true");
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Rappel de sauvegarde
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {daysSinceBackup === null
                ? "Vous n'avez jamais effectué de sauvegarde de vos données."
                : `Votre dernière sauvegarde date de ${daysSinceBackup} jours.`}
              {" "}Nous vous recommandons de sauvegarder régulièrement vos données.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Export..." : "Sauvegarder"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
