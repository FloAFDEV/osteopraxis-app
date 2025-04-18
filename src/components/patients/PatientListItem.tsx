
import React from "react";
import { Link } from "react-router-dom";
import { Mail, User, UserRound, Users } from "lucide-react";
import { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { differenceInYears, parseISO } from "date-fns";

interface PatientListItemProps {
  patient: Patient;
}

const PatientListItem: React.FC<PatientListItemProps> = ({
  patient
}) => {
  // Calculate age only if birthDate is defined
  const age = patient.birthDate ? differenceInYears(new Date(), parseISO(patient.birthDate)) : null;

  // Get patient initials for avatar
  const getInitials = () => {
    const firstInitial = patient.firstName ? patient.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = patient.lastName ? patient.lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Determine background color and icon based on gender
  const getAvatarColor = () => {
    switch(patient.gender) {
      case 'Homme':
        return {
          background: 'bg-blue-100 text-blue-600', 
          icon: <User className="h-5 w-5 text-blue-600" />
        };
      case 'Femme':
        return {
          background: 'bg-pink-100 text-pink-600', 
          icon: <UserRound className="h-5 w-5 text-pink-600" />
        };
      default:
        return {
          background: 'bg-purple-100 text-purple-600', 
          icon: <Users className="h-5 w-5 text-purple-600" />
        };
    }
  };

  const avatarStyle = getAvatarColor();

  console.log(`Rendering patient: ${patient.id} - ${patient.firstName} ${patient.lastName}`);

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fade-in">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-grow">
            {/* Avatar with gender */}
            <Avatar className={`${avatarStyle.background} h-10 w-10`}>
              {patient.avatarUrl ? (
                <AvatarImage src={patient.avatarUrl} alt={`${patient.firstName} ${patient.lastName}`} />
              ) : (
                <AvatarFallback className={avatarStyle.background}>
                  {avatarStyle.icon}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <div className="font-medium text-base flex items-center gap-1">
                <Link to={`/patients/${patient.id}`} className="hover:underline">
                  {patient.lastName || "Nom inconnu"} {patient.firstName || ""}
                </Link>
                {age !== null && <span className="text-sm ml-2 text-gray-400">({age} ans)</span>}
              </div>
              
              <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                {patient.email && <span className="flex items-center text-gray-300">
                    <Mail className="h-3 w-3 mr-1 text-blue-500" />
                    <a href={`mailto:${patient.email}`} className="hover:underline text-blue-500 hover:text-blue-700 transition-colors">
                      {patient.email}
                    </a>
                  </span>}
                
                {patient.phone && <span className="text-gray-400">
                    <a href={`tel:${patient.phone}`} className="hover:underline text-blue-500 hover:text-blue-700 transition-colors">
                      {patient.phone}
                    </a>
                  </span>}
                
                {patient.occupation && <span className="text-gray-500 italic">{patient.occupation}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
              <Link to={`/patients/${patient.id}/edit`}>Modifier</Link>
            </Button>
            <Button variant="default" size="sm" className="h-8 px-3 bg-blue-600 hover:bg-blue-700" asChild>
              <Link to={`/patients/${patient.id}`}>Voir</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientListItem;
