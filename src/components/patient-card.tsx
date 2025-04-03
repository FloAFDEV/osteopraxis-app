
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

  return (
    <Card className="overflow-hidden hover-scale">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {getInitials(patient.firstName, patient.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">
                {patient.firstName} {patient.lastName}
              </h3>
              <Badge className="bg-muted text-muted-foreground">
                {patient.gender}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {patient.occupation || "Profession non spécifiée"}
            </p>
            
            <p className="text-sm">
              {age} ans • Né(e) le {format(birthDate, "dd/MM/yyyy")}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{patient.address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span>{patient.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <span>{patient.email}</span>
          </div>
          
          {patient.physicalActivity && (
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-primary" />
              <span>{patient.physicalActivity}</span>
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
