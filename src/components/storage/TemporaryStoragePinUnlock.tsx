import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

interface TemporaryStoragePinUnlockProps {
  onUnlock: () => void | Promise<void>;
  onForgot: () => void;
}

export const TemporaryStoragePinUnlock: React.FC<TemporaryStoragePinUnlockProps> = ({ 
  onUnlock, 
  onForgot 
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    if (pin.length !== 6) {
      toast.error('Le code PIN doit contenir 6 chiffres');
      return;
    }

    setIsLoading(true);
    try {
      const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
      await encryptedWorkingStorage.configureWithPin(pin);
      
      toast.success('Données déverrouillées');
      onUnlock();
    } catch (error) {
      console.error('Erreur déverrouillage:', error);
      toast.error('Code PIN incorrect');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Déverrouiller les données</CardTitle>
          <CardDescription>
            Saisissez votre code PIN pour accéder à vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-center block">Code PIN</label>
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

          <Button 
            onClick={handleUnlock} 
            disabled={isLoading || pin.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Déverrouillage...' : 'Déverrouiller'}
          </Button>

          <Button 
            variant="ghost" 
            onClick={onForgot}
            className="w-full"
          >
            Code oublié ?
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
