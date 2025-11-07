import { ReactNode } from "react";
import { TemporaryStoragePinSetup } from "./TemporaryStoragePinSetup";
import { TemporaryStoragePinUnlock } from "./TemporaryStoragePinUnlock";

interface PinErrorHandlerProps {
  error: Error | null;
  onPinConfigured: () => void;
  children: ReactNode;
}

/**
 * Composant réutilisable pour gérer les erreurs PIN
 * Affiche le composant de setup ou unlock approprié selon l'erreur
 */
export function PinErrorHandler({ error, onPinConfigured, children }: PinErrorHandlerProps) {
  // Vérifier si l'erreur est une erreur PIN
  if (error?.message === 'PIN_SETUP_REQUIRED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <TemporaryStoragePinSetup 
          onComplete={async (pin: string) => {
            const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
            await encryptedWorkingStorage.configureWithPin(pin);
            onPinConfigured();
          }} 
        />
      </div>
    );
  }

  if (error?.message === 'PIN_UNLOCK_REQUIRED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <TemporaryStoragePinUnlock 
          onUnlock={async () => {
            onPinConfigured();
          }}
          onForgot={() => {
            localStorage.removeItem('temp-storage-pin-hash');
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Pas d'erreur PIN, afficher le contenu normal
  return <>{children}</>;
}
