
import React from "react";
import { parseISO, differenceInYears } from "date-fns";
import { MapPin, Mail, Phone, UserCheck, UserCircle, Users } from "lucide-react";
import { Patient } from "@/types";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MedicalInfoCard } from "@/components/patients/medical-info-card";

interface PatientProfileProps {
  patient: Patient;
}

export function PatientProfile({ patient }: PatientProfileProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const genderColors = {
    lightBg: patient?.gender === "Homme" ? "bg-blue-50" : patient?.gender === "Femme" ? "bg-pink-50" : "bg-gray-50",
    darkBg: patient?.gender === "Homme" ? "bg-blue-500" : patient?.gender === "Femme" ? "bg-pink-500" : "bg-gray-500",
    textColor: patient?.gender === "Homme" ? "text-blue-500" : patient?.gender === "Femme" ? "text-pink-500" : "text-gray-500",
  };

  const GenderIcon = patient?.gender === "Homme" ? UserCheck : 
                    patient?.gender === "Femme" ? UserCircle : 
                    Users;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className={`p-6 ${genderColors.lightBg}`}>
          <div className="flex items-center space-x-4">
            <Avatar className={`h-16 w-16 ${genderColors.darkBg} text-white`}>
              <AvatarFallback>{getInitials(patient.firstName, patient.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <CardTitle className={`text-2xl font-bold ${genderColors.textColor} flex items-center gap-2`}>
                {patient.firstName} {patient.lastName}
                <GenderIcon className={`h-5 w-5 ${genderColors.textColor}`} />
              </CardTitle>
              <CardDescription>
                {patient.gender === "Homme" ? "Homme" : patient.gender === "Femme" ? "Femme" : "Non spécifié"}, {patient.birthDate ? differenceInYears(new Date(), parseISO(patient.birthDate)) : 0} ans
              </CardDescription>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {patient.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{patient.address}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${patient.email}`} className="hover:underline">
                  {patient.email}
                </a>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <MedicalInfoCard 
        title="Informations personnelles"
        items={[
          { label: "Statut marital", value: patient.maritalStatus === "SINGLE" ? "Célibataire" : 
            patient.maritalStatus === "MARRIED" ? "Marié(e)" :
            patient.maritalStatus === "DIVORCED" ? "Divorcé(e)" :
            patient.maritalStatus === "WIDOWED" ? "Veuf/Veuve" :
            patient.maritalStatus === "PARTNERED" ? "En couple" :
            patient.maritalStatus === "ENGAGED" ? "Fiancé(e)" : "Non spécifié"
          },
          { 
            label: "Enfants", 
            value: patient.childrenAges && patient.childrenAges.length > 0 
              ? `${patient.childrenAges.length} enfant(s) (${patient.childrenAges.sort((a, b) => a - b).join(", ")} ans)`
              : "Pas d'enfants"
          },
          { 
            label: "Latéralité", 
            value: patient.handedness === "RIGHT" ? "Droitier(ère)" :
              patient.handedness === "LEFT" ? "Gaucher(ère)" :
              patient.handedness === "AMBIDEXTROUS" ? "Ambidextre" : "Non spécifié"
          },
          { label: "Fumeur", value: patient.isSmoker ? "Oui" : "Non" },
          { 
            label: "Contraception", 
            value: patient.contraception === "NONE" ? "Aucune" :
              patient.contraception === "PILLS" ? "Pilule" :
              patient.contraception === "PATCH" ? "Patch" :
              patient.contraception === "RING" ? "Anneau vaginal" :
              patient.contraception === "IUD" ? "Stérilet" :
              patient.contraception === "IMPLANTS" ? "Implant" :
              patient.contraception === "CONDOM" ? "Préservatif" :
              patient.contraception === "DIAPHRAGM" ? "Diaphragme" : "Non spécifié"
          }
        ]}
      />
    </div>
  );
}
