
import { z } from "zod";

export const cabinetFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères",
  }),
  phone: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  imageUrl: z.string().url("Format d'URL invalide").optional().or(z.literal("")),
  logoUrl: z.string().url("Format d'URL invalide").optional().or(z.literal("")),
  osteopathId: z.number(),
  siret: z.string().optional().or(z.literal("")),
  adeliNumber: z.string().optional().or(z.literal("")),
  apeCode: z.string().optional().or(z.literal("")),
});

export type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

export interface CabinetFormProps {
  defaultValues?: Partial<CabinetFormValues>;
  cabinetId?: number;
  isEditing?: boolean;
  osteopathId: number;
  onSuccess?: () => void;
}
