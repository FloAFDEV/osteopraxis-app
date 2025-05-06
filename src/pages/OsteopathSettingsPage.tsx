import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { User } from "@/types";

const OsteopathSettingsPage = () => {
  const { user: connectedUser } = useAuth();
  const [osteopathProfile, setOsteopathProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const osteopathId = connectedUser?.osteopathId;

  useEffect(() => {
    const fetchOsteopathProfile = async () => {
      if (osteopathId) {
        setIsLoading(true);
        try {
          const profile = await api.getOsteopathProfile(connectedUser?.id || '');
          setOsteopathProfile(profile);
        } catch (error) {
          console.error("Error fetching osteopath profile:", error);
          toast.error("Failed to load profile settings.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOsteopathProfile();
  }, [connectedUser, osteopathId]);

  const handleSaveOsteopath = async (data: any) => {
    setIsSaving(true);
    try {
      // Mettre à jour le profil de l'ostéopathe
      await api.updateOsteopathProfile(connectedUser?.id || '', data);
      toast.success("Profil mis à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {osteopathProfile && (
              <OsteopathProfileForm
                defaultValues={{
                  name: `${connectedUser?.firstName || ''} ${connectedUser?.lastName || ''}`,
                  firstName: connectedUser?.firstName || '',
                  lastName: connectedUser?.lastName || '',
                  bio: osteopathProfile?.bio || '',
                  website: osteopathProfile?.website || '',
                  linkedin: osteopathProfile?.linkedin || '',
                  facebook: osteopathProfile?.facebook || '',
                  twitter: osteopathProfile?.twitter || '',
                  instagram: osteopathProfile?.instagram || '',
                  youtube: osteopathProfile?.youtube || '',
                  tiktok: osteopathProfile?.tiktok || '',
                }}
                osteopathId={osteopathId}
                isEditing={true}
                onSuccess={() => {}}
                onSave={handleSaveOsteopath}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
