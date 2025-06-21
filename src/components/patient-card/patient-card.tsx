
import { differenceInYears, parseISO } from "date-fns";
import { Baby, User, Users, Briefcase, Phone, Mail, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Patient } from "@/types";
import { PatientOwnershipBadge } from "../patients/PatientOwnershipBadge";

interface PatientCardProps {
  patient: Patient;
  compact?: boolean;
}

export function PatientCard({ patient, compact = false }: PatientCardProps) {
  const age = patient.birthDate
    ? differenceInYears(new Date(), parseISO(patient.birthDate))
    : null;

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
          icon: <Users className="h-5 w-5 text-pink-600" />,
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
    <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className={`${avatarStyle.background} h-12 w-12 flex-shrink-0`}>
              {patient.avatarUrl ? (
                <AvatarImage
                  src={patient.avatarUrl}
                  alt={`${patient.firstName} ${patient.lastName}`}
                />
              ) : (
                <AvatarFallback className={avatarStyle.background}>
                  {avatarStyle.icon}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  to={`/patients/${patient.id}`}
                  className="font-semibold text-base hover:text-blue-600 transition-colors truncate"
                >
                  {patient.lastName} {patient.firstName}
                </Link>
                {age !== null && (
                  <span className="text-sm text-gray-500">({age} ans)</span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-2">
                <PatientOwnershipBadge patientId={patient.id} />
                {isMinor && (
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    <Baby className="h-3 w-3 mr-1" />
                    Mineur
                  </Badge>
                )}
              </div>

              {!compact && (
                <div className="space-y-1 text-sm text-gray-600">
                  {patient.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2 text-blue-500" />
                      <a
                        href={`mailto:${patient.email}`}
                        className="hover:text-blue-600 transition-colors truncate"
                      >
                        {patient.email}
                      </a>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-green-500" />
                      <a
                        href={`tel:${patient.phone}`}
                        className="hover:text-green-600 transition-colors"
                      >
                        {patient.phone}
                      </a>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-2 text-amber-500" />
                      <span className="italic truncate">{patient.occupation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/patients/${patient.id}`}>Voir le profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/patients/${patient.id}/edit`}>Modifier</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
