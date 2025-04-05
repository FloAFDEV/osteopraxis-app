
import { format, parseISO, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Mail, Phone, Activity } from "lucide-react";
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
  const birthDate = parseISO(patient.birthDate);
  const age = differenceInYears(new Date(), birthDate);
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Définir les couleurs en fonction du genre
  const getGenderColors = (gender: string) => {
    if (gender === "Homme") {
      return {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        avatar: "bg-blue-500 text-primary-foreground"
      };
    } else if (gender === "Femme") {
      return {
        badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        avatar: "bg-pink-500 text-primary-foreground"
      };
    } else {
      return {
        badge: "bg-muted text-muted-foreground",
        avatar: "bg-primary text-primary-foreground"
      };
    }
  };

  const genderColors = getGenderColors(patient.gender);

  return (
    <Card className="overflow-hidden hover-scale">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className={`text-lg ${genderColors.avatar}`}>
              {getInitials(patient.firstName, patient.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-medium truncate">
                {patient.firstName} {patient.lastName}
              </h3>
              <Badge className={`${genderColors.badge}`}>
                {patient.gender}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground truncate">
              {patient.occupation || "Profession non spécifiée"}
            </p>
            
            <p className="text-sm">
              {age} ans • Né(e) le {format(birthDate, "dd/MM/yyyy")}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{patient.address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{patient.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>
          
          {patient.physicalActivity && (
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{patient.physicalActivity}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {showDetailsButton && (
        <CardFooter className="px-6 py-4 bg-muted/20">
          <Button asChild variant="default" size="sm" className="w-full">
            <Link to={`/patients/${patient.id}`}>
              Voir le dossier complet
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
