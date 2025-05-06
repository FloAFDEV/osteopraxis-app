import React, { useState, useEffect, useContext } from 'react';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { CabinetForm } from "@/components/cabinet-form";
import { api } from "@/services/api";
import { User, OsteopathProfile, Cabinet } from "@/types";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useParams } from 'react-router-dom';

const defaultProfile = {
  firstName: "John",
  lastName: "Doe",
  bio: "A brief bio goes here.",
  website: "https://example.com",
  linkedin: "https://linkedin.com/in/example",
  facebook: "https://facebook.com/example",
  twitter: "https://twitter.com/example",
  instagram: "https://instagram.com/example",
  youtube: "https://youtube.com/example",
  tiktok: "https://tiktok.com/example",
};

const defaultCabinet = {
  name: "Cabinet Name",
  address: "123 Main St",
  city: "Anytown",
  province: "State",
  postalCode: "12345",
  country: "Country",
  phone: "123-456-7890",
  email: "email@example.com",
  website: "https://example.com",
  notes: "Additional notes here.",
  imageUrl: "https://example.com/image.jpg",
  logoUrl: "https://example.com/logo.jpg",
};

const initialOsteopathProfile: OsteopathProfile = {
  id: '',
  firstName: '',
  lastName: '',
  bio: '',
  website: '',
  linkedin: '',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  specialties: [],
  services: [],
  education: [],
  certifications: [],
  awards: [],
  publications: [],
};

export default function OsteopathProfilePage() {
  const { user: connectedUser } = useContext(AuthContext);
  const { id: osteopathId } = useParams<{ id: string }>();
  const [osteopathProfile, setOsteopathProfile] = useState<OsteopathProfile>(initialOsteopathProfile);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        if (!osteopathId) {
          console.warn("No osteopathId provided.");
          return;
        }
        const profileData = await api.getOsteopathProfile(osteopathId);
        setOsteopathProfile(profileData || initialOsteopathProfile);

        const cabinetData = await api.get первыеCabinetByOsteopathId(osteopathId);
        setCabinet(cabinetData);
      } catch (error) {
        console.error("Failed to fetch osteopath profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [osteopathId]);

  const handleSaveProfile = async (data: OsteopathProfile) => {
    setIsSaving(true);
    try {
      if (!connectedUser) {
        console.error("No connected user.");
        toast.error("No user is currently logged in.");
        return;
      }

      const updatedProfile = { ...osteopathProfile, ...data };
      await api.updateOsteopathProfile(connectedUser.id, updatedProfile);
      setOsteopathProfile(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCabinet = async (data: Cabinet) => {
    setIsSaving(true);
    try {
      if (!osteopathId) {
        console.error("No osteopathId provided.");
        toast.error("Osteopath ID is missing.");
        return;
      }

      const cabinetData = { ...cabinet, ...data, osteopathId: parseInt(osteopathId) };
      if (cabinet) {
        await api.updateCabinet(cabinet.id, cabinetData);
        setCabinet(cabinetData as Cabinet);
        toast.success("Cabinet updated successfully!");
      } else {
        await api.createCabinet(cabinetData);
        setCabinet(cabinetData as Cabinet);
        toast.success("Cabinet created successfully!");
      }
    } catch (error) {
      console.error("Failed to save cabinet:", error);
      toast.error("Failed to save cabinet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  const fullName = connectedUser 
    ? `${connectedUser.firstName || ''} ${connectedUser.lastName || ''}`
    : 'Nom du professionnel';
  const formattedName = connectedUser 
    ? `${connectedUser.firstName || ''} ${connectedUser.lastName || ''}` 
    : 'Nom du professionnel';
  const firstName = connectedUser?.firstName || '';
  const lastName = connectedUser?.lastName || '';

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profil de {formattedName}</CardTitle>
            <CardDescription>Gérez votre profil et les informations de votre cabinet.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/01.png" alt={fullName} />
                <AvatarFallback>{firstName?.charAt(0)}{lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{fullName}</h2>
                <p className="text-sm text-gray-500">
                  {connectedUser?.email}
                </p>
              </div>
            </div>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Informations du profil</h3>
              <OsteopathProfileForm
                osteopathProfile={osteopathProfile}
                onSave={handleSaveProfile}
                isLoading={isSaving}
                connectedUser={connectedUser}
                defaultValues={defaultProfile}
				osteopathId={parseInt(osteopathId)}
				isEditing={true}
				onSuccess={updatedOsteopath => Promise.resolve()}
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Informations du cabinet</h3>
              <CabinetForm
                osteopathId={parseInt(osteopathId)}
                onSuccess={() => {}}
				onSave={handleSaveCabinet}
              />
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
