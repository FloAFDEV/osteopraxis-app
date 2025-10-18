import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Lock, Key, CheckCircle2 } from 'lucide-react';
import { encryptedWorkingStorage } from '@/services/storage/encrypted-working-storage';

export const PinSettings = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [isChanging, setIsChanging] = useState(false);

  const handleCurrentPinComplete = async (value: string) => {
    setCurrentPin(value);
    
    try {
      // Vérifier que le PIN actuel est correct
      await encryptedWorkingStorage.unlock(value);
      
      toast.success('PIN actuel validé');
      setStep('new');
    } catch (error) {
      toast.error('PIN actuel incorrect');
      setCurrentPin('');
    }
  };

  const handleNewPinComplete = (value: string) => {
    setNewPin(value);
    setStep('confirm');
  };

  const handleConfirmPinComplete = async (value: string) => {
    setConfirmPin(value);
    
    if (value !== newPin) {
      toast.error('Les PINs ne correspondent pas');
      setNewPin('');
      setConfirmPin('');
      setStep('new');
      return;
    }

    setIsChanging(true);
    
    try {
      // Changer le PIN
      await encryptedWorkingStorage.configureWithPin(value);
      
      toast.success('Code PIN modifié avec succès');
      
      // Réinitialiser le formulaire
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setStep('current');
    } catch (error) {
      console.error('Erreur lors du changement de PIN:', error);
      toast.error('Erreur lors du changement de PIN');
      setStep('current');
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setStep('current');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>Code PIN de sécurité</CardTitle>
        </div>
        <CardDescription>
          Modifiez votre code PIN de 6 chiffres pour sécuriser vos données locales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'current' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span>Entrez votre code PIN actuel</span>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={currentPin}
                onChange={setCurrentPin}
                onComplete={handleCurrentPinComplete}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        {step === 'new' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span>Entrez votre nouveau code PIN</span>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={newPin}
                onChange={setNewPin}
                onComplete={handleNewPinComplete}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Annuler
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmez votre nouveau code PIN</span>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={confirmPin}
                onChange={setConfirmPin}
                onComplete={handleConfirmPinComplete}
                disabled={isChanging}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button variant="outline" onClick={handleCancel} className="w-full" disabled={isChanging}>
              Annuler
            </Button>
          </div>
        )}

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">⚠️ Important</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Choisissez un code PIN que vous pourrez retenir</li>
            <li>Ne partagez jamais votre code PIN</li>
            <li>Le code PIN est demandé à chaque ouverture de l'application</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
