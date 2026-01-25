import { useState, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Shield } from "lucide-react";

interface SecureDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  warningText?: string;
  isLoading?: boolean;
}

/**
 * Modal de suppression sécurisée avec code à 4 chiffres
 *
 * Protection contre les suppressions accidentelles :
 * - Code aléatoire généré à chaque ouverture
 * - L'utilisateur doit saisir le code exact
 * - Le code est invalidé si le modal est fermé
 * - Une seule tentative par ouverture
 */
export function SecureDeletionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Supprimer définitivement les données",
  description = "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
  warningText = "Cette action ne peut pas être annulée. Vos données ne pourront pas être récupérées.",
  isLoading = false
}: SecureDeletionModalProps) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [expectedCode, setExpectedCode] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);

  // Générer un nouveau code à 4 chiffres à chaque ouverture
  const generateCode = useCallback(() => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setExpectedCode(code);
    setConfirmationCode(code);
    setInputValue("");
    setHasAttempted(false);
    setIsCodeCorrect(false);
  }, []);

  // Générer un nouveau code quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      generateCode();
    }
  }, [isOpen, generateCode]);

  // Vérifier le code en temps réel
  useEffect(() => {
    if (inputValue.length === 4) {
      const correct = inputValue === expectedCode;
      setIsCodeCorrect(correct);
      if (!correct) {
        setHasAttempted(true);
      }
    } else {
      setIsCodeCorrect(false);
    }
  }, [inputValue, expectedCode]);

  const handleClose = () => {
    // Invalider le code à la fermeture
    setExpectedCode("");
    setInputValue("");
    setHasAttempted(false);
    setIsCodeCorrect(false);
    onClose();
  };

  const handleConfirm = () => {
    if (isCodeCorrect && !isLoading) {
      onConfirm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setInputValue(value);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl text-red-600 dark:text-red-400">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Avertissement */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-semibold mb-1">Attention !</p>
                <p>{warningText}</p>
              </div>
            </div>
          </div>

          {/* Code de confirmation */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-sm">Code de sécurité</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Pour confirmer cette action, saisissez le code suivant :
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-3xl font-mono font-bold tracking-[0.5em] bg-white dark:bg-slate-800 px-6 py-3 rounded-lg border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400">
                {confirmationCode}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmation-code" className="text-sm font-medium">
                Entrez le code ci-dessus :
              </label>
              <Input
                id="confirmation-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="____"
                className={`text-center text-2xl font-mono tracking-[0.3em] ${
                  hasAttempted && !isCodeCorrect
                    ? "border-red-500 focus:ring-red-500"
                    : isCodeCorrect
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }`}
                autoFocus
                disabled={isLoading}
              />
              {hasAttempted && !isCodeCorrect && inputValue.length === 4 && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  Code incorrect. Veuillez réessayer.
                </p>
              )}
              {isCodeCorrect && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  Code correct. Vous pouvez maintenant confirmer.
                </p>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isCodeCorrect || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">&#9696;</span>
                Suppression en cours...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
