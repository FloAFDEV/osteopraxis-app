
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Calendar, FileText } from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Définir l'interface Patient pour ce composant
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  currentTreatment?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  patient?: Patient;
  onEdit?: () => void;
  onCancel?: () => void;
}

const getStatusBadge = (status: AppointmentStatus) => {
  switch (status) {
    case "PLANNED":
      return <Badge className="bg-blue-500">Planifié</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-green-500">Confirmé</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-500">Annulé</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-500">Terminé</Badge>;
    default:
      return null;
  }
};

export function AppointmentCard({
  appointment,
  patient,
  onEdit,
  onCancel
}: AppointmentCardProps) {
  const appointmentDate = parseISO(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", {
    locale: fr
  });
  const formattedTime = format(appointmentDate, "HH:mm");
  
  return <Card className="overflow-hidden hover-scale">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium">
              {patient ? <Link to={`/patients/${patient.id}`} className="hover:text-primary transition-colors">
                  {patient.firstName} {patient.lastName}
                </Link> : `Patient #${appointment.patientId}`}
            </h3>
            <p className="text-muted-foreground">{appointment.notes || appointment.reason}</p>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-red-500 font-semibold">{formattedTime}</span>
          </div>
          {patient && <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span>
                {patient.currentTreatment ? patient.currentTreatment : "Aucun traitement en cours"}
              </span>
            </div>}
        </div>
      </CardContent>
      
      {(onEdit || onCancel) && <CardFooter className="px-6 py-4 bg-muted/20 flex justify-end gap-2">
          {onEdit && <Button variant="outline" size="sm" onClick={onEdit}>
              Modifier
            </Button>}
          {onCancel && appointment.status === "PLANNED" && <Button variant="destructive" size="sm" onClick={onCancel}>
              Annuler
            </Button>}
        </CardFooter>}
    </Card>;
}
