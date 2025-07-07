export interface PatientRelationship {
  id: number;
  patient_id: number;
  related_patient_id: number;
  relationship_type: string;
  relationship_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Informations du patient lié (chargées via jointure)
  related_patient?: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate?: string | null;
    gender?: string | null;
  };
}

export interface CreatePatientRelationshipPayload {
  patient_id: number;
  related_patient_id: number;
  relationship_type: string;
  relationship_notes?: string | null;
}

export const RELATIONSHIP_TYPES = [
  "Père",
  "Mère", 
  "Fils",
  "Fille",
  "Frère",
  "Sœur",
  "Conjoint(e)",
  "Grand-père",
  "Grand-mère",
  "Petit-fils",
  "Petite-fille",
  "Oncle",
  "Tante",
  "Neveu",
  "Nièce",
  "Cousin",
  "Cousine",
  "Autre"
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number];