import {
  Building2,
  Calendar,
  ChevronDown,
  Edit,
  FileText,
  Receipt,
  Trash,
  User as UserIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Appointment,
  AppointmentStatus,
  Cabinet,
  Invoice,
  Patient,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

interface AppointmentCardProps {
  appointment: Appointment;
  patient?: Patient;
  cabinet?: Cabinet;
  showPatient?: boolean;
  showCabinet?: boolean;
  optionalText?: string;
  className?: string;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onAddInvoice?: (appointment: Appointment) => void;
  allowStatusUpdate?: boolean;
}

function formatAppointmentTime(date: Date): string {
  return format(date, "HH:mm", { locale: fr });
}

function formatDate(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: fr });
}

export function AppointmentCard({
  appointment,
  patient,
  cabinet,
  showPatient = true,
  showCabinet = true,
  optionalText = "",
  className = "",
  onEdit,
  onDelete,
  onAddInvoice,
  allowStatusUpdate = true,
}: AppointmentCardProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const invoices = await api.getInvoicesByAppointmentId(appointment.id);
        if (invoices && invoices.length > 0) {
          setHasInvoice(true);
          appointment.invoiceId = invoices[0].id;
        } else {
          setHasInvoice(false);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setHasInvoice(false);
      }
    };

    fetchInvoice();
  }, [appointment.id]);

  const toggleStatusMenu = () => {
    setIsStatusMenuOpen(!isStatusMenuOpen);
  };

  const updateStatus = async (newStatus: AppointmentStatus) => {
    try {
      await api.updateAppointment(appointment.id, { status: newStatus });
      window.location.reload();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    } finally {
      setIsStatusMenuOpen(false);
    }
  };

  const getStatusText = () => {
    switch (appointment.status) {
      case "SCHEDULED":
        return "Planifié";
      case "COMPLETED":
        return "Terminé";
      case "CANCELED":
        return "Annulé";
      case "RESCHEDULED":
        return "Reporté";
      case "NO_SHOW":
        return "Non venu";
      default:
        return "Inconnu";
    }
  };

  const getStatusColor = () => {
    switch (appointment.status) {
      case "SCHEDULED":
        return "bg-blue-500 hover:bg-blue-600";
      case "COMPLETED":
        return "bg-green-500 hover:bg-green-600";
      case "CANCELED":
        return "bg-red-500 hover:bg-red-600";
      case "RESCHEDULED":
        return "bg-amber-500 hover:bg-amber-600";
      case "NO_SHOW":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-400 hover:bg-gray-500";
    }
  };

  const cardClasses = hasInvoice ? "border-green-500" : "";

  const statusOptions = [
    { value: "SCHEDULED", label: "Planifié", color: "bg-blue-500 hover:bg-blue-600" },
    { value: "COMPLETED", label: "Terminé", color: "bg-green-500 hover:bg-green-600" },
    { value: "CANCELED", label: "Annulé", color: "bg-red-500 hover:bg-red-600" },
    { value: "RESCHEDULED", label: "Reporté", color: "bg-amber-500 hover:bg-amber-600" },
    { value: "NO_SHOW", label: "Non venu", color: "bg-gray-500 hover:bg-gray-600" },
  ];
  

  return (
    <Card className={cn("hover-scale", className)}>
      <CardHeader className={cn("flex flex-row items-center gap-2 pb-1", cardClasses)}>
        <div className="flex items-center flex-1">
          {/* Date and time */}
          <div className="mr-4 text-xl font-semibold">
            {formatAppointmentTime(new Date(appointment.date))}
          </div>
          
          {/* Badge for status */}
          <div>
            <Badge 
              className={getStatusColor()}
              onClick={toggleStatusMenu}
            >
              {getStatusText()}
              {allowStatusUpdate && (
                <ChevronDown className="ml-1 h-3 w-3" />
              )}
            </Badge>
            
            {/* Dropdown for changing status */}
            {isStatusMenuOpen && allowStatusUpdate && (
              <div className="absolute mt-1 z-50 bg-card border rounded-md shadow-lg p-1 min-w-32">
                {statusOptions.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      "px-3 py-1 text-sm rounded-sm cursor-pointer hover:bg-accent",
                      appointment.status === option.value && "bg-accent"
                    )}
                    onClick={() => updateStatus(option.value as AppointmentStatus)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {/* Patient info */}
        {patient && showPatient && (
          <div className="flex items-center mb-2">
            <UserIcon className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="font-medium">{patient.firstName} {patient.lastName}</span>
          </div>
        )}
        
        {/* Cabinet info */}
        {cabinet && showCabinet && (
          <div className="flex items-center mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{cabinet.name}</span>
          </div>
        )}
        
        {/* Reason */}
        <div className="text-sm text-muted-foreground mb-2">
          <p>{appointment.reason}</p>
          {optionalText && <p className="mt-1 italic">{optionalText}</p>}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-1">
        {/* Button to create invoice */}
        {appointment.status === "COMPLETED" && !hasInvoice && (
          <Button
            size="sm"
            variant="outline"
            className="text-green-600"
            onClick={() => onAddInvoice && onAddInvoice(appointment)}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Créer note
          </Button>
        )}
        
        {/* View invoice button */}
        {hasInvoice && (
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600"
            onClick={() => navigate(`/invoices/${appointment.invoiceId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Voir note
          </Button>
        )}
        
        {/* Edit button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit && onEdit(appointment)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        {/* Delete button */}
        <Button
          size="sm"
          variant="outline"
          className="text-red-500 hover:text-red-600"
          onClick={() => onDelete && onDelete(appointment)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
