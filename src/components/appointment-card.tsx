
import React from "react";
import { format, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, User, Clock, FileText, ArrowRight, X } from "lucide-react";
import { Appointment, Patient } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface AppointmentCardProps {
  appointment: Appointment;
  patient?: Patient;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onAddInvoice?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  patient,
  onEdit,
  onDelete,
  onAddInvoice,
  onCancel,
}: AppointmentCardProps) {
  const navigate = useNavigate();
  
  const isUpcoming = isAfter(new Date(appointment.date), new Date());
  
  const formattedDate = format(new Date(appointment.date), "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(new Date(appointment.date), "HH:mm", { locale: fr });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Planifiée</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500 hover:bg-green-600">Terminée</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-500 hover:bg-red-600">Annulée</Badge>;
      case "RESCHEDULED":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Reportée</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Non présenté</Badge>;
      default:
        return <Badge className="bg-gray-400">Inconnu</Badge>;
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
    } else {
      navigate(`/appointments/${appointment.id}/edit`);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(appointment);
    }
  };
  
  const handleAddInvoice = () => {
    if (onAddInvoice) {
      onAddInvoice(appointment);
    } else {
      navigate(`/invoices/new?appointmentId=${appointment.id}`);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel(appointment);
    }
  };
  
  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{formattedTime}</span>
          </div>
        </div>
        
        {getStatusBadge(appointment.status)}
      </CardHeader>
      <CardContent>
        {patient ? (
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {patient.email || patient.phone}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <User className="h-4 w-4 text-muted-foreground mr-2" />
            <span>Patient #{appointment.patientId}</span>
          </div>
        )}
        
        {appointment.reason && (
          <div className="mt-4 text-sm">
            <p className="text-muted-foreground">Motif:</p>
            <p>{appointment.reason}</p>
          </div>
        )}
        
        {appointment.status === "COMPLETED" && appointment.notes && (
          <div className="mt-4 text-sm">
            <p className="text-muted-foreground">Notes:</p>
            <p>{appointment.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-1">
        {appointment.status === "SCHEDULED" && isUpcoming && onCancel && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        )}
        
        {appointment.status === "COMPLETED" && !appointment.invoiceId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddInvoice}
          >
            <FileText className="h-4 w-4 mr-2" />
            Créer note d'honoraire
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
