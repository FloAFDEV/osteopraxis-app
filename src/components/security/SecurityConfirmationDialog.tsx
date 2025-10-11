import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmButtonText?: string;
  variant?: 'destructive' | 'default';
}

/**
 * Dialogue de confirmation sécurisé avec code à 4 chiffres aléatoire
 * L'utilisateur doit recopier le code pour confirmer l'action sensible
 */
export function SecurityConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirmer',
  variant = 'destructive',
}: SecurityConfirmationDialogProps) {
  const [securityCode, setSecurityCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Générer un nouveau code à 4 chiffres à chaque ouverture
  useEffect(() => {
    if (open) {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setSecurityCode(newCode);
      setUserInput('');
      setIsConfirming(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (userInput !== securityCode) {
      toast.error('Code de sécurité incorrect');
      setUserInput('');
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setUserInput('');
    onOpenChange(false);
  };

  const isCodeValid = userInput === securityCode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Pour confirmer cette action, recopiez le code de sécurité :
            </Label>
            <div className="flex items-center justify-center p-6 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20">
              <span className="text-4xl font-bold tracking-widest font-mono text-primary">
                {securityCode}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-code" className="text-sm">
              Entrez le code à 4 chiffres :
            </Label>
            <Input
              id="security-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={userInput}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setUserInput(value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isCodeValid) {
                  handleConfirm();
                }
              }}
              placeholder="0000"
              className="text-center text-2xl font-mono tracking-widest"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={!isCodeValid || isConfirming}
          >
            {isConfirming ? 'Confirmation...' : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
