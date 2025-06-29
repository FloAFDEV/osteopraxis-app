import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PatientQuickActions } from "./PatientQuickActions";

interface PatientListItemProps {
  patient: any; // Replace 'any' with a more specific type if possible
}

export function PatientListItem({ patient }: PatientListItemProps) {
  const navigate = useNavigate();

  const getInitials = () => {
    const firstName = patient.firstName || "";
    const lastName = patient.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              <Avatar>
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{patient.firstName} {patient.lastName}</h3>
                <p className="text-muted-foreground text-sm">
                  {patient.email || patient.phone || "Aucune information"}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Né(e) le {format(new Date(patient.birthDate), "dd MMMM yyyy", { locale: fr })}
            </div>
          </div>

          {/* Action buttons - responsive */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="w-full sm:w-auto justify-center sm:justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Voir le détail</span>
              <span className="sm:hidden">Voir</span>
            </Button>
            
            <PatientQuickActions patient={patient} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
