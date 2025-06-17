import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import {
	Activity,
	Baby,
	Calendar,
	Mail,
	MapPin,
	Phone,
	Ruler,
	User,
	Users,
	Weight,
	Briefcase,
	Heart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PatientQuickActions } from "@/components/patients/PatientQuickActions";

interface PatientCardProps {
	patient: Patient;
	compact?: boolean;
}

export function PatientCard({ patient, compact = false }: PatientCardProps) {
	const navigate = useNavigate();

	// Calcul exact de l'âge en années
	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	// Mineur = age < 18
	const isMinor = age !== null && age < 18;

	// Déterminer la couleur et l'icône en fonction du genre
	const getAvatarColor = () => {
		switch (patient.gender) {
			case "Homme":
				return {
					background: "bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300",
					icon: <User className="h-6 w-6 text-blue-600" />,
				};
			case "Femme":
				return {
					background: "bg-gradient-to-br from-pink-100 to-pink-200 border border-pink-300",
					icon: <Heart className="h-6 w-6 text-pink-600" />,
				};
			default:
				return {
					background: "bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300",
					icon: <Users className="h-6 w-6 text-purple-600" />,
				};
		}
	};

	const avatarStyle = getAvatarColor();

	const handleCardClick = (e: React.MouseEvent) => {
		// Éviter la navigation si on clique sur un bouton ou lien
		if ((e.target as HTMLElement).closest('a, button')) {
			return;
		}
		navigate(`/patients/${patient.id}`);
	};

	if (compact) {
		return (
			<Card 
				className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
				onClick={handleCardClick}
			>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Avatar className={`${avatarStyle.background} h-10 w-10`}>
								{patient.avatarUrl ? (
									<AvatarImage
										src={patient.avatarUrl}
										alt={`${patient.firstName} ${patient.lastName}`}
									/>
								) : (
									<AvatarFallback className={avatarStyle.background}>
										{avatarStyle.icon}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-lg leading-tight truncate">
									{patient.lastName} {patient.firstName}
								</h3>
								<div className="flex items-center gap-2 mt-1">
									{age !== null && (
										<span className="text-sm text-gray-500">
											{age} ans
										</span>
									)}
									{isMinor && (
										<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
											<Baby className="h-3 w-3 mr-1" />
											Mineur
										</Badge>
									)}
								</div>
							</div>
						</div>
						<PatientQuickActions patient={patient} variant="compact" />
					</div>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card
			className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
			onClick={handleCardClick}
		>
			<CardHeader className="pb-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						<Avatar className={`${avatarStyle.background} h-12 w-12 transition-transform group-hover:scale-105`}>
							{patient.avatarUrl ? (
								<AvatarImage
									src={patient.avatarUrl}
									alt={`${patient.firstName} ${patient.lastName}`}
								/>
							) : (
								<AvatarFallback className={avatarStyle.background}>
									{avatarStyle.icon}
								</AvatarFallback>
							)}
						</Avatar>
						<div>
							<h3 className="font-semibold text-xl leading-tight mb-1">
								{patient.lastName} {patient.firstName}
							</h3>
							<div className="flex items-center gap-2 flex-wrap">
								{age !== null && (
									<span className="text-sm text-gray-500">
										{age} ans
									</span>
								)}
								{isMinor && (
									<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
										<Baby className="h-4 w-4 mr-1" />
										Mineur
									</Badge>
								)}
								{patient.gender && (
									<Badge variant="outline" className="text-xs">
										{patient.gender}
									</Badge>
								)}
							</div>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Section Santé */}
				{(patient.weight || patient.height || patient.bmi) && (
					<div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
						<h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2 flex items-center">
							<Activity className="h-4 w-4 mr-1" />
							Données de santé
						</h4>
						<div className="grid grid-cols-3 gap-2 text-sm">
							{patient.weight && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Weight className="h-3 w-3 mr-1 text-blue-600" />
									{patient.weight} kg
								</div>
							)}
							{patient.height && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Ruler className="h-3 w-3 mr-1 text-blue-600" />
									{patient.height} cm
								</div>
							)}
							{patient.bmi && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Activity className="h-3 w-3 mr-1 text-blue-600" />
									IMC {patient.bmi}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Section Contact */}
				{(patient.email || patient.phone || patient.address) && (
					<div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
						<h4 className="font-medium text-sm text-green-800 dark:text-green-200 mb-2 flex items-center">
							<Phone className="h-4 w-4 mr-1" />
							Contact
						</h4>
						<div className="space-y-1 text-sm">
							{patient.email && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Mail className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
									<a
										href={`mailto:${patient.email}`}
										className="hover:underline hover:text-green-800 dark:hover:text-green-300 transition-colors truncate"
										onClick={(e) => e.stopPropagation()}
									>
										{patient.email}
									</a>
								</div>
							)}
							{patient.phone && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Phone className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
									<a
										href={`tel:${patient.phone}`}
										className="hover:underline hover:text-green-800 dark:hover:text-green-300 transition-colors"
										onClick={(e) => e.stopPropagation()}
									>
										{patient.phone}
									</a>
								</div>
							)}
							{patient.address && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<MapPin className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
									<span className="truncate">{patient.address}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Section Informations supplémentaires */}
				{(patient.birthDate || patient.occupation) && (
					<div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
						<h4 className="font-medium text-sm text-amber-800 dark:text-amber-200 mb-2 flex items-center">
							<Calendar className="h-4 w-4 mr-1" />
							Informations
						</h4>
						<div className="space-y-1 text-sm">
							{patient.birthDate && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Calendar className="h-3 w-3 mr-2 text-amber-600 flex-shrink-0" />
									{new Date(patient.birthDate).toLocaleDateString("fr-FR")}
								</div>
							)}
							{patient.occupation && (
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<Briefcase className="h-3 w-3 mr-2 text-amber-600 flex-shrink-0" />
									<span className="truncate italic">{patient.occupation}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Actions rapides */}
				<div className="pt-2 border-t">
					<div className="flex justify-between items-center">
						<PatientQuickActions patient={patient} />
						<Button
							variant="default"
							size="sm"
							className="bg-blue-600 hover:bg-blue-700 text-white"
							asChild
							onClick={(e) => e.stopPropagation()}
						>
							<Link to={`/patients/${patient.id}`}>Voir détails</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
