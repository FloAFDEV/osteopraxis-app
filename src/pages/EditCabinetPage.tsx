
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, AlertCircle, Phone, MapPin, Mail, Save } from "lucide-react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { Layout } from "@/components/ui/layout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { BackButton } from "@/components/ui/back-button";
import { ImageFields } from "@/components/cabinet/ImageFields";
import { CabinetFormValues } from "@/components/cabinet/types";

const EditCabinetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);

  const form = useForm<CabinetFormValues>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      imageUrl: "",
      logoUrl: ""
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const cabinetId = parseInt(id);
        
        // Récupérer directement le cabinet sans vérification préalable
        const cabinetData = await api.getCabinetById(cabinetId);
        
        if (!cabinetData) {
          console.error(`Cabinet ${id} non trouvé`);
          toast.error("Cabinet non trouvé");
          setLoading(false);
          return;
        }
        
        setCabinet(cabinetData);

        // Remplir le formulaire avec les données existantes
        form.reset({
          name: cabinetData.name || "",
          address: cabinetData.address || "",
          phone: cabinetData.phone || "",
          email: cabinetData.email || "",
          imageUrl: cabinetData.imageUrl || "",
          logoUrl: cabinetData.logoUrl || ""
        });

        // Initialiser les prévisualisations si les URLs existent
        if (cabinetData.imageUrl) {
          setPreviewImageUrl(cabinetData.imageUrl);
        }
        if (cabinetData.logoUrl) {
          setPreviewLogoUrl(cabinetData.logoUrl);
        }
        
      } catch (error) {
        console.error("Error fetching cabinet:", error);
        
        // Vérifier si c'est une erreur d'accès
        if (error instanceof Error && error.message.includes('accès')) {
          setAccessDenied(true);
          toast.error("Vous n'avez pas accès à ce cabinet");
        } else {
          toast.error("Impossible de charger les données du cabinet");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, form]);

  const onSubmit = async (data: CabinetFormValues) => {
    if (!cabinet) return;
    
    try {
      setIsSaving(true);
      
      const updatedCabinet = await api.updateCabinet(cabinet.id, {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
        logoUrl: data.logoUrl || null
      });
      
      if (updatedCabinet) {
        setCabinet(updatedCabinet);
        toast.success("Informations du cabinet mises à jour");
        // Délai avant la redirection pour laisser voir le toast
        setTimeout(() => {
          navigate("/cabinets");
        }, 1000);
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (accessDenied) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <BackButton to="/cabinets" />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Accès refusé</h3>
                <p className="text-muted-foreground">
                  Vous n&apos;avez pas les droits pour modifier ce cabinet.
                </p>
              </div>
              <Button onClick={() => navigate("/cabinets")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Retour aux cabinets
              </Button>
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
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Cabinet non trouvé</h3>
                <p className="text-muted-foreground">
                  Le cabinet que vous recherchez n&apos;existe pas ou a été supprimé.
                </p>
              </div>
              <Button onClick={() => navigate("/cabinets")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Retour aux cabinets
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
            <Building2 className="h-8 w-8 text-blue-600" />
            Modifier le cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations de votre cabinet d'ostéopathie
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations générales
                </h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Nom du cabinet</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                            <Input className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500" placeholder="Nom du cabinet" {...field} />
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
                        <FormLabel className="text-gray-700 dark:text-gray-300">Adresse</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                            <Input className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500" placeholder="Adresse complète" {...field} />
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
                        <FormLabel className="text-gray-700 dark:text-gray-300">Numéro de téléphone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                            <Input className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500" placeholder="Numéro de téléphone" {...field} />
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
                        <FormLabel className="text-gray-700 dark:text-gray-300">Email (facultatif)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                            <Input className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500" placeholder="Email du cabinet" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm p-6">
                <ImageFields
                  form={form}
                  isSubmitting={isSaving}
                  previewImageUrl={previewImageUrl}
                  previewLogoUrl={previewLogoUrl}
                  setPreviewImageUrl={setPreviewImageUrl}
                  setPreviewLogoUrl={setPreviewLogoUrl}
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/cabinets")}
                  disabled={isSaving}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className="flex gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Save className="h-4 w-4" />
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
