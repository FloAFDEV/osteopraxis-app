import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import { Baby, User, Users, Briefcase, Phone, Mail } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PatientOwnershipBadge } from "./PatientOwnershipBadge";
import { usePatientDisplayInfo } from "@/hooks/usePatientDisplayInfo";

interface PatientListItemProps {
	patient: Patient;
}

const PatientListItem: React.FC<PatientListItemProps> = ({ patient }) => {
	const navigate = useNavigate();
	const { displayName, displayEmail, isDemoPatient } =
		usePatientDisplayInfo(patient);
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
			className="border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer h-16"
			onClick={() => navigate(`/patients/${patient.id}`)}
		>
			<div className="px-3 h-full flex items-center">
				<div className="flex justify-between items-center w-full">
					<div className="flex items-center gap-3 flex-grow min-w-0">
						<Avatar
							className={`${avatarStyle.background} h-9 w-9 flex-shrink-0`}
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

						<div className="flex-grow min-w-0">
							<div className="font-medium text-sm flex items-center gap-2 leading-none">
								<Link
									to={`/patients/${patient.id}`}
									className="hover:underline truncate"
								>
									{displayName}
								</Link>
								{age !== null && (
									<span className="text-sm text-muted-foreground flex-shrink-0">
										({age} ans)
									</span>
								)}
								<PatientOwnershipBadge patientId={patient.id} />
								{isMinor && (
									<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-700 flex-shrink-0 leading-none">
										<Baby className="h-3 w-3" />
										Mineur
									</span>
								)}
							</div>

							<div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 leading-none">
								{patient.email && (
									<span className="flex items-center">
										<Mail className="h-3 w-3 mr-1 text-slate-400" />
										<span className="truncate max-w-[150px]">
											{displayEmail}
										</span>
									</span>
								)}

								{patient.phone && (
									<span className="flex items-center">
										<Phone className="h-3 w-3 mr-1 text-slate-400" />
										{patient.phone}
									</span>
								)}

								{patient.occupation && (
									<span className="flex items-center text-muted-foreground">
										<Briefcase className="h-3 w-3 mr-1 text-slate-400" />
										<span className="truncate max-w-[100px]">
											{patient.occupation}
										</span>
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="flex gap-2 flex-shrink-0 ml-2">
						<Button
							variant="default"
							size="sm"
							className="h-7 px-2"
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
