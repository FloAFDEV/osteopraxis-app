import { useState, useEffect } from "react";
import { Building, Phone, MapPin, Save, Mail, Image, FileImage, FileText, CreditCard } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Cabinet } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const CabinetSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      imageUrl: "",
      logoUrl: "",
      siret: "",
      rppsNumber: "",
      apeCode: ""
    }
  });

  useEffect(() => {
    const fetchCabinet = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log("Chargement des cabinets pour l'utilisateur:", user.id);
        
        // Utiliser la méthode getCabinetsByUserId directement
        const cabinets = await api.getCabinetsByUserId(user.id);
        console.log("Cabinets récupérés:", cabinets);
        
        if (cabinets && cabinets.length > 0) {
          const primaryCabinet = cabinets[0]; // Use the first cabinet as primary
          console.log("Cabinet principal trouvé:", primaryCabinet);
          setCabinet(primaryCabinet);
          
          // Récupérer les données de l'ostéopathe pour les infos de facturation
          if (primaryCabinet.osteopathId) {
            const osteopath = await api.getOsteopathById(primaryCabinet.osteopathId);
            
            form.reset({
              name: primaryCabinet.name || "",
              address: primaryCabinet.address || "",
              phone: primaryCabinet.phone || "",
              email: primaryCabinet.email || "",
              imageUrl: primaryCabinet.imageUrl || "",
              logoUrl: primaryCabinet.logoUrl || "",
              siret: osteopath?.siret || "",
              rppsNumber: osteopath?.rpps_number || "",
              apeCode: osteopath?.ape_code || "8690F"
            });
          } else {
            form.reset({
              name: primaryCabinet.name || "",
              address: primaryCabinet.address || "",
              phone: primaryCabinet.phone || "",
              email: primaryCabinet.email || "",
              imageUrl: primaryCabinet.imageUrl || "",
              logoUrl: primaryCabinet.logoUrl || "",
              siret: "",
              rppsNumber: "",
              apeCode: "8690F"
            });
          }
        } else {
          console.log("Aucun cabinet trouvé pour l'utilisateur");
        }
      } catch (error) {
        console.error("Error fetching cabinet:", error);
        toast.error("Impossible de charger les informations du cabinet.");
      } finally {
        setLoading(false);
      }
    };

    fetchCabinet();
  }, [form, user]);

  const onSubmit = async (data: { 
    name: string; 
    address: string; 
    phone: string; 
    email: string; 
    imageUrl: string; 
    logoUrl: string;
    siret: string;
    rppsNumber: string;
    apeCode: string;
  }) => {
    if (!cabinet || !user?.id) return;
    
    try {
      setIsSaving(true);
      
      // Mettre à jour le cabinet
      const updatedCabinet = await api.updateCabinet(cabinet.id, {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
        logoUrl: data.logoUrl || null
      });
      
      // Récupérer l'ostéopathe associé
      const osteopath = await api.getOsteopathByUserId(user.id);
      
      if (osteopath) {
        // Mettre à jour l'ostéopathe avec les infos de facturation
        await api.updateOsteopath(osteopath.id, {
          siret: data.siret || null,
          rpps_number: data.rppsNumber || null,
          ape_code: data.apeCode || "8690F"
        });
      }
      
      if (updatedCabinet) {
        setCabinet(updatedCabinet);
        toast.success("Informations du cabinet mises à jour");
      }
    } catch (error) {
      console.error("Error updating cabinet:", error);
      toast.error("Échec de la mise à jour des informations du cabinet");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Paramètres du cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les informations de votre cabinet d'ostéopathie
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des informations...</p>
            </div>
          </div>
        ) : !cabinet ? (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
            <p className="text-amber-800 dark:text-amber-300 mb-4">
              Vous n'avez pas encore de cabinet configuré.
            </p>
            <Button asChild>
              <a href="/cabinets/new">Créer un cabinet</a>
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold mb-2">Informations générales</h2>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du cabinet</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Email du cabinet" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold mb-2">Informations de facturation</h2>
                  
                  <FormField
                    control={form.control}
                    name="siret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro SIRET</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Numéro SIRET" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Numéro SIRET nécessaire pour la facturation
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rppsNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro RPPS</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Numéro RPPS" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Numéro RPPS (Répertoire Partagé des Professionnels de Santé) nécessaire pour la facturation
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="apeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code APE</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Code APE (par défaut: 8690F)" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Code APE/NAF de votre activité (par défaut: 8690F pour les activités de santé humaine)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Images</h2>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de l'image (facultatif)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="URL de l'image du cabinet" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          URL d'une image représentant votre cabinet (façade ou intérieur)
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL du logo (facultatif)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileImage className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="URL du logo du cabinet" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          URL de votre logo professionnel
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="flex gap-2" disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CabinetSettingsPage;
