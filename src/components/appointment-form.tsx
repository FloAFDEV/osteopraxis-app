import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isBefore, isSameDay, setHours, setMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { AppointmentStatus } from "@/types";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

// Définir l'interface Patient pour ce composant
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
}

// Custom validation function to check if appointment time is in the past
const isAppointmentInPast = (date: Date, timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const appointmentDateTime = setMinutes(setHours(new Date(date), hours), minutes);
  const now = new Date();
  
  return isBefore(appointmentDateTime, now);
};

const appointmentFormSchema = z.object({
  patientId: z.number({
    required_error: "Veuillez sélectionner un patient",
  }),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Veuillez sélectionner une heure valide (HH:MM)",
  }),
  reason: z.string().min(3, {
    message: "La raison doit contenir au moins 3 caractères",
  }),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "COMPLETED"], {
    required_error: "Veuillez sélectionner un statut",
  }),
}).refine((data) => {
  // If it's today, ensure the time is not in the past
  if (isSameDay(data.date, new Date())) {
    return !isAppointmentInPast(data.date, data.time);
  }
  return true;
}, {
  message: "Vous ne pouvez pas prendre un rendez-vous dans le passé",
  path: ["time"],
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  patients: Patient[];
  defaultValues?: Partial<AppointmentFormValues>;
  appointmentId?: number;
  isEditing?: boolean;
}

export function AppointmentForm({
  patients,
  defaultValues,
  appointmentId,
  isEditing = false,
}: AppointmentFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTime, setCustomTime] = useState<string>(defaultValues?.time || "09:00");
  const [useCustomTime, setUseCustomTime] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: defaultValues?.patientId,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      time: defaultValues?.time || "09:00",
      reason: defaultValues?.reason || "",
      status: defaultValues?.status || "PLANNED",
    },
  });
  
  // Generate available time slots (current time onward if today)
  const generateAvailableTimes = () => {
    const now = new Date();
    const selectedDate = form.watch("date");
    const isToday = isSameDay(selectedDate, now);
    
    // Heures de travail: 8h00 - 20h00 (8am - 8pm)
    const businessStartHour = 8; // 8am
    const businessEndHour = 20; // 8pm
    
    const currentHour = isToday ? now.getHours() : businessStartHour;
    const currentMinute = isToday ? now.getMinutes() : 0;
    
    // Calculate start slot based on business hours or current time if today
    const startSlot = isToday 
      ? Math.max(
          businessStartHour * 2, // 8am in 30 min slots = 16
          Math.ceil((currentHour * 60 + currentMinute) / 30)
        )
      : businessStartHour * 2; // Start at 8am (16th 30-min slot)
    
    // Calculate end slot based on business end time (8pm = 20 * 2 = 40th 30-min slot)
    const endSlot = businessEndHour * 2;
    
    // Generate all possible slots between start and end
    return Array.from({ length: Math.max(0, endSlot - startSlot) }, (_, i) => {
      const totalMinutes = (startSlot + i) * 30;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    });
  };

  const availableTimes = generateAvailableTimes();

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const dateTime = new Date(data.date);
      const timeToUse = useCustomTime ? customTime : data.time;
      const [hours, minutes] = timeToUse.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      // Check if appointment is in the past
      if (isBefore(dateTime, new Date())) {
        toast.error("Vous ne pouvez pas prendre un rendez-vous dans le passé");
        setIsSubmitting(false);
        return;
      }
      
      const dateTimeISO = dateTime.toISOString();
      const now = new Date().toISOString();
      
      const appointmentData = {
        patientId: data.patientId,
        date: dateTimeISO,
        startTime: timeToUse,
        endTime: addHours(timeToUse, 1),
        reason: data.reason,
        status: data.status as AppointmentStatus,
        notificationSent: false,
        createdAt: now,
        updatedAt: now
      };
      
      if (isEditing && appointmentId) {
        // Update existing appointment
        await api.updateAppointment(appointmentId, appointmentData);
        toast.success("Rendez-vous mis à jour avec succès");
      } else {
        // Create new appointment
        await api.createAppointment(appointmentData);
        toast.success("Rendez-vous créé avec succès");
      }
      
      navigate("/appointments");
    } catch (error) {
      console.error("Error submitting appointment form:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fonction utilitaire pour ajouter des heures à une heure au format string "HH:MM"
  function addHours(timeStr: string, hoursToAdd: number): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setTime(date.getTime() + (hoursToAdd * 60 * 60 * 1000));
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  // Update available times when date changes
  form.watch("date");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select
                disabled={isSubmitting}
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "EEEE d MMMM yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        // Reset time selection if date is today and time is in past
                        if (date && isSameDay(date, new Date())) {
                          const now = new Date();
                          const currentTimeSlot = availableTimes[0];
                          if (currentTimeSlot) {
                            form.setValue("time", currentTimeSlot);
                          }
                        }
                      }}
                      disabled={(date) => isBefore(date, new Date()) && !isSameDay(date, new Date())}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Heure</FormLabel>
                <div className="space-y-2">
                  <Select
                    disabled={isSubmitting || useCustomTime}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <SelectValue placeholder="Sélectionner l'heure" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="00:00" disabled>
                          Aucun horaire disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="useCustomTime"
                      checked={useCustomTime}
                      onChange={(e) => setUseCustomTime(e.target.checked)}
                    />
                    <label htmlFor="useCustomTime" className="text-sm">
                      Saisir l'heure manuellement
                    </label>
                  </div>
                  
                  {useCustomTime && (
                    <Input
                      type="time"
                      value={customTime}
                      onChange={(e) => {
                        setCustomTime(e.target.value);
                        field.onChange(e.target.value);
                      }}
                      className="mt-2"
                      min="08:00"
                      max="20:00"
                      disabled={isSubmitting}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif du rendez-vous</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez le motif du rendez-vous"
                  className="resize-none"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select
                disabled={isSubmitting}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PLANNED">Planifié</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le rendez-vous"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
