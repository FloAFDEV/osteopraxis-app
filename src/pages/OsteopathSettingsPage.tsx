
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog } from "lucide-react";
import { toast } from "sonner";

const OsteopathSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (user) {
          const fetchedProfile = await api.getProfessionalProfileByUserId(user.id);
          setProfile(fetchedProfile);
        }
      } catch (error) {
        console.error("Error fetching osteopath profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateSuccess = async (updatedProfile: any) => {
    toast.success("Profile updated successfully!");
    setProfile(updatedProfile);

    // Update user context if needed
    if (user && updatedProfile.id !== user.professionalProfileId) {
      updateUser({ ...user, professionalProfileId: updatedProfile.id });
    }

    navigate("/dashboard");
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCog className="h-5 w-5 text-blue-500" />
          Paramètres du profil professionnel
        </h1>
        <div className="mt-4">
          {profile ? (
            <OsteopathProfileForm
              defaultValues={profile}
              osteopathId={profile.id}
              isEditing={true}
              onSuccess={handleUpdateSuccess}
            />
          ) : (
            <div>No profile found.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
