import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Baby } from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface PatientBadgeProps {
	firstName: string;
	lastName: string;
	gender?: "M" | "F" | "OTHER" | "UNKNOWN" | null;
	birthDate?: string | null;
	photoUrl?: string | null;
	size?: "sm" | "md" | "lg";
	showGenderBadge?: boolean;
	className?: string;
}

export function PatientBadge({
	firstName,
	lastName,
	gender,
	birthDate,
	photoUrl,
	size = "md",
	showGenderBadge = true,
	className,
}: PatientBadgeProps) {
	// Calculer l'âge
	const age = birthDate
		? differenceInYears(new Date(), parseISO(birthDate))
		: null;
	const isChild = age !== null && age < 18;

	// Générer les initiales
	const initials =
		`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

	// Couleur du badge selon le genre et l'âge
	// Mineur : Vert doux | Homme : Bleu médical | Femme : Rose poudré
	const getBadgeColor = () => {
		if (isChild) {
			// Vert doux pour les mineurs (moins saturé, plus professionnel)
			return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400";
		}
		if (gender === "M") {
			// Bleu médical professionnel (nuancé)
			return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
		}
		if (gender === "F") {
			// Rose poudré pour les femmes (moins saturé, plus élégant)
			return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400";
		}
		return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
	};

	// Couleur de l'avatar selon le genre
	const getAvatarColor = () => {
		if (isChild) {
			return "bg-teal-100 text-teal-700";
		}
		if (gender === "M") {
			// Bleu médical
			return "bg-blue-100 text-blue-700";
		}
		if (gender === "F") {
			// Rose poudré
			return "bg-rose-100 text-rose-700";
		}
		return "bg-gray-200 text-gray-800";
	};

	// Taille de l'avatar
	const avatarSize = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12",
	}[size];

	const textSize = {
		sm: "text-sm",
		md: "text-sm",
		lg: "text-base",
	}[size];

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Avatar className={avatarSize}>
				{photoUrl && (
					<AvatarImage
						src={photoUrl}
						alt={`${firstName} ${lastName}`}
					/>
				)}
				<AvatarFallback className={getAvatarColor()}>
					{isChild && <Baby className="h-4 w-4 mr-0.5" />}
					{initials}
				</AvatarFallback>
			</Avatar>

			{showGenderBadge && (
				<Badge
					variant="outline"
					className={cn("text-sm font-medium", getBadgeColor())}
				>
					{isChild && (
						<>
							<Baby className="h-3 w-3 mr-1" />
							Mineur
						</>
					)}
					{!isChild && gender === "M" && "Homme"}
					{!isChild && gender === "F" && "Femme"}
					{!isChild &&
						(!gender ||
							gender === "OTHER" ||
							gender === "UNKNOWN") &&
						"Non spécifié"}
				</Badge>
			)}
		</div>
	);
}
