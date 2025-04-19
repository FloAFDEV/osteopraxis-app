
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, AppointmentStatus } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | undefined>(undefined);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointmentData = await api.getAppointments();
        setAppointments(appointmentData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Impossible de charger les rendez-vous. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  const filteredAppointments = appointments.filter(appointment => {
    const searchMatch =
      searchQuery === "" ||
      appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientId.toString().includes(searchQuery);
    
    const dateMatch =
      !selectedDate ||
      format(parseISO(appointment.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
      
    const statusMatch =
      !selectedStatus || selectedStatus === "all" || appointment.status === selectedStatus;
      
    return searchMatch && dateMatch && statusMatch;
  });
  
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
  
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setLoading(true);
      await api.updateAppointmentStatus(appointmentId, "CANCELLED");
      toast.success("Rendez-vous annulé avec succès");
      
      // Update the UI by updating the local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: "CANCELLED" } 
            : appointment
        )
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestion des Rendez-vous</h1>
          <Link to="/appointments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Rendez-vous
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Rechercher un rendez-vous..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {!searchQuery && (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Select onValueChange={(value) => setSelectedStatus(value === "all" ? undefined : value as AppointmentStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PLANNED">Planifié</SelectItem>
                <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-4">Aucun rendez-vous trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-lg font-semibold">
                    Patient #{appointment.patientId}
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                <p className="text-gray-500">
                  {format(parseISO(appointment.date), "EEEE dd MMMM yyyy", { locale: fr })}
                </p>
                <p className="text-gray-500">
                  {appointment.time && format(parseISO(`2000-01-01T${appointment.time}`), "HH:mm", { locale: fr })}
                </p>
                <p className="text-gray-700">{appointment.notes || appointment.reason}</p>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
