import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Baby } from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface PatientBadgeProps {
  firstName: string;
  lastName: string;
  gender?: 'M' | 'F' | 'OTHER' | 'UNKNOWN' | null;
  birthDate?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showGenderBadge?: boolean;
  className?: string;
}

export function PatientBadge({
  firstName,
  lastName,
  gender,
  birthDate,
  photoUrl,
  size = 'md',
  showGenderBadge = true,
  className
}: PatientBadgeProps) {
  // Calculer l'âge
  const age = birthDate ? differenceInYears(new Date(), parseISO(birthDate)) : null;
  const isChild = age !== null && age < 18;

  // Générer les initiales
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Couleur du badge selon le genre et l'âge
  // Mineur : Vert | Homme : Bleu médical | Femme : Rose
  const getBadgeColor = () => {
    if (isChild) {
      // Vert pour les mineurs
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
    if (gender === 'M') {
      // Bleu médical professionnel (pas Bootstrap)
      return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-300';
    }
    if (gender === 'F') {
      // Rose pour les femmes
      return 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
  };

  // Couleur de l'avatar selon le genre
  const getAvatarColor = () => {
    if (isChild) {
      return 'bg-emerald-200 text-emerald-800';
    }
    if (gender === 'M') {
      // Bleu médical
      return 'bg-sky-200 text-sky-800';
    }
    if (gender === 'F') {
      // Rose
      return 'bg-pink-200 text-pink-800';
    }
    return 'bg-gray-200 text-gray-800';
  };

  // Taille de l'avatar
  const avatarSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={avatarSize}>
        {photoUrl && <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />}
        <AvatarFallback className={getAvatarColor()}>
          {isChild && <Baby className="h-4 w-4 mr-0.5" />}
          {initials}
        </AvatarFallback>
      </Avatar>

      {showGenderBadge && (
        <Badge variant="outline" className={cn("text-xs font-medium", getBadgeColor())}>
          {isChild && (
            <>
              <Baby className="h-3 w-3 mr-1" />
              Mineur
            </>
          )}
          {!isChild && gender === 'M' && 'Homme'}
          {!isChild && gender === 'F' && 'Femme'}
          {!isChild && (!gender || gender === 'OTHER' || gender === 'UNKNOWN') && 'Non spécifié'}
        </Badge>
      )}
    </div>
  );
}
