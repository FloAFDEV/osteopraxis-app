import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	UserRound,
	Users,
	Weight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface PatientCardProps {
	patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
	const navigate = useNavigate();

	// Calcul exact de l'âge en années comme dans PatientListItem
	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	// Vérification si c'est un enfant de moins de 12 ans
	const isChild = age !== null && age < 12;

	// Déterminer la couleur et l'icône en fonction du genre, comme dans PatientListItem
	const getAvatarColor = () => {
		switch (patient.gender) {
			case "Homme":
				return {
					background: "bg-blue-300 text-blue-600",
					icon: <User className="h-5 w-5 text-blue-600" />,
				};
			case "Femme":
				return {
					background: "bg-pink-300 text-pink-600",
					icon: <UserRound className="h-5 w-5 text-pink-600" />,
				};
			default:
				return {
					background: "bg-purple-200 text-purple-600",
					icon: <Users className="h-5 w-5 text-purple-600" />,
				};
		}
	};

	const avatarStyle = getAvatarColor();

	return (
		<Card
			className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
			onClick={() => navigate(`/patients/${patient.id}`)}
		>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						{/* Avatar avec couleur selon le genre */}
						<Avatar
							className={`${avatarStyle.background} h-10 w-10`}
						>
							{patient.avatarUrl ? (
								<AvatarImage
									src={patient.avatarUrl}
									alt={`${patient.firstName} ${patient.lastName}`}
								/>
							) : (
								<AvatarFallback
									className={avatarStyle.background}
								>
									{avatarStyle.icon}
								</AvatarFallback>
							)}
						</Avatar>
						<CardTitle className="text-base">
							<div className="flex items-center">
								{patient.lastName} {patient.firstName}
								{age !== null && (
									<span className="text-sm ml-2 text-gray-400">
										({age} ans)
									</span>
								)}
							</div>
							{/* Affichage du badge Enfant si moins de 12 ans */}
							{isChild && (
								<div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
									<Baby className="h-5 w-5 text-emerald-600" />
									<span>Enfant</span>
								</div>
							)}
						</CardTitle>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-sm text-muted-foreground grid gap-1">
					<div className="flex items-center">
						<Calendar className="w-4 h-4 mr-2" />
						{patient.birthDate
							? new Date(patient.birthDate).toLocaleDateString(
									"fr-FR"
							  )
							: "Non renseignée"}
					</div>
					<div className="flex items-center">
						<Mail className="w-4 h-4 mr-2" />
						{patient.email || "Non renseigné"}
					</div>
					<div className="flex items-center">
						<Phone className="w-4 h-4 mr-2" />
						{patient.phone || "Non renseigné"}
					</div>
					<div className="flex items-center">
						<MapPin className="w-4 h-4 mr-2" />
						{patient.address || "Non renseignée"}
					</div>
					<div className="flex items-center">
						<Weight className="w-4 h-4 mr-2" />
						{patient.weight
							? `${patient.weight} kg`
							: "Non renseigné"}
					</div>
					<div className="flex items-center">
						<Ruler className="w-4 h-4 mr-2" />
						{patient.height
							? `${patient.height} cm`
							: "Non renseignée"}
					</div>
					<div className="flex items-center">
						<Activity className="w-4 h-4 mr-2" />
						{patient.bmi ? `${patient.bmi} IMC` : "IMC non calculé"}
					</div>
				</div>
			</CardContent>{" "}
			<div className="px-4 pb-4 pt-2 flex justify-end">
				<Button
					variant="default"
					size="sm"
					className="bg-blue-500 hover:bg-blue-600"
					asChild
				>
					<Link to={`/patients/${patient.id}`}>Voir</Link>
				</Button>
			</div>
		</Card>
	);
}
