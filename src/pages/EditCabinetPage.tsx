
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { Layout } from "@/components/ui/layout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { isCabinetOwnedByCurrentOsteopath } from "@/services";
import { BackButton } from "@/components/ui/back-button";

const EditCabinetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      imageUrl: ""
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Vérifier que le cabinet appartient à l'ostéopathe connecté
        const cabinetId = parseInt(id);
        const isCabinetOwned = await isCabinetOwnedByCurrentOsteopath(cabinetId);
        
        if (!isCabinetOwned) {
          console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: Tentative d'édition du cabinet ${id} qui n'appartient pas à l'ostéopathe connecté`);
          toast.error("Vous n'avez pas accès à ce cabinet");
          navigate("/cabinets");
          return;
        }
        
        const cabinetData = await api.getCabinetById(cabinetId);
        if (!cabinetData) {
          throw new Error("Cabinet non trouvé");
        }
        setCabinet(cabinetData);

        // Remplir le formulaire avec les données existantes
        form.reset({
          name: cabinetData.name || "",
          address: cabinetData.address || "",
          phone: cabinetData.phone || "",
          email: cabinetData.email || "",
          imageUrl: cabinetData.imageUrl || ""
        });
      } catch (error) {
        console.error("Error fetching cabinet:", error);
        toast.error("Impossible de charger les données du cabinet. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, form]);

  const onSubmit = async (data: { 
    name: string; 
    address: string; 
    phone: string; 
    email: string; 
    imageUrl: string;
  }) => {
    if (!cabinet) return;
    
    try {
      setIsSaving(true);
      
      const updatedCabinet = await api.updateCabinet(cabinet.id, {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null
      });
      
      if (updatedCabinet) {
        setCabinet(updatedCabinet);
        toast.success("Informations du cabinet mises à jour");
        setTimeout(() => {
          navigate("/cabinets");
        }, 500);
      }
    } catch (error) {
      console.error("Error updating cabinet:", error);
      toast.error("Échec de la mise à jour des informations du cabinet");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <BackButton to="/cabinets" />
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cabinet) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <BackButton to="/cabinets" />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Cabinet non trouvé</h3>
                <p className="text-muted-foreground">
                  Le cabinet que vous recherchez n&apos;existe pas ou a été supprimé.
                </p>
              </div>
              <Button asChild size="lg">
                <a href="/cabinets">Retour aux cabinets</a>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <BackButton to="/cabinets" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Modifier le cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations de votre cabinet d'ostéopathie
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Informations du cabinet</h2>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du cabinet</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="Nom du cabinet" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="Adresse complète" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="Numéro de téléphone" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (facultatif)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="Email du cabinet" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image (facultatif)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="URL de l'image du cabinet" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/cabinets")}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCabinetPage;
