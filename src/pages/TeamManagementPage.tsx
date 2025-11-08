/**
 * 📋 Page de gestion d'équipe - Réservée au plan Pro
 * 
 * Permet de:
 * - Inviter des praticiens à rejoindre le cabinet
 * - Gérer les permissions des membres de l'équipe
 * - Voir le tableau de bord collaboratif
 * - Gérer les remplacements et les accès patients
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlanGuard } from '@/components/plans/PlanGuard';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserPlus, Shield, Calendar, Activity, Mail, MoreVertical, Trash2, Edit } from 'lucide-react';
import { api } from '@/services/api';
import { Osteopath, Cabinet } from '@/types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      // Charger les cabinets de l'ostéopathe
      const cabinetsData = await api.getCabinets();
      setCabinets(cabinetsData || []);

      // Charger les associations ostéopathes-cabinets (membres de l'équipe)
      // TODO: Implémenter API pour récupérer les membres de l'équipe
      // const members = await api.getCabinetMembers(cabinetId);
      // setTeamMembers(members);

      // Charger les invitations en attente
      // TODO: Implémenter API pour récupérer les invitations
      // const pendingInvitations = await api.getCabinetInvitations(cabinetId);
      // setInvitations(pendingInvitations);

    } catch (error) {
      console.error('Erreur chargement données équipe:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = () => {
    // Rediriger vers la page d'invitation de cabinet
    navigate('/cabinets/invitations');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <PlanGuard feature="team">
      <Layout>
        <div className="container mx-auto py-8 px-4 space-y-6">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                Gestion d'équipe
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez votre équipe de praticiens et leurs permissions
              </p>
            </div>
            <Button onClick={handleInviteMember} className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un praticien
            </Button>
          </div>

          {/* Badge Plan Pro */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-semibold text-purple-900">
                    Fonctionnalité Plan Pro
                  </p>
                  <p className="text-sm text-purple-700">
                    Gérez votre équipe de praticiens et collaborez efficacement
                  </p>
                </div>
                <Badge className="bg-purple-600">PRO</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de navigation */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Membres
              </TabsTrigger>
              <TabsTrigger value="invitations">
                <Mail className="h-4 w-4 mr-2" />
                Invitations
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Activité
              </TabsTrigger>
            </TabsList>

            {/* Onglet Membres */}
            <TabsContent value="members" className="space-y-4">
              {cabinets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun cabinet configuré</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez d'abord un cabinet pour gérer votre équipe
                    </p>
                    <Button onClick={() => navigate('/cabinets/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un cabinet
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {cabinets.map((cabinet) => (
                    <Card key={cabinet.id}>
                      <CardHeader>
                        <CardTitle className="text-xl">{cabinet.name}</CardTitle>
                        <CardDescription>
                          {cabinet.address} - {teamMembers.length} membre(s)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {teamMembers.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <p>Aucun membre pour le moment</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={handleInviteMember}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Inviter un praticien
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* TODO: Afficher la liste des membres */}
                            <p className="text-sm text-muted-foreground">
                              Liste des membres à venir...
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Onglet Invitations */}
            <TabsContent value="invitations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invitations en attente</CardTitle>
                  <CardDescription>
                    Gérez les invitations envoyées à vos collaborateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune invitation en attente</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleInviteMember}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Envoyer une invitation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* TODO: Afficher les invitations */}
                      <p className="text-sm text-muted-foreground">
                        Liste des invitations à venir...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Activité */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activité de l'équipe</CardTitle>
                  <CardDescription>
                    Suivez l'activité de votre équipe en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tableau de bord d'activité à venir...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </PlanGuard>
  );
}
