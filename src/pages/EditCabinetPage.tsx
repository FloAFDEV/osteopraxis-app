
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet/CabinetForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { toast } from "sonner";

const EditCabinetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [osteopathId, setOsteopathId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id || !user) return;
        
        const cabinetId = parseInt(id, 10);
        if (isNaN(cabinetId)) {
          toast.error("ID de cabinet invalide");
          navigate("/cabinets");
          return;
        }

        // Load cabinet data
        const cabinetData = await api.getCabinetById(cabinetId);
        if (!cabinetData) {
          toast.error("Cabinet non trouvé");
          navigate("/cabinets");
          return;
        }

        // Load osteopath data
        const osteopath = await api.getCurrentOsteopath();
        if (!osteopath || !osteopath.id) {
          toast.error("Profil ostéopathe introuvable");
          navigate("/cabinets");
          return;
        }

        setCabinet(cabinetData);
        setOsteopathId(osteopath.id);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erreur lors du chargement");
        navigate("/cabinets");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate]);

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

  if (!cabinet || !osteopathId) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Cabinet ou profil introuvable</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Modifier le Cabinet</h1>
        <CabinetForm 
          defaultValues={{
            name: cabinet.name || "",
            address: cabinet.address || "",
            phone: cabinet.phone || "",
            email: cabinet.email || "",
            imageUrl: cabinet.imageUrl || "",
            logoUrl: cabinet.logoUrl || "",
            osteopathId: cabinet.osteopathId,
          }}
          cabinetId={cabinet.id}
          osteopathId={osteopathId}
          isEditing={true}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
};

export default EditCabinetPage;
