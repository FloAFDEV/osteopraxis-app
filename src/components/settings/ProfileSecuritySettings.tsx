import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { hybridStorageManager } from "@/services/hybrid-storage-manager";
import { toast } from "sonner";

export function ProfileSecuritySettings() {
  const [current, setCurrent] = useState("");
  const [method, setMethod] = useState<'pin' | 'password'>("pin");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (method === 'pin' && !/^\d{4,8}$/.test(next)) {
      toast.error('Le PIN doit contenir 4 à 8 chiffres');
      return;
    }
    if (method === 'password' && next.length < 8) {
      toast.error('Mot de passe trop court (min 8)');
      return;
    }
    if (next !== confirm) {
      toast.error('La confirmation ne correspond pas');
      return;
    }
    setLoading(true);
    try {
      const ok = await hybridStorageManager.changeCredential(current, next, method);
      if (!ok) {
        toast.error('Code actuel incorrect');
        return;
      }
      toast.success('Code de sécurité mis à jour');
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité du stockage local</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Méthode</Label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3"
              value={method}
              onChange={(e) => setMethod(e.target.value as 'pin' | 'password')}
            >
              <option value="pin">Code PIN</option>
              <option value="password">Mot de passe</option>
            </select>
          </div>
          <div>
            <Label>Code actuel</Label>
            <Input value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={method === 'pin' ? 'PIN actuel' : 'Mot de passe actuel'} />
          </div>
          <div>
            <Label>Nouveau code</Label>
            <Input value={next} onChange={(e) => setNext(e.target.value)} placeholder={method === 'pin' ? '4-8 chiffres' : 'Mot de passe'} />
          </div>
          <div>
            <Label>Confirmation</Label>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmez" />
          </div>
        </div>
        <Button onClick={handleChange} disabled={loading}>
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </CardContent>
    </Card>
  );
}
