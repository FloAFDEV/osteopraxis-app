
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Appointment, AppointmentStatus } from "@/types";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect } from "react";

// Add missing properties to the Appointment type
interface SessionFormAppointment extends Appointment {
  plannedTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

const sessionSchema = z.object({
  patientId: z.number().min(1, "Veuillez sélectionner un patient"),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  plannedTime: z.string().min(5, "Veuillez sélectionner une heure"),
  reason: z.string().min(2, "Veuillez saisir un motif"),
  notes: z.string().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELED", "RESCHEDULED", "NO_SHOW", "IN_PROGRESS"]),
  actualStartTime: z.string().optional(),
  actualEndTime: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

interface SessionFormProps {
  onSubmit: (values: any) => Promise<void>;
  patients: { id: number; firstName: string; lastName: string }[];
  initialData?: SessionFormAppointment;
  isSubmitting?: boolean;
}

export function SessionForm({
  onSubmit,
  patients,
  initialData,
  isSubmitting = false,
}: SessionFormProps) {
  const isEditing = !!initialData;

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      patientId: initialData?.patientId || 0,
      date: initialData?.date
        ? new Date(initialData.date.split("T")[0])
        : new Date(),
      plannedTime:
        initialData?.plannedTime ||
        format(new Date(), "HH:mm"),
      reason: initialData?.reason || "",
      notes: initialData?.notes || "",
      status: (initialData?.status as AppointmentStatus) || "SCHEDULED",
      actualStartTime: initialData?.actualStartTime || "",
      actualEndTime: initialData?.actualEndTime || "",
    },
  });

  const combineDateAndTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    return newDate.toISOString();
  };

  const handleFormSubmit = async (values: SessionFormValues) => {
    const combinedDateTime = combineDateAndTime(
      values.date,
      values.plannedTime
    );

    const sessionData = {
      patientId: values.patientId,
      date: combinedDateTime,
      reason: values.reason,
      notes: values.notes,
      status: values.status,
      notificationSent: initialData?.notificationSent || false,
      plannedTime: values.plannedTime,
      actualStartTime: values.actualStartTime,
      actualEndTime: values.actualEndTime,
    };

    await onSubmit(sessionData);
  };

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        patientId: initialData.patientId,
        date: initialData.date ? new Date(initialData.date.split("T")[0]) : new Date(),
        plannedTime:
          initialData.plannedTime ||
          format(new Date(initialData.date), "HH:mm"),
        reason: initialData.reason,
        notes: initialData.notes || "",
        status: initialData.status as AppointmentStatus,
        actualStartTime: initialData.actualStartTime || "",
        actualEndTime: initialData.actualEndTime || "",
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                  disabled={isEditing}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <DatePicker
                    date={field.value}
                    onSelect={field.onChange}
                    defaultMonth={field.value}
                    selected={field.value}
                    mode="single"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plannedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif</FormLabel>
              <FormControl>
                <Input placeholder="Motif de la séance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Planifiée</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="COMPLETED">Terminée</SelectItem>
                      <SelectItem value="CANCELED">Annulée</SelectItem>
                      <SelectItem value="RESCHEDULED">Reportée</SelectItem>
                      <SelectItem value="NO_SHOW">Absence</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de début réelle</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>Optionnel</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de fin réelle</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>Optionnel</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observations, résultats, traitement..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ces notes seront visibles dans le dossier du patient
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Enregistrement en cours..."
            : isEditing
            ? "Mettre à jour la séance"
            : "Créer la séance"}
        </Button>
      </form>
    </Form>
  );
}
