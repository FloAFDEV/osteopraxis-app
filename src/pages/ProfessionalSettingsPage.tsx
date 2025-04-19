import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { ProfessionalProfile } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/ui/layout";
import { ProfessionalProfileForm } from "@/components/professional-profile-form";
import { UserCog } from "lucide-react";
import { toast } from "sonner";

const ProfessionalSettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (user?.professionalProfileId) {
          const profileData = await api.getProfessionalProfileById(user.professionalProfileId);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching professional profile:", error);
        toast.error("Failed to load professional profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.professionalProfileId]);

  const handleProfileUpdate = (updatedProfile: ProfessionalProfile) => {
    setProfile(updatedProfile);
    toast.success("Professional profile updated successfully!");
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCog className="h-6 w-6 text-primary" />
          Paramètres du profil professionnel
        </h1>
        <div className="mt-4">
          {profile ? (
            <ProfessionalProfileForm
              defaultValues={profile}
              professionalProfileId={profile.id}
              isEditing={true}
              onSuccess={handleProfileUpdate}
            />
          ) : (
            <p>No professional profile found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalSettingsPage;
