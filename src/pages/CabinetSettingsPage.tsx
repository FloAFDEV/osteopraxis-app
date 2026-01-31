
import { useState, useEffect } from "react";
import { Building, Phone, MapPin, Save, Mail, Image, FileImage, FileText, Lightbulb } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Cabinet } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { BackButton } from "@/components/ui/back-button";
import { Link } from "react-router-dom";
import { useCabinets } from "@/hooks/useCabinets";

const CabinetSettingsPage = () => {
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { isDemoMode } = useDemo();
  const { data: cabinets, isLoading: loading, error } = useCabinets();

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
    if (error) {
      console.error("Error fetching cabinets:", error);
      toast.error("Impossible de charger les informations du cabinet.");
      return;
    }

    if (!loading && cabinets && cabinets.length > 0) {
      // Prendre le premier cabinet trouvé
      const primaryCabinet = cabinets[0];
      console.log("Cabinet principal trouvé:", primaryCabinet);
      setCabinet(primaryCabinet);
      
      form.reset({
        name: primaryCabinet.name || "",
        address: primaryCabinet.address || "",
        phone: primaryCabinet.phone || "",
        email: primaryCabinet.email || "",
        imageUrl: primaryCabinet.imageUrl || ""
      });
    } else if (!loading) {
      console.log("Aucun cabinet trouvé");
    }
  }, [cabinets, loading, error, form]);

  const onSubmit = async (data: { 
    name: string; 
    address: string; 
    phone: string; 
    email: string; 
    imageUrl: string;
  }) => {
    if (!cabinet || !user?.id) return;
    
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
        <BackButton to="/settings" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Paramètres du cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            {isDemoMode ? "Informations du cabinet (mode démo)" : "Gérez les informations de votre cabinet d'ostéopathie"}
          </p>
          {isDemoMode ? (
            <p className="text-sm text-muted-foreground mt-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <FileText className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span><strong>Mode démo :</strong> Les paramètres du cabinet sont en lecture seule.
              Connectez-vous pour modifier vos informations.</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Astuce :</strong> Les informations professionnelles et de facturation se trouvent dans
              <strong> Paramètres → Profil & Facturation</strong>.</span>
            </p>
          )}
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
              <Link to="/cabinets/new">Créer un cabinet</Link>
            </Button>
          </div>
        ) : (
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
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              className="pl-10" 
                              placeholder="Nom du cabinet" 
                              disabled={isDemoMode}
                              {...field} 
                            />
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
                            <Input 
                              className="pl-10" 
                              placeholder="Adresse complète" 
                              disabled={isDemoMode}
                              {...field} 
                            />
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
                            <Input 
                              className="pl-10" 
                              placeholder="Numéro de téléphone" 
                              disabled={isDemoMode}
                              {...field} 
                            />
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
                            <Input 
                              className="pl-10" 
                              placeholder="Email du cabinet" 
                              disabled={isDemoMode}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Image du cabinet</h3>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de l'image (facultatif)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                className="pl-10" 
                                placeholder="URL de l'image du cabinet" 
                                disabled={isDemoMode}
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            URL d'une image représentant votre cabinet (façade ou intérieur)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="flex gap-2" disabled={isSaving || isDemoMode}>
                  <Save className="h-4 w-4" />
                  {isDemoMode ? "Modification non autorisée (mode démo)" : 
                   isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
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
