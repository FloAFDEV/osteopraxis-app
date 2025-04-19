import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/services/api";
import { Appointment, AppointmentStatus } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

moment.locale('fr');
const localizer = momentLocalizer(moment);

const formSchema = z.object({
  date: z.string().min(1, { message: "La date est requise." }),
});

// Function to add minutes to a time
const addMinutes = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  
  const formattedHours = String(newHours).padStart(2, '0');
  const formattedMins = String(newMins).padStart(2, '0');
  
  return `${formattedHours}:${formattedMins}`;
};

// Function to get time from a Date object
const getTimeFromDate = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Function to calculate end time based on start time and duration
const getEndTimeFromStartAndDuration = (startTime: string, duration: number): string => {
  return addMinutes(startTime, duration);
};

const SchedulePage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: moment().format('YYYY-MM-DD'),
    },
  });
  
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsData = await api.getAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, []);
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setDate(values.date);
  };
  
  // Make sure we include cabinetId in the event object
  const events = appointments.map(appointment => {
    const startTime = appointment.startTime || getTimeFromDate(new Date(appointment.date));
    const endTime = getEndTimeFromStartAndDuration(startTime, appointment.duration || 60);
    
    return {
      id: appointment.id.toString(),
      title: `Patient #${appointment.patientId}`,
      start: `${date}T${startTime}`,
      end: `${date}T${endTime}`,
      patientId: appointment.patientId,
      status: appointment.status,
      reason: appointment.notes || appointment.reason || "",
      cabinetId: appointment.cabinetId
    };
  });
  
  const handleSelectSlot = (slotInfo: any) => {
    const selectedDate = moment(slotInfo.start).format('YYYY-MM-DD');
    navigate(`/appointments/new?date=${selectedDate}`);
  };
  
  const handleSelectEvent = (event: any) => {
    navigate(`/appointments/${event.id}/edit`);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Calendrier des rendez-vous</h1>
        
        <div className="mb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date:</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Afficher
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="rbc-calendar">
          {!loading ? (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="day"
              views={['day', 'week', 'month']}
              selectable={true}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              style={{ height: 800 }}
              messages={{
                today: "Aujourd'hui",
                day: "Jour",
                week: "Semaine",
                month: "Mois",
                noEventsInRange: "Aucun rendez-vous ce jour-ci."
              }}
            />
          ) : (
            <div className="text-center">Chargement des rendez-vous...</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
