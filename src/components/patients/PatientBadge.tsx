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

  // Couleur du badge selon le genre et l'âge (couleurs du graphique dashboard)
  const getBadgeColor = () => {
    if (isChild) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
    if (gender === 'M') {
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
    }
    if (gender === 'F') {
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
  };

  // Couleur de l'avatar selon le genre (couleurs du graphique dashboard)
  const getAvatarColor = () => {
    if (isChild) {
      return 'bg-emerald-200 text-emerald-800';
    }
    if (gender === 'M') {
      return 'bg-blue-200 text-blue-800';
    }
    if (gender === 'F') {
      return 'bg-purple-200 text-purple-800';
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
