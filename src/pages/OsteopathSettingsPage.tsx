
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";

const OsteopathSettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const osteopathProfile = await api.getOsteopathProfile(user.id);
        
        if (osteopathProfile) {
          setProfile(osteopathProfile);
        } else {
          toast.error("Profil non trouvé. Veuillez compléter votre profil.");
          navigate("/profile/setup");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast.error("Erreur lors du chargement du profil. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleProfileUpdate = async (updatedOsteopath: any) => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        toast.error("Utilisateur non identifié");
        return;
      }
      
      // Call the API to update the osteopath profile
      await api.updateOsteopathProfile(user.id, {
        ...updatedOsteopath,
        osteopathId: profile?.osteopathId
      });
      
      toast.success("Profil mis à jour avec succès!");
      
      // Refresh profile data
      const refreshedProfile = await api.getOsteopathProfile(user.id);
      setProfile(refreshedProfile);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Paramètres du profil</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
            <TabsTrigger value="professional">Informations professionnelles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations personnelles de base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <OsteopathProfileForm
                    profile={profile}
                    onSave={handleProfileUpdate}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations professionnelles comme l'adresse, les spécialités, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Fonctionnalité à venir...</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/cabinet')}
                  >
                    Gérer mes cabinets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
