import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Patient } from "@/types";
import { differenceInYears, format, parseISO } from "date-fns";
import {
	Baby,
	Mail,
	MapPin,
	Phone,
	User,
	UserCheck,
	UserCircle,
	Users,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PatientCardProps {
	patient: Patient;
	showDetailsButton?: boolean;
}

export function PatientCard({
	patient,
	showDetailsButton = true,
}: PatientCardProps) {
	// Calculer l'âge uniquement si birthDate est défini
	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	// Déterminer si le patient est un enfant (moins de 18 ans)
	const isChild = age !== null && age < 12;

	const getInitials = (firstName?: string, lastName?: string) => {
		const firstInitial = firstName
			? firstName.charAt(0).toUpperCase()
			: "?";
		const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "?";
		return `${firstInitial}${lastInitial}`;
	};

	// Définir les couleurs en fonction du genre avec des variantes plus subtiles
	const getGenderColors = (gender?: string) => {
		switch (gender) {
			case "Homme":
				return {
					badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
					avatar: "bg-blue-500 text-white",
					border: "border-blue-500",
					icon: <UserCheck className="ml-1 h-4 w-4 text-blue-600" />,
				};
			case "Femme":
				return {
					badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
					avatar: "bg-pink-500 text-white",
					border: "border-pink-500",
					icon: <UserCircle className="ml-1 h-4 w-4 text-pink-600" />,
				};
			default:
				return {
					badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
					avatar: "bg-purple-500 text-white",
					border: "border-purple-500",
					icon: <Users className="ml-1 h-4 w-4 text-purple-600" />,
				};
		}
	};

	const genderColors = getGenderColors(patient.gender);

	return (
		<Card
			className="overflow-hidden transition-all duration-200 border-t-4 h-full hover:shadow-lg hover:scale-[1.02] flex flex-col"
			style={{
				borderTopColor:
					patient.gender === "Homme"
						? "#2563eb"
						: patient.gender === "Femme"
						? "#ec4899"
						: "#6b7280",
			}}
		>
			<CardContent className="p-6 flex-grow">
				<div className="flex gap-4">
					<Avatar className="h-16 w-16 shadow-sm">
						{patient.avatarUrl ? (
							<img
								src={patient.avatarUrl}
								alt={`${patient.firstName} ${patient.lastName}`}
							/>
						) : (
							<AvatarFallback
								className={`text-lg ${genderColors.avatar}`}
							>
								{getInitials(
									patient.firstName,
									patient.lastName
								)}
							</AvatarFallback>
						)}
					</Avatar>

					<div className="space-y-1 flex-1 min-w-0">
						<h3 className="text-xl font-semibold truncate flex items-center">
							{patient.lastName} {patient.firstName}
							{genderColors.icon}
						</h3>

						<div className="flex items-center gap-2 flex-wrap">
							{patient.gender && (
								<Badge
									variant="outline"
									className={`${genderColors.badge} font-medium`}
								>
									{patient.gender}
								</Badge>
							)}

							{age !== null && (
								<Badge
									variant="outline"
									className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 font-medium"
								>
									{age} ans
								</Badge>
							)}
						</div>

						{patient.occupation && (
							<p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
								{patient.occupation}
							</p>
						)}
					</div>
				</div>

				<div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 border-t pt-4 border-gray-100 dark:border-gray-800">
					{patient.address && (
						<div className="flex items-center gap-2 text-sm">
							<MapPin className="h-4 w-4 icon-amber flex-shrink-0" />
							<span className="truncate">{patient.address}</span>
						</div>
					)}

					{patient.phone && (
						<div className="flex items-center gap-2 text-sm">
							<Phone className="h-4 w-4 icon-green flex-shrink-0" />
							<a
								href={`tel:${patient.phone}`}
								className="truncate hover:text-blue-600 hover:underline transition-colors"
							>
								{patient.phone}
							</a>
						</div>
					)}

					{patient.email && (
						<div className="flex items-center gap-2 text-sm">
							<Mail className="h-4 w-4 icon-blue flex-shrink-0" />
							<a
								href={`mailto:${patient.email}`}
								className="truncate hover:text-blue-600 hover:underline transition-colors"
							>
								{patient.email}
							</a>
						</div>
					)}

					{patient.birthDate && (
						<div className="flex items-center gap-2 text-sm">
							<User className="h-4 w-4 icon-purple flex-shrink-0" />
							<span className="truncate">
								Né(e) le{" "}
								{format(
									parseISO(patient.birthDate),
									"dd/MM/yyyy"
								)}
							</span>
							<span>
								{/* Si c'est un enfant, ajouter l'icône */}
								{isChild && (
									<div className="ml-1 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
										<Baby className="h-5 w-5 text-emerald-600" />
										<span>Enfant</span>
									</div>
								)}
							</span>
						</div>
					)}
				</div>
			</CardContent>

			{showDetailsButton && (
				<CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
					<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
						<Button
							asChild
							variant="default"
							size="sm"
							className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							<Link to={`/patients/${patient.id}`}>
								Voir le dossier
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="sm"
							className="w-full dark:border-gray-600 dark:hover:bg-gray-800"
						>
							<Link to={`/patients/${patient.id}/edit`}>
								Modifier
							</Link>
						</Button>
					</div>
				</CardFooter>
			)}
		</Card>
	);
}
