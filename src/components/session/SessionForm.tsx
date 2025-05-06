
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { toast } from 'sonner';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from "@/services/api";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SessionStatus } from "@/types/session";

const sessionFormSchema = z.object({
  patientId: z.number({
    required_error: "Patient requis",
  }),
  date: z.date({
    required_error: "Une date doit être sélectionnée.",
  }),
  plannedTime: z.string().optional(),
  actualStartTime: z.string().optional(),
  actualEndTime: z.string().optional(),
  reason: z.string().min(2, {
    message: "Le motif doit comporter au moins 2 caractères.",
  }),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'RESCHEDULED', 'NO_SHOW']),
})

type FormValues = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
  patient?: Patient;
  onCancel?: () => void;
}

export function SessionForm({ patient, onCancel }: SessionFormProps) {
  const [searchParams] = useSearchParams();
  const patientIdFromParams = searchParams.get("patientId");
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [isNew, setIsNew] = useState(true);
  const [initialValues, setInitialValues] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      patientId: patient?.id || (patientIdFromParams ? parseInt(patientIdFromParams, 10) : 0),
      date: new Date(),
      reason: '',
      notes: '',
      status: 'SCHEDULED',
    },
    mode: "onChange",
  })

  const { save, isSaving, lastSaved, error } = useAutoSave<FormValues>(
    form.getValues(),
    async (data) => {
      if (!data.patientId) {
        toast.error("Impossible d'auto-sauvegarder la session: Patient ID manquant.");
        return;
      }

      const sessionData = {
        date: data.date.toISOString(),
        patientId: data.patientId,
        reason: data.reason,
        status: data.status as AppointmentStatus,
        plannedTime: data.plannedTime || undefined,
        actualStartTime: data.actualStartTime || undefined,
        actualEndTime: data.actualEndTime || undefined,
        lastEditedAt: new Date().toISOString(),
        autoSaved: true,
        notificationSent: false,
        notes: data.notes || '',
      };

      try {
        if (id) {
          await api.updateAppointment(parseInt(id, 10), sessionData);
          toast.success("Session auto-sauvegardée");
        } else {
          await api.createAppointment(sessionData);
          toast.success("Session auto-sauvegardée");
        }
      } catch (error) {
        console.error("Erreur lors de l'auto-sauvegarde de la session:", error);
        toast.error("Échec de l'auto-sauvegarde de la session");
      }
    },
    {
      debounceMs: 500,
      notifyOnSave: false,
    }
  );

  useEffect(() => {
    const fetchSessionData = async () => {
      if (id) {
        setIsLoading(true);
        setIsNew(false);
        try {
          const sessionData = await api.getAppointmentById(parseInt(id, 10));
          if (sessionData) {
            // Convertir la date de la chaîne ISO 8601 à un objet Date
            const parsedDate = new Date(sessionData.date);

            form.setValue("patientId", sessionData.patientId);
            form.setValue("date", parsedDate);
            form.setValue("plannedTime", sessionData.plannedTime || "");
            form.setValue("actualStartTime", sessionData.actualStartTime || "");
            form.setValue("actualEndTime", sessionData.actualEndTime || "");
            form.setValue("reason", sessionData.reason);
            form.setValue("notes", sessionData.notes || "");
            form.setValue("status", sessionData.status as any);

            setInitialValues(sessionData);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données de la session:", error);
          toast.error("Erreur lors du chargement de la session. Veuillez réessayer.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsNew(true);
        if (patient) {
          form.setValue("patientId", patient.id);
        } else if (patientIdFromParams) {
          form.setValue("patientId", parseInt(patientIdFromParams, 10));
        }
      }
    };

    fetchSessionData();
  }, [id, patient, patientIdFromParams, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const sessionData = {
        date: values.date.toISOString(),
        patientId: values.patientId,
        reason: values.reason,
        status: values.status as AppointmentStatus,
        plannedTime: values.plannedTime || undefined,
        actualStartTime: values.actualStartTime || undefined,
        actualEndTime: values.actualEndTime || undefined,
        notes: values.notes || '',
        notificationSent: false,
      };

      if (id) {
        await api.updateAppointment(parseInt(id, 10), sessionData);
        toast.success("Session mise à jour avec succès!");
      } else {
        await api.createAppointment(sessionData);
        toast.success("Session créée avec succès!");
      }
      navigate('/appointments');
    } catch (error) {
      console.error("Erreur lors de la création/mise à jour de la session:", error);
      toast.error("Erreur lors de la création/mise à jour de la session. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!id) {
      toast.error("Impossible de modifier le statut: Session ID manquant.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.updateAppointment(parseInt(id, 10), { status: newStatus });
      form.setValue('status', newStatus as any);
      toast.success(`Statut mis à jour à ${newStatus}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Échec de la mise à jour du statut");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Créer une séance" : "Modifier la séance"}</CardTitle>
          <CardDescription>
            {isNew
              ? "Veuillez remplir tous les champs pour créer une nouvelle séance."
              : "Vous pouvez modifier les informations de la séance ici."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patient ? (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ) : (
                          <SelectItem key="1" value="1">
                            Patient Test
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Veuillez sélectionner le patient pour cette séance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de la séance</FormLabel>
                    <DatePicker
                      onSelect={field.onChange}
                      defaultMonth={field.value}
                      selected={field.value}
                      mode="single"
                    />
                    <FormDescription>
                      Veuillez sélectionner la date de la séance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plannedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure prévue</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        Heure prévue de la séance.
                      </FormDescription>
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
                      <FormDescription>
                        Heure de début réelle de la séance.
                      </FormDescription>
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
                      <FormDescription>
                        Heure de fin réelle de la séance.
                      </FormDescription>
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
                    <FormLabel>Motif</FormLabel>
                    <FormControl>
                      <Input placeholder="Motif de la séance" {...field} />
                    </FormControl>
                    <FormDescription>
                      Veuillez entrer le motif de la séance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes concernant la séance"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Veuillez entrer toutes les notes concernant la séance.
                    </FormDescription>
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
                    <FormDescription>
                      Veuillez sélectionner le statut de la séance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => onCancel ? onCancel() : navigate(-1)}
                  disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isNew ? "Créer" : "Mettre à jour"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
