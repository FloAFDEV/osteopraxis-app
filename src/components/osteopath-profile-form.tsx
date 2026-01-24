
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const osteopathSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  professional_title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  adeli_number: z.string().min(2, {
    message: "Le numéro Adeli doit contenir au moins 2 caractères.",
  }),
  siret: z.string().min(14, {
    message: "Le numéro SIRET doit contenir 14 caractères.",
  }),
  ape_code: z.string().min(5, {
    message: "Le code APE doit contenir 5 caractères.",
  }),
});

interface OsteopathProfileFormProps {
  onProfileCreated?: (osteopath: any) => void;
  currentOsteopath?: any;
  setCurrentOsteopath?: any;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (updatedOsteopath: any) => Promise<void>;
  selectedPlan?: 'light' | 'full' | 'pro'; // Plan sélectionné par l'utilisateur
}

export function OsteopathProfileForm({
  onProfileCreated,
  currentOsteopath,
  setCurrentOsteopath,
  osteopathId,
  isEditing = false,
  onSuccess,
  selectedPlan = 'light' // Par défaut, le plan Light
}: OsteopathProfileFormProps) {
  const { user, isDemoMode } = useAuth();
  const [stampPreview, setStampPreview] = useState<string | null>(null);

  // Charger le tampon existant depuis localStorage (mode démo)
  useEffect(() => {
    if (isDemoMode) {
      const savedStamp = localStorage.getItem('demo_osteopath_stamp');
      if (savedStamp) {
        setStampPreview(savedStamp);
      }
    }
  }, [isDemoMode]);

  const form = useForm<z.infer<typeof osteopathSchema>>({
    resolver: zodResolver(osteopathSchema),
    defaultValues: {
      name: currentOsteopath?.name || "",
      professional_title: currentOsteopath?.professional_title || "Ostéopathe D.O.",
      adeli_number: currentOsteopath?.rpps_number || "",
      siret: currentOsteopath?.siret || "",
      ape_code: currentOsteopath?.ape_code || "8690F",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (currentOsteopath) {
      form.reset({
        name: currentOsteopath.name || "",
        professional_title: currentOsteopath.professional_title || "Ostéopathe D.O.",
        adeli_number: currentOsteopath.rpps_number || "",
        siret: currentOsteopath.siret || "",
        ape_code: currentOsteopath.ape_code || "8690F",
      });
    }
  }, [currentOsteopath, form]);

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast.error("Format non supporté. Utilisez PNG ou JPG uniquement.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setStampPreview(result);
      if (isDemoMode) {
        localStorage.setItem('demo_osteopath_stamp', result);
        toast.success("Tampon enregistré (mode démo)");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStamp = () => {
    setStampPreview(null);
    if (isDemoMode) {
      localStorage.removeItem('demo_osteopath_stamp');
      toast.success("Tampon supprimé");
    }
  };

  const onSubmit = async (data: z.infer<typeof osteopathSchema>) => {
    if (currentOsteopath || isEditing) {
      await updateOsteopathProfile(data);
    } else {
      await createOsteopathProfile(data);
    }
  };

  const updateOsteopathProfile = async (data: z.infer<typeof osteopathSchema>) => {
    try {
      // ✅ Mise à jour profil sécurisée

      const osteopathData = {
        name: data.name,
        professional_title: data.professional_title,
        rpps_number: data.adeli_number, // Map adeli_number to rpps_number
        siret: data.siret,
        ape_code: data.ape_code,
        userId: user?.id || "",
        authId: user?.id || "",
        plan: 'full' as const,
      };

      const updatedOsteopath = await api.updateOsteopath(osteopathId || currentOsteopath?.id, osteopathData);

      if (setCurrentOsteopath) {
        setCurrentOsteopath(updatedOsteopath);
      }

      if (onSuccess) {
        await onSuccess(updatedOsteopath);
      }

      toast.success("Profil ostéopathe mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil ostéopathe");
    }
  };

  const createOsteopathProfile = async (data: z.infer<typeof osteopathSchema>) => {
    try {
      // ✅ Création profil sécurisée
      
      const osteopathData = {
        name: data.name,
        professional_title: data.professional_title,
        rpps_number: data.adeli_number, // Map adeli_number to rpps_number
        siret: data.siret,
        ape_code: data.ape_code,
        userId: user?.id || "",
        authId: user?.id || "",
        plan: selectedPlan as 'light' | 'full' | 'pro', // Utiliser le plan sélectionné
      };

      const newOsteopath = await api.createOsteopath(osteopathData);
      
      if (setCurrentOsteopath) {
        setCurrentOsteopath(newOsteopath);
      }
      
      toast.success("Profil ostéopathe créé avec succès !");
      
      if (onProfileCreated) {
        onProfileCreated(newOsteopath);
      }
      
    } catch (error) {
      console.error("Erreur lors de la création du profil:", error);
      toast.error("Erreur lors de la création du profil ostéopathe");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" {...field} />
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
                <Input placeholder="Votre titre" {...field} />
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
              <FormLabel>Numéro RPPS</FormLabel>
              <FormControl>
                <Input placeholder="Votre numéro RPPS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="siret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro SIRET</FormLabel>
              <FormControl>
                <Input placeholder="Votre numéro SIRET" {...field} />
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
              <FormLabel>Code APE</FormLabel>
              <FormControl>
                <Input placeholder="Votre code APE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gestion du tampon professionnel en mode démo */}
        {isDemoMode && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Tampon professionnel
              </CardTitle>
              <CardDescription>
                Ajoutez votre tampon pour qu'il apparaisse sur vos factures (mode démo - stockage local)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!stampPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <label htmlFor="stamp-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Cliquez pour ajouter votre tampon
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG ou JPG, max 5MB
                    </p>
                    <input
                      id="stamp-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleStampUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={stampPreview}
                    alt="Tampon professionnel"
                    className="max-h-40 mx-auto border rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveStamp}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button type="submit" className="mt-6">
          {currentOsteopath || isEditing ? "Mettre à jour" : "Créer"}
        </Button>
      </form>
    </Form>
  );
}
