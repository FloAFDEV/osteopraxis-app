
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { Patient, AppointmentStatus } from "@/types";
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
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"], {
    required_error: "Veuillez sélectionner un statut",
  }),
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

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: defaultValues?.patientId,
      date: defaultValues?.date ? new Date(defaultValues.date) : undefined,
      time: defaultValues?.time || "09:00",
      reason: defaultValues?.reason || "",
      status: defaultValues?.status || "SCHEDULED",
    },
  });

  const availableTimes = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Starting from 8 AM
    const minute = (i % 2) * 30; // 0 or 30 minutes
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const dateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      const appointmentData = {
        patientId: data.patientId,
        date: dateTime.toISOString(),
        reason: data.reason,
        status: data.status as AppointmentStatus,
        notificationSent: false,
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
                      onSelect={field.onChange}
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
                <Select
                  disabled={isSubmitting}
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
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <SelectItem value="SCHEDULED">Planifié</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                  <SelectItem value="RESCHEDULED">Reporté</SelectItem>
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
