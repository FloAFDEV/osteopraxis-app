
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, UserRound, Users, Calendar, Phone, Mail } from "lucide-react";
import { Patient, Gender } from "@/types";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const birthDate = patient.birthDate ? format(new Date(patient.birthDate), "d MMMM yyyy", { locale: fr }) : "Non renseignée";

  // Déterminer l'icône en fonction du genre
  const getGenderIcon = (gender?: Gender) => {
    if (gender === "MALE") {
      return <User className="h-4 w-4 text-blue-500" />;
    } else if (gender === "FEMALE") {
      return <UserRound className="h-4 w-4 text-pink-500" />;
    } else {
      return <Users className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <Link to={`/patients/${patient.id}`} className="group relative flex flex-col items-start rounded-lg border border-muted/50 hover:border-primary transition-colors overflow-hidden">
      <div className="relative space-y-2">
        {patient.avatarUrl && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={patient.avatarUrl}
              alt={`${patient.firstName} ${patient.lastName}`}
              className="rounded-md object-cover shadow-sm"
            />
          </div>
        )}
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-800">
            {getGenderIcon(patient.gender)}
            <span>{patient.firstName} {patient.lastName}</span>
          </div>
          <div className="text-sm text-gray-500">
            <Calendar className="mr-2 inline-block h-4 w-4 align-middle" />
            Né(e) le {birthDate}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-1">
        {patient.phone && (
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="mr-2 inline-block h-4 w-4 align-middle" />
            {patient.phone}
          </div>
        )}
        {patient.email && (
          <div className="flex items-center text-sm text-gray-500">
            <Mail className="mr-2 inline-block h-4 w-4 align-middle" />
            {patient.email}
          </div>
        )}
      </div>
    </Link>
  );
}
