import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import {
	Baby,
	User,
	Users,
	Briefcase,
	Phone,
	Mail,
	Heart,
} from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface PatientListItemProps {
	patient: Patient;
}

const PatientListItem: React.FC<PatientListItemProps> = ({ patient }) => {
	const navigate = useNavigate();
	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	// Mineur = age < 18
	const isMinor = age !== null && age < 18;

	const getAvatarColor = () => {
		switch (patient.gender) {
			case "Homme":
				return {
					background: "bg-blue-200 text-blue-600",
					icon: <User className="h-5 w-5 text-blue-600" />,
				};
			case "Femme":
				return {
					background: "bg-pink-200 text-pink-600",
					icon: <Heart className="h-5 w-5 text-pink-600" />,
				};
			default:
				return {
					background: "bg-purple-100 text-purple-600",
					icon: <Users className="h-5 w-5 text-purple-600" />,
				};
		}
	};

	const avatarStyle = getAvatarColor();

	return (
		<div
			className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer animate-fade-in"
			onClick={() => navigate(`/patients/${patient.id}`)}
		>
			<div className="p-4">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3 flex-grow">
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

						<div>
							<div className="font-medium text-base flex items-center gap-1">
								<Link
									to={`/patients/${patient.id}`}
									className="hover:underline"
								>
									{patient.lastName} {patient.firstName}
								</Link>
								{age !== null && (
									<span className="text-sm ml-2 text-gray-400">
										({age} ans)
									</span>
								)}
								{/* Si mineur, afficher l'icône et le badge */}
								{isMinor && (
									<div className="ml-1 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
										<Baby className="h-5 w-5 text-emerald-600" />
										<span>Mineur</span>
									</div>
								)}
							</div>

							<div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
								{patient.email && (
									<span className="flex items-center text-gray-700 dark:text-gray-200">
										<Mail className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
										<a
											href={`mailto:${patient.email}`}
											className="hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
										>
											{patient.email}
										</a>
									</span>
								)}

								{patient.phone && (
									<span className="flex items-center text-gray-700 dark:text-gray-200">
										<Phone className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
										<a
											href={`tel:${patient.phone}`}
											className="hover:underline  hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
										>
											{patient.phone}
										</a>
									</span>
								)}

								{patient.occupation && (
									<span className="flex items-center text-gray-500 dark:text-gray-400 italic">
										<Briefcase className="h-3 w-3 mr-1 text-amber-500 dark:text-amber-400" />
										{patient.occupation}
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="flex gap-2">
						<Button
							variant="default"
							size="sm"
							className="h-8 px-3 bg-blue-500 hover:bg-blue-700 hover:text-white"
							asChild
						>
							<Link to={`/patients/${patient.id}`}>Voir</Link>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-2"
							asChild
						></Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PatientListItem;
