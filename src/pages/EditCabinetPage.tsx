
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { Cabinet } from "@/types";
import { Card } from "@/components/ui/card";

const EditCabinetPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    const fetchCabinet = async () => {
      if (!isEditing) {
        setLoading(false);
        return;
      }

      try {
        const cabinetData = await api.getCabinetById(parseInt(id!, 10));
        if (cabinetData) {
          setCabinet(cabinetData);
        } else {
          toast.error("Cabinet non trouvé");
          navigate("/cabinets");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du cabinet", error);
        toast.error("Impossible de charger le cabinet");
        navigate("/cabinets");
      } finally {
        setLoading(false);
      }
    };

    fetchCabinet();
  }, [id, isEditing, navigate]);

  const handleSaveCabinet = async (cabinetData: Cabinet) => {
    try {
      setSaving(true);

      if (isEditing && cabinet) {
        // Update existing cabinet
        const updatedCabinet = await api.updateCabinet(cabinet.id, {
          ...cabinetData,
        });
        toast.success("Cabinet mis à jour avec succès");
        navigate(`/cabinet/${updatedCabinet.id}`);
      } else {
        // Create new cabinet
        const newCabinet = await api.createCabinet({
          ...cabinetData,
        });
        toast.success("Cabinet créé avec succès");
        navigate(`/cabinet/${newCabinet.id}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du cabinet", error);
      toast.error("Impossible d'enregistrer le cabinet");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          {isEditing ? "Modifier le cabinet" : "Nouveau cabinet"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isEditing
            ? "Modifiez les informations de votre cabinet"
            : "Créez un nouveau cabinet pour votre pratique"}
        </p>

        <Card className="p-6">
          <CabinetForm
            osteopathId={1} // Temporarily hardcoded, should be from auth context
            onSave={handleSaveCabinet}
            cabinet={cabinet || undefined}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default EditCabinetPage;
