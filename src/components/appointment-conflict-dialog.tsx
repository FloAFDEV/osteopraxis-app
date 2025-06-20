
import React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConflictInfo {
  conflictingAppointments: Array<{
    id: number;
    date: string;
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    reason: string;
    status: string;
  }>;
  requestedDate: string;
  currentDate: string;
}

interface AppointmentConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictInfo: ConflictInfo | null;
  onForceUpdate: () => void;
  onCancel: () => void;
  onShowAlternatives?: () => void;
}

export function AppointmentConflictDialog({
  open,
  onOpenChange,
  conflictInfo,
  onForceUpdate,
  onCancel,
  onShowAlternatives
}: AppointmentConflictDialogProps) {
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "PPP 'à' HH:mm", { locale: fr });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SCHEDULED: { label: "Planifiée", variant: "default" as const },
      COMPLETED: { label: "Terminée", variant: "secondary" as const },
      RESCHEDULED: { label: "Reportée", variant: "outline" as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (!conflictInfo) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            Conflit de rendez-vous détecté
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Un rendez-vous existe déjà sur le créneau demandé le{" "}
              <strong>{formatDateTime(conflictInfo.requestedDate)}</strong>.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-3">Rendez-vous en conflit :</h4>
              {conflictInfo.conflictingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white p-3 rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{appointment.patientName}</span>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(appointment.date)}</span>
                    </div>
                    <div>
                      <strong>Motif :</strong> {appointment.reason}
                    </div>
                  </div>
                  
                  {(appointment.patientPhone || appointment.patientEmail) && (
                    <div className="text-sm text-gray-500 space-y-1">
                      {appointment.patientPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{appointment.patientPhone}</span>
                        </div>
                      )}
                      {appointment.patientEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{appointment.patientEmail}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Créneau actuel :</strong> {formatDateTime(conflictInfo.currentDate)}
                <br />
                <strong>Nouveau créneau demandé :</strong> {formatDateTime(conflictInfo.requestedDate)}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel}>
            Annuler et garder l'heure actuelle
          </AlertDialogCancel>
          {onShowAlternatives && (
            <Button 
              variant="outline" 
              onClick={() => {
                onShowAlternatives();
                onOpenChange(false);
              }}
            >
              Voir les créneaux libres
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={onForceUpdate}
          >
            Forcer la modification
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
