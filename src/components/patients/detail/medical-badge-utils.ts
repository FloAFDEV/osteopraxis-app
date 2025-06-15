
// Utilitaire pour détecter "Critique" (cardiaque) ou "Important" (liste)
export const importantFields = [
  "Antécédents médicaux familiaux",
  "Antécédents pulmonaires",
  "Antécédents de traumatismes",
  "Traumatismes",
  "Fractures",
  "Chirurgies",
];

export function isCardiac(label: string, value: any): boolean {
  const lowerLabel = (label || "").toLowerCase();
  const lowerValue = (value || "").toLowerCase?.() ?? String(value || "").toLowerCase();
  return (
    lowerLabel.includes("cardiaque") ||
    lowerLabel.includes("cardio") ||
    lowerValue.includes("cardiaque") ||
    lowerValue.includes("cardio") ||
    lowerLabel.includes("cœur") ||
    lowerLabel.includes("coeur") ||
    lowerValue.includes("cœur") ||
    lowerValue.includes("coeur")
  );
}

// Retourne le badge associé, ou null si rien à afficher.
// Ne badge PAS si la valeur est vide/Non renseigné pour les champs importants (même si cardiaque)
export function getMedicalBadge(label: string, value: any): "critical" | "important" | null {
  const isCrit = isCardiac(label, value);
  if (isCrit && value && !["", "-", "non", "aucun", "non renseigné", "null"].includes(String(value).trim().toLowerCase())) {
    return "critical";
  }
  if (
    importantFields.includes(label) &&
    value &&
    !isCrit &&
    !["", "-", "non", "aucun", "non renseigné", "null"].includes(String(value).trim().toLowerCase())
  ) {
    return "important";
  }
  return null;
}
