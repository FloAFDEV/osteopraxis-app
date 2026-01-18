/**
 * Page Admin - Gestion des ostéopathes
 * Permet aux administrateurs de gérer les statuts (demo/active/blocked)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  Eye,
  Ban,
  Unlock,
} from 'lucide-react';
import {
  osteopathStatusService,
  OsteopathWithStatus,
  OsteopathStatusStats,
} from '@/services/admin/osteopath-status-service';
import { OsteopathStatus } from '@/types';

export default function AdminOsteopathsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [osteopaths, setOsteopaths] = useState<OsteopathWithStatus[]>([]);
  const [stats, setStats] = useState<OsteopathStatusStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedOsteopath, setSelectedOsteopath] = useState<OsteopathWithStatus | null>(null);
  const [activateReason, setActivateReason] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (user?.role !== 'ADMIN') {
      toast.error('Accès refusé. Vous devez être administrateur.');
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [osteopathsData, statsData] = await Promise.all([
        osteopathStatusService.getAllOsteopathsWithStatus(),
        osteopathStatusService.getStatusStats(),
      ]);

      setOsteopaths(osteopathsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClick = (osteopath: OsteopathWithStatus) => {
    setSelectedOsteopath(osteopath);
    setActivateReason('');
    setActivateDialogOpen(true);
  };

  const handleBlockClick = (osteopath: OsteopathWithStatus) => {
    setSelectedOsteopath(osteopath);
    setBlockReason('');
    setBlockDialogOpen(true);
  };

  const handleActivateConfirm = async () => {
    if (!selectedOsteopath) return;

    setActionLoading(true);
    try {
      await osteopathStatusService.activateOsteopath({
        osteopathId: selectedOsteopath.id,
        reason: activateReason || undefined,
      });

      toast.success(`✅ Ostéopathe ${selectedOsteopath.name} activé avec succès`);
      setActivateDialogOpen(false);
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur activation:', error);
      toast.error('Erreur lors de l\'activation de l\'ostéopathe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockConfirm = async () => {
    if (!selectedOsteopath || !blockReason.trim()) {
      toast.error('Veuillez indiquer la raison du blocage');
      return;
    }

    setActionLoading(true);
    try {
      await osteopathStatusService.blockOsteopath({
        osteopathId: selectedOsteopath.id,
        reason: blockReason,
      });

      toast.success(`✅ Ostéopathe ${selectedOsteopath.name} bloqué`);
      setBlockDialogOpen(false);
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur blocage:', error);
      toast.error('Erreur lors du blocage de l\'ostéopathe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (osteopath: OsteopathWithStatus) => {
    setActionLoading(true);
    try {
      await osteopathStatusService.unblockOsteopath(osteopath.id);
      toast.success(`✅ Ostéopathe ${osteopath.name} débloqué (passé en mode demo)`);
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur déblocage:', error);
      toast.error('Erreur lors du déblocage de l\'ostéopathe');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: OsteopathStatus) => {
    switch (status) {
      case 'demo':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Démo
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Actif
          </Badge>
        );
      case 'blocked':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Bloqué
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const totalOsteopaths = stats.reduce((sum, stat) => sum + stat.count, 0);
  const demoStats = stats.find((s) => s.status === 'demo');
  const activeStats = stats.find((s) => s.status === 'active');
  const blockedStats = stats.find((s) => s.status === 'blocked');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Administration - Gestion des ostéopathes
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérer les statuts et les autorisations des ostéopathes
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ostéopathes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalOsteopaths}</div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              En Démo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{demoStats?.count || 0}</div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 opacity-50" />
            </div>
            {demoStats && demoStats.avg_days_in_demo !== null && (
              <p className="text-xs text-muted-foreground mt-2">
                Moyenne : {Math.round(demoStats.avg_days_in_demo)} jours en démo
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{activeStats?.count || 0}</div>
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
              Bloqués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{blockedStats?.count || 0}</div>
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des ostéopathes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ostéopathes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Jours en démo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {osteopaths.map((osteopath) => (
                <TableRow key={osteopath.id}>
                  <TableCell className="font-medium">{osteopath.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {osteopath.professional_title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {osteopath.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(osteopath.status)}</TableCell>
                  <TableCell>
                    {osteopath.status === 'demo' && osteopath.daysInDemo !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {osteopath.daysInDemo} jours
                      </span>
                    )}
                    {osteopath.status === 'active' && (
                      <span className="text-sm text-green-600">✓ Validé</span>
                    )}
                    {osteopath.status === 'blocked' && (
                      <span className="text-sm text-red-600">⛔ Bloqué</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {osteopath.status === 'demo' && osteopath.canActivate && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleActivateClick(osteopath)}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Activer
                      </Button>
                    )}
                    {osteopath.status === 'active' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBlockClick(osteopath)}
                        disabled={actionLoading}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Bloquer
                      </Button>
                    )}
                    {osteopath.status === 'blocked' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(osteopath)}
                        disabled={actionLoading}
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Débloquer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'activation */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activer l'ostéopathe</DialogTitle>
            <DialogDescription>
              L'ostéopathe {selectedOsteopath?.name} passera en mode <strong>ACTIF</strong>.
              Les factures PDF générées ne seront plus marquées "DEMO".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activateReason">Raison de l'activation (optionnel)</Label>
              <Textarea
                id="activateReason"
                placeholder="Ex: Paiement validé, essai gratuit terminé..."
                value={activateReason}
                onChange={(e) => setActivateReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleActivateConfirm} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmer l'activation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de blocage */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquer l'ostéopathe</DialogTitle>
            <DialogDescription>
              L'ostéopathe {selectedOsteopath?.name} sera <strong>BLOQUÉ</strong> et ne pourra plus
              accéder à l'application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="blockReason">
                Raison du blocage <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="blockReason"
                placeholder="Ex: Non-paiement, abus des conditions d'utilisation..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockConfirm}
              disabled={actionLoading || !blockReason.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocage...
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Confirmer le blocage
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
