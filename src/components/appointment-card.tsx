
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Calendar, FileText } from "lucide-react";
import { Appointment, Patient } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AppointmentCardProps {
  appointment: Appointment;
  patient?: Patient;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, patient, onEdit, onCancel }: AppointmentCardProps) {
  const appointmentDate = parseISO(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(appointmentDate, "HH:mm");

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-400 hover:bg-blue-500 rounded-full px-3">Planifié</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500 hover:bg-green-600 rounded-full px-3">Terminé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500 hover:bg-red-600 rounded-full px-3">Annulé</Badge>;
      case "RESCHEDULED":
        return <Badge className="bg-amber-500 hover:bg-amber-600 rounded-full px-3">Reporté</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium">
              {patient ? (
                <Link 
                  to={`/patients/${patient.id}`} 
                  className="hover:text-blue-400 transition-colors"
                >
                  {patient.firstName} {patient.lastName}
                </Link>
              ) : (
                `Patient #${appointment.patientId}`
              )}
            </h3>
            <p className="text-muted-foreground">{appointment.reason}</p>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="space-y-2 mt-4 bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{formattedTime}</span>
          </div>
          {patient && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-400" />
              <span>
                {patient.currentTreatment ? patient.currentTreatment : "Aucun traitement en cours"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      {(onEdit || onCancel) && (
        <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-slate-700/20 flex justify-end gap-2">
          {onCancel && appointment.status === "SCHEDULED" && (
            <Button 
              variant="destructive" 
              size="sm"
              className="rounded-xl"
              onClick={onCancel}
            >
              Annuler
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="default" 
              size="sm"
              className="rounded-xl bg-blue-400 hover:bg-blue-500"
              onClick={onEdit}
            >
              Modifier
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
