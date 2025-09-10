import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare,
  Send,
  Eye,
  Shield,
  Users,
  Ban,
  CheckCircle
} from "lucide-react";

interface InactiveUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  last_login: string | null;
  subscription_tier: string | null;
  days_inactive: number;
  risk_level: "low" | "medium" | "high";
}

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  related_user_id: string | null;
}

export function ProactiveUserManagement() {
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageSubject, setMessageSubject] = useState("");

  useEffect(() => {
    loadUserData();
    loadNotifications();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Simuler des utilisateurs inactifs
      const mockInactiveUsers: InactiveUser[] = [
        {
          id: "1",
          email: "inactive1@example.com",
          first_name: "Jean",
          last_name: "Dupont",
          last_login: "2024-07-15",
          subscription_tier: "Premium",
          days_inactive: 15,
          risk_level: "medium"
        },
        {
          id: "2",
          email: "inactive2@example.com",
          first_name: "Marie",
          last_name: "Martin",
          last_login: "2024-06-20",
          subscription_tier: "Gratuit",
          days_inactive: 45,
          risk_level: "high"
        },
        {
          id: "3",
          email: "inactive3@example.com",
          first_name: "Pierre",
          last_name: "Bernard",
          last_login: "2024-07-25",
          subscription_tier: "Entreprise",
          days_inactive: 8,
          risk_level: "low"
        }
      ];

      setInactiveUsers(mockInactiveUsers);

    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data: notificationsData, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(notificationsData || []);

    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  const createNotification = async (type: string, title: string, message: string, severity: string, userId?: string) => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .insert({
          type,
          title,
          message,
          severity,
          related_user_id: userId || null
        });

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
    }
  };

  const sendReactivationCampaign = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Veuillez sélectionner au moins un utilisateur");
      return;
    }

    if (!messageSubject || !messageText) {
      toast.error("Veuillez remplir le sujet et le message");
      return;
    }

    try {
      // Simuler l'envoi d'emails
      for (const userId of selectedUsers) {
        await createNotification(
          "reactivation_campaign",
          `Campagne de réactivation envoyée`,
          `Email envoyé avec le sujet: "${messageSubject}"`,
          "info",
          userId
        );
      }

      toast.success(`Campagne envoyée à ${selectedUsers.length} utilisateur(s)`);
      setSelectedUsers([]);
      setMessageSubject("");
      setMessageText("");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la campagne:", error);
      toast.error("Erreur lors de l'envoi");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "info": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion Proactive des Utilisateurs</h2>
      </div>

      <Tabs defaultValue="inactive" className="w-full">
        <TabsList>
          <TabsTrigger value="inactive">Utilisateurs Inactifs</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="limitations">Limitations de Plan</TabsTrigger>
          <TabsTrigger value="notifications">Notifications Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="inactive">
          <div className="space-y-6">
            {/* Statistiques d'inactivité */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inactifs Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{inactiveUsers.length}</div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Risque Élevé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-red-600">
                      {inactiveUsers.filter(u => u.risk_level === "high").length}
                    </div>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Risque Moyen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {inactiveUsers.filter(u => u.risk_level === "medium").length}
                    </div>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sélectionnés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedUsers.length}</div>
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des utilisateurs inactifs */}
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs Inactifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inactiveUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Inactif depuis {user.days_inactive} jours
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{user.subscription_tier}</Badge>
                        <Badge variant={getRiskBadgeColor(user.risk_level)}>
                          {user.risk_level === "high" ? "Risque élevé" : 
                           user.risk_level === "medium" ? "Risque moyen" : "Risque faible"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campagne de Réactivation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Sujet de l'email</Label>
                  <Input
                    id="subject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Nous vous avons manqué ! Revenez découvrir les nouveautés..."
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message personnalisé</Label>
                  <Textarea
                    id="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    placeholder="Cher utilisateur,

Nous avons remarqué que vous n'avez pas utilisé notre plateforme récemment. Nous avons ajouté de nouvelles fonctionnalités qui pourraient vous intéresser...

N'hésitez pas à revenir et à redécouvrir notre service !

L'équipe"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </p>
                  <Button 
                    onClick={sendReactivationCampaign}
                    disabled={selectedUsers.length === 0 || !messageSubject || !messageText}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer la Campagne
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="limitations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Limitations par Plan d'Abonnement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Plan Gratuit</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Max 50 patients</li>
                      <li>• 1 cabinet</li>
                      <li>• Export limité</li>
                      <li>• Pas d'analytics</li>
                    </ul>
                    <div className="mt-3">
                      <Badge variant="outline">347 utilisateurs</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Plan Premium</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Max 500 patients</li>
                      <li>• 5 cabinets</li>
                      <li>• Export complet</li>
                      <li>• Analytics basiques</li>
                    </ul>
                    <div className="mt-3">
                      <Badge variant="outline">89 utilisateurs</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Plan Entreprise</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Patients illimités</li>
                      <li>• Cabinets illimités</li>
                      <li>• Export avancé</li>
                      <li>• Analytics complètes</li>
                    </ul>
                    <div className="mt-3">
                      <Badge variant="outline">23 utilisateurs</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions sur les Limitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Utilisateurs proches des limites</p>
                      <p className="text-sm text-muted-foreground">12 utilisateurs ont atteint 80% de leurs limites</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir la Liste
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Utilisateurs ayant dépassé les limites</p>
                      <p className="text-sm text-muted-foreground">3 utilisateurs ont dépassé leurs quotas</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Ban className="h-4 w-4 mr-2" />
                      Appliquer Restrictions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications d'Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg ${notification.is_read ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(notification.severity)}
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={notification.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {notification.type}
                        </Badge>
                        {!notification.is_read && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune notification
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}