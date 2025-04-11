
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom complet est requis"),
  professional_title: z.string().default("Ostéopathe D.O."),
  adeli_number: z.string().min(1, "Le numéro ADELI est requis"),
  siret: z.string().optional(),
  ape_code: z.string().default("8690F"),
  cabinet_name: z.string().min(2, "Le nom du cabinet est requis"),
  cabinet_address: z.string().min(5, "L'adresse du cabinet est requise"),
  cabinet_email: z.string().email("Email invalide").optional().nullable(),
  cabinet_phone: z.string().min(8, "Le numéro de téléphone est requis"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const OsteopathProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [existingCabinet, setExistingCabinet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      professional_title: "Ostéopathe D.O.",
      adeli_number: "",
      siret: "",
      ape_code: "8690F",
      cabinet_name: "",
      cabinet_address: "",
      cabinet_email: "",
      cabinet_phone: "",
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Check if user already has an osteopath profile
        if (user.osteopathId) {
          const osteopath = await api.getOsteopathById(user.osteopathId);
          if (osteopath) {
            setExistingProfile(osteopath);
            
            // Get cabinet information
            const cabinets = await api.getCabinetsByOsteopathId(user.osteopathId);
            if (cabinets && cabinets.length > 0) {
              setExistingCabinet(cabinets[0]);
              
              // Set form values with existing data
              form.reset({
                name: osteopath.name || "",
                professional_title: osteopath.professional_title || "Ostéopathe D.O.",
                adeli_number: osteopath.adeli_number || "",
                siret: osteopath.siret || "",
                ape_code: osteopath.ape_code || "8690F",
                cabinet_name: cabinets[0].name || "",
                cabinet_address: cabinets[0].address || "",
                cabinet_email: cabinets[0].email || "",
                cabinet_phone: cabinets[0].phone || "",
              });
            }
          }
        } else if (user.first_name && user.last_name) {
          // Prefill name if available from user record
          form.setValue("name", `${user.first_name} ${user.last_name}`.trim());
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Impossible de charger vos informations");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, navigate, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      let osteopathId = user.osteopathId;
      let cabinetId;

      // Create or update osteopath profile
      if (!osteopathId) {
        // Create new osteopath
        const osteopathData = {
          name: data.name,
          userId: user.id,
          professional_title: data.professional_title,
          adeli_number: data.adeli_number,
          siret: data.siret || null,
          ape_code: data.ape_code
        };
        
        const newOsteopath = await api.createOsteopath(osteopathData);
        osteopathId = newOsteopath.id;
        
        // Update user record with osteopathId
        await api.updateUserOsteopathId(user.id, newOsteopath.id);
      } else {
        // Update existing osteopath
        await api.updateOsteopath(osteopathId, {
          name: data.name,
          professional_title: data.professional_title,
          adeli_number: data.adeli_number,
          siret: data.siret || null,
          ape_code: data.ape_code
        });
      }

      // Create or update cabinet
      if (existingCabinet) {
        cabinetId = existingCabinet.id;
        await api.updateCabinet(cabinetId, {
          name: data.cabinet_name,
          address: data.cabinet_address,
          email: data.cabinet_email || null,
          phone: data.cabinet_phone,
        });
      } else {
        const cabinetData = {
          name: data.cabinet_name,
          address: data.cabinet_address,
          email: data.cabinet_email || null,
          phone: data.cabinet_phone,
          osteopathId: osteopathId,
          imageUrl: null,
          logoUrl: null
        };
        
        const newCabinet = await api.createCabinet(cabinetData);
        cabinetId = newCabinet.id;
      }

      toast.success("Profil mis à jour avec succès");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de votre profil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <User className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">
              {existingProfile ? "Modifier votre profil professionnel" : "Compléter votre profil professionnel"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Renseignez vos informations professionnelles pour pouvoir commencer à utiliser l'application
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Coordonnées du praticien</CardTitle>
                <CardDescription>Vos informations personnelles et professionnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom et prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professional_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre professionnel</FormLabel>
                      <FormControl>
                        <Input placeholder="Ostéopathe D.O." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adeli_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro ADELI (obligatoire)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Identifiants légaux</CardTitle>
                <CardDescription>Vos informations administratives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro SIRET</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901234" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ape_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code APE/NAF</FormLabel>
                      <FormControl>
                        <Input placeholder="8690F" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Cabinet</CardTitle>
                <CardDescription>Informations sur votre lieu d'exercice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cabinet_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du cabinet</FormLabel>
                      <FormControl>
                        <Input placeholder="Cabinet d'ostéopathie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cabinet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse du cabinet</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 rue de la Santé, 75000 Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cabinet_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email du cabinet (facultatif)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@cabinet.fr" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cabinet_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone du cabinet</FormLabel>
                        <FormControl>
                          <Input placeholder="01 23 45 67 89" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default OsteopathProfilePage;
