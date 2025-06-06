
import { z } from "zod";

export const cabinetFormSchema = z.object({
  name: z.string().min(1, "Le nom du cabinet est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  osteopathId: z.number(),
  siret: z.string().optional(),
  adeliNumber: z.string().optional(),
  apeCode: z.string().optional(),
  stampUrl: z.string().optional(),
});

export type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

export interface CabinetFormProps {
  defaultValues?: Partial<CabinetFormValues>;
  cabinetId?: number;
  isEditing?: boolean;
  osteopathId: number;
  onSuccess?: () => void;
}
