
import { format, parseISO, differenceInYears } from "date-fns";
import { MapPin, Mail, Phone, User } from "lucide-react";
import { Patient } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface PatientCardProps {
  patient: Patient;
  showDetailsButton?: boolean;
}

export function PatientCard({ patient, showDetailsButton = true }: PatientCardProps) {
  // Calculer l'âge uniquement si birthDate est défini
  const age = patient.birthDate 
    ? differenceInYears(new Date(), parseISO(patient.birthDate)) 
    : null;
  
  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "?";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "?";
    return `${firstInitial}${lastInitial}`;
  };

  // Définir les couleurs en fonction du genre
  const getGenderColors = (gender: string) => {
    if (gender === "Homme") {
      return {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        avatar: "bg-blue-600 text-white",
        border: "border-blue-500"
      };
    } else if (gender === "Femme") {
      return {
        badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        avatar: "bg-purple-600 text-white",
        border: "border-purple-500"
      };
    } else {
      return {
        badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        avatar: "bg-gray-600 text-white",
        border: "border-gray-500"
      };
    }
  };

  const genderColors = getGenderColors(patient.gender || "");

  return (
    <Card 
      className="overflow-hidden transition-all duration-200 border-t-4 h-full hover:shadow-lg hover:scale-[1.02] flex flex-col" 
      style={{ borderTopColor: patient.gender === 'Homme' ? '#2563eb' : 
                                patient.gender === 'Femme' ? '#9333ea' : '#6b7280' }}
    >
      <CardContent className="p-6 flex-grow">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16 shadow-sm">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={`${patient.firstName} ${patient.lastName}`} />
            ) : (
              <AvatarFallback className={`text-lg ${genderColors.avatar}`}>
                {getInitials(patient.firstName || "", patient.lastName || "")}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-xl font-semibold truncate">
              {patient.firstName} {patient.lastName}
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap">
              {patient.gender && (
                <Badge variant="outline" className={`${genderColors.badge} font-medium`}>
                  {patient.gender}
                </Badge>
              )}
              
              {age !== null && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 font-medium">
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
              <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}
          
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
              <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">Né(e) le {format(parseISO(patient.birthDate), "dd/MM/yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {showDetailsButton && (
        <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button asChild variant="default" size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              <Link to={`/patients/${patient.id}`}>
                Voir le dossier
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
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
