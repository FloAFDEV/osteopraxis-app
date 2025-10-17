import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { generateSHA256 } from '@/utils/crypto';
import { toast } from 'sonner';
import { Shield, Lock } from 'lucide-react';

interface TemporaryStoragePinSetupProps {
  onComplete: (pin: string) => Promise<void>;
}

export const TemporaryStoragePinSetup: React.FC<TemporaryStoragePinSetupProps> = ({ onComplete }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      toast.error('Le code PIN doit contenir exactement 6 chiffres');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('Les codes PIN ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      // Générer un hash du PIN pour stockage sécurisé
      const pinHash = await generateSHA256(pin);
      localStorage.setItem('temp-storage-pin-hash', pinHash);
      
      // Passer le PIN en clair à la fonction de configuration
      await onComplete(pin);
      
      toast.success('Code PIN configuré avec succès');
    } catch (error) {
      console.error('Erreur configuration PIN:', error);
      toast.error('Erreur lors de la configuration du code PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sécurisation de vos données</CardTitle>
          <CardDescription className="text-base">
            Pour protéger vos données en attendant la configuration HDS complète, 
            créez un code PIN de 6 chiffres.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Code PIN</label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmer le code PIN</label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={confirmPin} onChange={setConfirmPin}>
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

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important :</strong> Conservez ce code en lieu sûr. 
                Il sera demandé à chaque démarrage de l'application.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || pin.length !== 6 || confirmPin.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Configuration...' : 'Valider le code PIN'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
