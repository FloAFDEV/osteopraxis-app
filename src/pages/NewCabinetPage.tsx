
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet/CabinetForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";

const NewCabinetPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [osteopathId, setOsteopathId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOsteopath = async () => {
      try {
        if (!user) return;
        
        const osteopath = await api.getCurrentOsteopath();
        if (osteopath && osteopath.id) {
          setOsteopathId(osteopath.id);
        } else {
          toast.error("Profil ostéopathe introuvable");
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading osteopath:", error);
        toast.error("Erreur lors du chargement du profil");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadOsteopath();
  }, [user, navigate]);

  const handleSuccess = () => {
    navigate("/cabinets");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!osteopathId) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Profil ostéopathe requis</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Nouveau Cabinet</h1>
        <CabinetForm 
          osteopathId={osteopathId}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
};

export default NewCabinetPage;
