import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HardDrive, Upload, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface BackupInfo {
  lastBackup: Date | null;
  intervalMinutes: number | null;
  isActive: boolean;
}

export const BackupStatusBanner: React.FC = () => {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBackupStatus = async () => {
      try {
        const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
        const info = encryptedWorkingStorage.getBackupStatus();
        setBackupInfo(info);
      } catch (error) {
        console.error('Erreur vérification backup:', error);
      }
    };

    checkBackupStatus();
    
    // Refresh toutes les 10s
    const interval = setInterval(checkBackupStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRestoreBackup = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.hdsbackup';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const pin = prompt('Entrez le code PIN pour restaurer la sauvegarde :');
        if (!pin) return;

        const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
        await encryptedWorkingStorage.importBackup(file, pin);
        
        toast.success('Sauvegarde restaurée avec succès');
        window.location.reload();
      } catch (error) {
        console.error('Erreur restauration:', error);
        toast.error('Erreur lors de la restauration');
      }
    };
    input.click();
  };

  if (!backupInfo || !backupInfo.isActive) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
      <HardDrive className="h-4 w-4 text-blue-600" />
      <AlertTitle>Stockage temporaire chiffré actif</AlertTitle>
      <AlertDescription>
        <div className="space-y-3 mt-2">
          <div className="flex justify-between text-sm">
            <span>Dernière sauvegarde :</span>
            <span className="font-medium">
              {backupInfo.lastBackup 
                ? formatDistanceToNow(backupInfo.lastBackup, { addSuffix: true, locale: fr })
                : 'Jamais'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Prochaine sauvegarde :</span>
            <span className="font-medium">Dans {backupInfo.intervalMinutes} minutes</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={handleRestoreBackup}>
              <Upload className="h-4 w-4 mr-2" />
              Restaurer depuis backup
            </Button>
            <Button size="sm" onClick={() => navigate('/settings/storage')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer HDS définitif
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
