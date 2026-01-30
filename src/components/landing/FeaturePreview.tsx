import { Calendar, Clock, User, FileText, Euro, CheckCircle } from "lucide-react";

interface FeaturePreviewProps {
  type: "calendar" | "patient" | "invoice";
  className?: string;
}

/**
 * Composant de preview stylisé pour illustrer les fonctionnalités
 * Affiche un mockup visuel de l'interface correspondante
 */
export function FeaturePreview({ type, className = "" }: FeaturePreviewProps) {
  const baseClasses = `
    relative rounded-lg border bg-card shadow-sm overflow-hidden
    transition-transform duration-300 hover:shadow-md
    ${className}
  `;

  if (type === "calendar") {
    return (
      <div className={baseClasses} role="img" aria-label="Aperçu du calendrier de rendez-vous">
        <div className="bg-primary/10 px-3 py-2 border-b flex items-center justify-between">
          <span className="text-xs font-medium text-primary">Janvier 2026</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
          </div>
        </div>
        <div className="p-2 space-y-1.5">
          {/* Ligne de jours */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
              <span key={i} className="text-[10px] text-muted-foreground font-medium">
                {day}
              </span>
            ))}
          </div>
          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-0.5">
            {[...Array(28)].map((_, i) => (
              <div
                key={i}
                className={`
                  aspect-square rounded-sm flex items-center justify-center text-[10px]
                  ${i === 14 ? "bg-primary text-primary-foreground font-bold" : ""}
                  ${[3, 8, 17, 22].includes(i) ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : ""}
                  ${![3, 8, 14, 17, 22].includes(i) ? "text-muted-foreground" : ""}
                `}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {/* RDV du jour */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-primary/10 text-[10px]">
              <Clock className="h-3 w-3 text-primary" />
              <span className="font-medium">9h00</span>
              <span className="text-muted-foreground truncate">M. Dupont</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-[10px]">
              <Clock className="h-3 w-3 text-emerald-600" />
              <span className="font-medium">14h30</span>
              <span className="text-muted-foreground truncate">Mme Martin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "patient") {
    return (
      <div className={baseClasses} role="img" aria-label="Aperçu d'une fiche patient">
        <div className="bg-primary/10 px-3 py-2 border-b flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Fiche Patient</span>
        </div>
        <div className="p-3 space-y-3">
          {/* Avatar et nom */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">JD</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Jean Dupont</p>
              <p className="text-[10px] text-muted-foreground">42 ans • Homme</p>
            </div>
          </div>
          {/* Infos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Téléphone</span>
              <span className="font-medium">06 12 34 56 78</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium truncate max-w-[100px]">jean.d@email.fr</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Consultations</span>
              <span className="font-medium text-primary">12</span>
            </div>
          </div>
          {/* Badge */}
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            <span>Dossier complet</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "invoice") {
    return (
      <div className={baseClasses} role="img" aria-label="Aperçu d'une facture">
        <div className="bg-primary/10 px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Facture</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">#2026-042</span>
        </div>
        <div className="p-3 space-y-3">
          {/* En-tête facture */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-muted-foreground">Patient</p>
              <p className="text-xs font-medium">Marie Martin</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Date</p>
              <p className="text-xs font-medium">30/01/2026</p>
            </div>
          </div>
          {/* Ligne de prestation */}
          <div className="border rounded p-2 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span>Consultation ostéopathie</span>
              <span className="font-medium">60,00 €</span>
            </div>
            <div className="border-t pt-1.5 flex justify-between text-xs font-semibold">
              <span>Total TTC</span>
              <span className="text-primary">60,00 €</span>
            </div>
          </div>
          {/* Statut */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              <Euro className="h-2.5 w-2.5" />
              Payée
            </span>
            <span className="text-[10px] text-muted-foreground">PDF généré</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
