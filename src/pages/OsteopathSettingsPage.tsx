
import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OsteopathProfileForm } from "@/components/OsteopathProfileForm";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface OsteopathSettingsPageProps {}

const OsteopathSettingsPage: React.FC<OsteopathSettingsPageProps> = () => {
  const { user } = useAuth();
  const [osteopathProfile, setOsteopathProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOsteopathProfile = async () => {
      if (!user?.osteopathId) {
        setLoading(false);
        return;
      }

      try {
        const profileData = await api.getOsteopathProfile(user.osteopathId);
        setOsteopathProfile(profileData);
      } catch (error) {
        console.error("Error fetching osteopath profile:", error);
        toast.error("Impossible de charger le profil de l'ostéopathe");
      } finally {
        setLoading(false);
      }
    };

    fetchOsteopathProfile();
  }, [user]);

  const handleProfileUpdate = async (updatedProfile: any) => {
    if (!user?.osteopathId) return;

    try {
      await api.updateOsteopathProfile(user.osteopathId, updatedProfile);
      setOsteopathProfile(updatedProfile);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating osteopath profile:", error);
      toast.error("Impossible de mettre à jour le profil");
    }
  };

  const handleBillingSettingsSave = async () => {
    toast.success("Paramètres de facturation mis à jour");
  };

  const handleCalendarSettingsSave = async () => {
    toast.success("Paramètres de calendrier mis à jour");
  };

  const handleNotificationSettingsSave = async () => {
    toast.success("Paramètres de notification mis à jour");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Paramètres du compte</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <OsteopathProfileForm 
              osteopath={osteopathProfile} 
              onSave={handleProfileUpdate}
            />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            {/* Billing settings content */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de facturation</CardTitle>
                <CardDescription>
                  Configurez vos préférences de facturation et informations fiscales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Billing settings form fields would go here */}
                <Button onClick={handleBillingSettingsSave}>Enregistrer</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar settings content */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du calendrier</CardTitle>
                <CardDescription>
                  Configurez vos horaires de travail et disponibilités.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar settings form fields would go here */}
                <Button onClick={handleCalendarSettingsSave}>Enregistrer</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notification settings content */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notifications</CardTitle>
                <CardDescription>
                  Gérez vos préférences de notifications par email et SMS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Notification settings form fields would go here */}
                <Button onClick={handleNotificationSettingsSave}>Enregistrer</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
