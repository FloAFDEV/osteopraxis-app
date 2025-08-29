
import { z } from "zod";

// Schéma de validation conditionnel selon le mode
export const createCabinetFormSchema = (isDemoMode: boolean = false) => z.object({
  name: z.string().min(1, "Le nom du cabinet est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  osteopathId: z.number(),
  siret: isDemoMode ? z.string().optional() : z.string().min(1, "Le numéro SIRET est requis"),
  rppsNumber: isDemoMode ? z.string().optional() : z.string().min(1, "Le numéro RPPS est requis"),
  apeCode: isDemoMode ? z.string().optional() : z.string().min(1, "Le code APE est requis"),
  stampUrl: z.string().optional(),
});

// Schéma par défaut pour la compatibilité
export const cabinetFormSchema = createCabinetFormSchema(false);

export type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

export interface CabinetFormProps {
  defaultValues?: Partial<CabinetFormValues>;
  cabinetId?: number;
  isEditing?: boolean;
  osteopathId: number;
  onSuccess?: () => void;
}
