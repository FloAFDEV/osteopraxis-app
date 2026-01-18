import React, { useState } from 'react';
import { AdminLayout } from '@/components/ui/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Database, KeyRound, TestTube, AlertTriangle } from 'lucide-react';
import { HybridStorageDiagnostic } from '@/components/debug/HybridStorageDiagnostic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { untypedSupabase } from '@/integrations/supabase/unsafeClient';
import { useDemo } from '@/contexts/DemoContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminTechDebugPage: React.FC = () => {
  const { isDemoMode } = useDemo();
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'pin' | 'password'>('pin');
  const [newCredential, setNewCredential] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.includes('@')) return 'Email invalide';
    if (method === 'pin' && !/^\d{4,8}$/.test(newCredential)) return 'Le PIN doit contenir 4 à 8 chiffres';
    if (method === 'password' && newCredential.length < 8) return 'Mot de passe trop court (min 8)';
    return null;
  };

  const handleCreateUnlock = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      // Trouver l'utilisateur par email
      const { data: userRow, error: userErr } = await untypedSupabase
        .from('User')
        .select('auth_id')
        .eq('email', email)
        .maybeSingle();
      if (userErr || !userRow) throw new Error('Utilisateur introuvable');

      const { error: insertErr } = await untypedSupabase
        .from('hybrid_storage_unlock_requests')
        .insert({
          user_id: userRow.auth_id,
          new_credential: newCredential,
          method,
          status: 'pending'
        } as any);
      if (insertErr) throw insertErr;

      toast.success('Demande de déblocage créée');
      setEmail('');
      setNewCredential('');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // Bloquer l'accès en mode démo
  if (isDemoMode) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Accès restreint en mode démo</strong>
              <p className="mt-2">Les outils de débogage technique ne sont pas disponibles en mode démonstration pour des raisons de sécurité.</p>
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              Diagnostic technique & sécurité
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="diagnostic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagnostic" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" /> Diagnostic
            </TabsTrigger>
            <TabsTrigger value="unlock" className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Déblocage stockage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostic">
            <HybridStorageDiagnostic />
          </TabsContent>
          <TabsContent value="unlock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" /> Débloquer/modifier le code d’un praticien
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email du praticien</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: praticien@exemple.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Nouveau code</Label>
                    <Input
                      value={newCredential}
                      onChange={(e) => setNewCredential(e.target.value)}
                      placeholder={method === 'pin' ? '4-8 chiffres' : 'Mot de passe'}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateUnlock} disabled={loading}>
                  {loading ? 'Création...' : 'Créer la demande'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Le praticien pourra appliquer ce nouveau code depuis l’écran de déverrouillage.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminTechDebugPage;
