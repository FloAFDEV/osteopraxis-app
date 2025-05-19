
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Calendar,
	Mail,
	MapPin,
	Phone,
	User,
	Weight,
	Activity,
	Droplets,
	Ruler,
} from "lucide-react";
import { Patient } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate();

  const age = patient.birthDate
    ? formatDistanceToNow(new Date(patient.birthDate), {
        locale: fr,
        addSuffix: true,
      })
    : "Non renseigné";

  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/patients/${patient.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-start space-y-0 pb-2">
          <span>
            {patient.firstName} {patient.lastName}
          </span>
          <Badge variant="secondary">
            {age}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground grid gap-1">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            {patient.gender || "Non renseigné"}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("fr-FR") : "Non renseignée"}
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
            {patient.postalCode ? `, ${patient.postalCode}` : null}
            {patient.city ? ` ${patient.city}` : null}
          </div>
          <div className="flex items-center">
            <Weight className="w-4 h-4 mr-2" />
            {patient.weight ? `${patient.weight} kg` : "Non renseigné"}
          </div>
          <div className="flex items-center">
            <Ruler className="w-4 h-4 mr-2" />
            {patient.height ? `${patient.height} cm` : "Non renseignée"}
          </div>
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            {patient.bmi ? `${patient.bmi} BMI` : "Non renseigné"}
          </div>
          <div className="flex items-center">
            <Droplets className="w-4 h-4 mr-2" />
            {patient.bloodType || "Non renseigné"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
