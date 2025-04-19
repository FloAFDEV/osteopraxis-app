
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { ProfessionalProfile } from "@/types";
import { toast } from 'sonner';
import { Loader2, User, Settings, Building } from 'lucide-react';

const OsteopathSettingsPage = () => {
  const { user } = useAuth();
  const [osteopath, setOsteopath] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOsteopathProfile = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        let profile: ProfessionalProfile | undefined;
        if (user.professionalProfileId) {
          // Load existing profile
          console.log(`Loading professional profile with ID: ${user.professionalProfileId}`);
          profile = await api.getProfessionalProfileById(user.professionalProfileId);
        } else {
          // Check if there's a profile for this userId
          console.log(`Checking for professional profile with userId: ${user.id}`);
          profile = await api.getProfessionalProfileByUserId(user.id);
        }
        
        console.log("Loaded osteopath profile:", profile);
        setOsteopath(profile || null);
      } catch (error) {
        console.error("Error loading osteopath profile:", error);
        toast.error("Une erreur est survenue lors du chargement des données du profil.");
      } finally {
        setLoading(false);
      }
    };

    loadOsteopathProfile();
  }, [user]);

  const handleProfileSaved = async (updatedProfile: ProfessionalProfile) => {
    setOsteopath(updatedProfile);
    toast.success("Profil mis à jour avec succès");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Paramètres du profil</h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            {loading ? (
              <Card>
                <CardContent className="p-6 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ) : (
              <OsteopathProfileForm
                defaultValues={osteopath || {
                  id: 0,
                  userId: user?.id || '',
                  name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Ostéopathe',
                  title: 'Ostéopathe D.O.',
                  profession_type: 'osteopathe',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }}
                osteopathId={osteopath?.id}
                isEditing={!!osteopath}
                onSuccess={handleProfileSaved}
              />
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Paramètres</h3>
                <p className="text-muted-foreground">
                  Les paramètres avancés seront disponibles prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
