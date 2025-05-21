
import { Cabinet } from "@/types";

// Define a more focused type for cabinet updates to avoid deep type instantiation
export type CabinetUpdateInput = {
  name?: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  osteopathId?: number;
  updatedAt?: string;
};

export type CabinetCreateInput = {
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  osteopathId: number;
  // Optional fields that can be provided
  siret?: string | null;
  city?: string | null;
  postalCode?: string | null;
  iban?: string | null;
  bic?: string | null;
  country?: string | null;
};
