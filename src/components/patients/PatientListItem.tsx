
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
} from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PatientOwnershipBadge } from "./PatientOwnershipBadge";
import { usePatientDisplayInfo } from "@/hooks/usePatientDisplayInfo";

interface PatientListItemProps {
	patient: Patient;
}

const PatientListItem: React.FC<PatientListItemProps> = ({ patient }) => {
	const navigate = useNavigate();
	const { displayName, displayEmail, isDemoPatient } = usePatientDisplayInfo(patient);
	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	// Mineur = age < 18
	const isMinor = age !== null && age < 18;

	const getAvatarColor = () => {
		// Mineur d'abord
		if (isMinor) {
			return {
				background: "bg-teal-100 text-teal-700",
				icon: <Baby className="h-5 w-5 text-teal-700" />,
			};
		}
		// Puis par genre
		switch (patient.gender) {
			case "Homme":
			case "M":
				return {
					background: "bg-blue-100 text-blue-700",
					icon: <User className="h-5 w-5 text-blue-700" />,
				};
			case "Femme":
			case "F":
				return {
					background: "bg-rose-100 text-rose-700",
					icon: <Users className="h-5 w-5 text-rose-700" />,
				};
			default:
				return {
					background: "bg-gray-200 text-gray-800",
					icon: <Users className="h-5 w-5 text-gray-800" />,
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
									alt={displayName}
								/>
							) : (
								<AvatarFallback
									className={avatarStyle.background}
								>
									{avatarStyle.icon}
								</AvatarFallback>
							)}
						</Avatar>

						<div className="flex-grow">
							<div className="font-medium text-base flex items-center gap-2 flex-wrap">
								<Link
									to={`/patients/${patient.id}`}
									className="hover:underline"
								>
									{displayName}
								</Link>
								{age !== null && (
									<span className="text-sm text-gray-400">
										({age} ans)
									</span>
								)}
								{/* Badge de propriété du patient */}
								<PatientOwnershipBadge patientId={patient.id} />
								{/* Badge Mineur uniquement (genre identifié par couleur avatar) */}
								{isMinor && (
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-700">
										<Baby className="h-3 w-3" />
										Mineur
									</span>
								)}
							</div>

							<div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
								{patient.email && (
									<span className="flex items-center text-gray-700 dark:text-gray-200">
										<Mail className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
										<a
											href={`mailto:${isDemoPatient ? '#' : patient.email}`}
											className="hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
										>
											{displayEmail}
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
					</div>
				</div>
			</div>
		</div>
	);
};

export default PatientListItem;
