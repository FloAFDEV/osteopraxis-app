import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Appointment, AppointmentStatus } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentCard } from "@/components/appointment-card";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsData = await api.getAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusFilterChange = (status: AppointmentStatus | "all") => {
    setStatusFilter(status);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (!statusFilter || statusFilter === "all") {
      return true;
    }
    return appointment.status === statusFilter;
  });

  const searchedAppointments = filteredAppointments.filter((appointment) => {
    return (
      appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-500" />
            Rendez-vous
          </h1>
          <Link to="/appointments/new">
            <Button>Nouveau Rendez-vous</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label htmlFor="search">Rechercher un rendez-vous :</Label>
            <Input
              type="search"
              id="search"
              placeholder="Rechercher par motif ou notes"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>
          <div>
            <Label htmlFor="status">Filtrer par statut :</Label>
            <Select onValueChange={handleStatusFilterChange} defaultValue={statusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="PLANNED">Planifié</SelectItem>
                <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p>Chargement des rendez-vous...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchedAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
