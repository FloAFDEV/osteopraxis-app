import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Trash2, 
  RotateCcw, 
  Search,
  Filter,
  MessageCircle,
  Ban,
  UserCog,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "ADMIN" | "OSTEOPATH";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  osteopathId: number | null;
}

export function EnhancedUsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "deleted">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "OSTEOPATH">("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageSubject, setMessageSubject] = useState("");

  React.useEffect(() => {
    loadUsers();
  }, []);

  React.useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        switch (statusFilter) {
          case "active":
            return user.is_active && !user.deleted_at;
          case "inactive":
            return !user.is_active && !user.deleted_at;
          case "deleted":
            return !!user.deleted_at;
          default:
            return true;
        }
      });
    }

    // Filtre par rôle
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("User")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", userId);
      
      if (error) throw error;
      
      toast.success(`Utilisateur ${isActive ? "activé" : "désactivé"} avec succès`);
      await loadUsers();
    } catch (error) {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "ADMIN" | "OSTEOPATH") => {
    try {
      const { error } = await supabase
        .from("User")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);
      
      if (error) throw error;
      
      toast.success("Rôle utilisateur mis à jour avec succès");
      await loadUsers();
    } catch (error) {
      toast.error("Erreur lors de la modification du rôle");
    }
  };

  const handleSoftDelete = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        p_table_name: "User",
        p_record_id: userId
      });
      
      if (error) throw error;
      toast.success("Utilisateur supprimé (récupérable)");
      await loadUsers();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("restore_record", {
        p_table_name: "User",
        p_record_id: userId
      });
      
      if (error) throw error;
      toast.success("Utilisateur restauré avec succès");
      await loadUsers();
    } catch (error) {
      toast.error("Erreur lors de la restauration");
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'message') => {
    if (selectedUsers.length === 0) {
      toast.error("Aucun utilisateur sélectionné");
      return;
    }

    try {
      switch (action) {
        case 'activate':
          for (const userId of selectedUsers) {
            await handleToggleActive(userId, true);
          }
          break;
        case 'deactivate':
          for (const userId of selectedUsers) {
            await handleToggleActive(userId, false);
          }
          break;
        case 'delete':
          for (const userId of selectedUsers) {
            await handleSoftDelete(userId);
          }
          break;
        case 'message':
          // Simuler l'envoi de message
          toast.success(`Message envoyé à ${selectedUsers.length} utilisateur(s)`);
          setMessageText("");
          setMessageSubject("");
          break;
      }
      
      setSelectedUsers([]);
    } catch (error) {
      toast.error("Erreur lors de l'action groupée");
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.deleted_at) {
      return <Badge variant="destructive">Supprimé</Badge>;
    }
    if (user.is_active) {
      return <Badge variant="default">Actif</Badge>;
    }
    return <Badge variant="secondary">Inactif</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "ADMIN" ? "destructive" : "outline"}>
        {role === "ADMIN" ? (
          <>
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </>
        ) : (
          "Ostéopathe"
        )}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion Avancée des Utilisateurs
            </div>
            {selectedUsers.length > 0 && (
              <Badge variant="secondary">
                {selectedUsers.length} sélectionné(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="deleted">Supprimés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="ADMIN">Administrateurs</SelectItem>
                <SelectItem value="OSTEOPATH">Ostéopathes</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setRoleFilter("all");
              setSelectedUsers([]);
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>

          {/* Actions groupées */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
              <Button size="sm" onClick={() => handleBulkAction('activate')}>
                <UserCheck className="w-4 h-4 mr-1" />
                Activer
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                <UserX className="w-4 h-4 mr-1" />
                Désactiver
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer les utilisateurs sélectionnés</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera temporairement {selectedUsers.length} utilisateur(s). 
                      Ils pourront être restaurés plus tard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleBulkAction('delete')}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Envoyer un message</AlertDialogTitle>
                    <AlertDialogDescription>
                      Envoyer un message à {selectedUsers.length} utilisateur(s) sélectionné(s).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Input
                        placeholder="Sujet du message"
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Contenu du message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleBulkAction('message')}
                      disabled={!messageSubject || !messageText}
                    >
                      Envoyer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Liste des utilisateurs */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-3 font-medium">Utilisateur</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Rôle</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-left p-3 font-medium">Créé le</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{getRoleBadge(user.role)}</td>
                      <td className="p-3">{getStatusBadge(user)}</td>
                      <td className="p-3">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {user.deleted_at ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(user.id)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restaurer
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleActive(user.id, !user.is_active)}
                              >
                                {user.is_active ? (
                                  <>
                                    <Ban className="w-4 h-4 mr-1" />
                                    Bloquer
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Activer
                                  </>
                                )}
                              </Button>

                              <Select
                                value={user.role}
                                onValueChange={(value: "ADMIN" | "OSTEOPATH") => 
                                  handleUpdateRole(user.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                  <SelectItem value="OSTEOPATH">Ostéopathe</SelectItem>
                                </SelectContent>
                              </Select>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action supprimera temporairement l'utilisateur. 
                                      Il pourra être restauré plus tard depuis l'interface d'administration.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleSoftDelete(user.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé avec ces critères
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}