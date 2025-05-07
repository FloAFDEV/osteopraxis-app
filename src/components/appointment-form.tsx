import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isBefore, isSameDay, setHours, setMinutes } from "date-fns";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { checkAppointmentConflict } from "@/utils/appointment-utils";

// Custom validation function to check if appointment time is in the past
const isAppointmentInPast = (date: Date, timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const appointmentDateTime = setMinutes(setHours(new Date(date), hours), minutes);
  const now = new Date();
  return isBefore(appointmentDateTime, now);
};

// Create schema base
const appointmentFormSchema = z.object({
  patientId: z.number({
    required_error: "Veuillez sélectionner un patient"
  }),
  date: z.date({
    required_error: "Veuillez sélectionner une date"
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Veuillez sélectionner une heure valide (HH:MM)"
  }),
  reason: z.string().min(3, {
    message: "La raison doit contenir au moins 3 caractères"
  }),
  notes: z.string().optional(), // Added field for session report
  // Updated to account for both status spellings
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "CANCELED", "RESCHEDULED", "NO_SHOW"], {
    required_error: "Veuillez sélectionner un statut"
  })
});

// Create a custom refinement function that properly handles the context
const refinePastAppointments = (isEditing: boolean) => {
  return appointmentFormSchema.superRefine((data, ctx) => {
    // Pour les nouvelles séances seulement, vérifier que le temps n'est pas dans le passé
    if (!isEditing && isSameDay(data.date, new Date())) {
      if (isAppointmentInPast(data.date, data.time)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vous ne pouvez pas prendre une séance dans le passé",
          path: ["time"]
        });
      }
    }
  });
};

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  patients: Patient[];
  defaultValues?: Partial<AppointmentFormValues>;
  appointmentId?: number;
  isEditing?: boolean;
}

// Ajout d'une fonction pour filtrer les patients selon la recherche
function filterPatients(search: string, patients: Patient[]): Patient[] {
  const term = search.trim().toLowerCase();
  if (term === "") return patients;
  return patients.filter(p => p.firstName.toLowerCase().includes(term) || p.lastName.toLowerCase().includes(term) || `${p.firstName} ${p.lastName}`.toLowerCase().includes(term));
}

export function AppointmentForm({
  patients,
  defaultValues,
  appointmentId,
  isEditing = false
}: AppointmentFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTime, setCustomTime] = useState<string>(defaultValues?.time || "09:00");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [patientSearch, setPatientSearch] = useState(""); 
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Find the selected patient
  useEffect(() => {
    if (defaultValues?.patientId) {
      const patient = patients.find(p => p.id === defaultValues.patientId);
      setSelectedPatient(patient || null);
    }
  }, [patients, defaultValues?.patientId]);

  // Use the custom schema with refinement
  const schema = refinePastAppointments(isEditing);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: defaultValues?.patientId,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      time: defaultValues?.time || "09:00",
      reason: defaultValues?.reason || "",
      notes: defaultValues?.notes || "",
      status: defaultValues?.status || "SCHEDULED"
    }
  });

  // Observe patientId changes to update selectedPatient
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "patientId" && value.patientId) {
        const patient = patients.find(p => p.id === value.patientId);
        setSelectedPatient(patient || null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, patients]);

  // Generate available time slots (current time onward if today, and between 8h-20h)
  const generateAvailableTimes = () => {
    const now = new Date();
    const selectedDate = form.watch("date");
    const isToday = isSameDay(selectedDate, now);

    // Ne pas filtrer les créneaux si en mode édition d'une séance existante
    if (isEditing) {
      // Générer tous les slots de 30 minutes de 8h à 20h
      return Array.from({ length: 24 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8; // Starting from 8 AM
        const minute = i % 2 * 30; // 0 or 30 minutes
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      }).filter(time => {
        const hour = parseInt(time.split(":")[0]);
        return hour < 20; // Ne pas proposer après 20h
      });
    }

    // Si c'est aujourd'hui, commencer à partir de l'heure actuelle
    // Sinon commencer à 8h00 (slots commencent à 8h)
    const currentHour = isToday ? now.getHours() : 8;
    const currentMinute = isToday ? now.getMinutes() : 0;

    // Calculer le slot de départ (chaque slot fait 30 minutes)
    const startSlot = isToday ? Math.ceil((currentHour * 60 + currentMinute) / 30) : 16; // 16 = 8h00 (les slots commencent à minuit, donc 8h = 16 slots de 30min)

    // Générer tous les slots de 30 minutes de l'heure actuelle jusqu'à 20h
    const totalSlotsInDay = 40; // 20h = 40 slots de 30min depuis minuit
    const maxSlot = Math.min(totalSlotsInDay, 40); // Ne pas dépasser 20h

    return Array.from({
      length: maxSlot - startSlot
    }, (_, i) => {
      const totalMinutes = (startSlot + i) * 30;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      if (hour >= 20) return null; // Ne pas proposer de slots après 20h
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }).filter(Boolean) as string[];
  };
  const availableTimes = generateAvailableTimes();
  
  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      setIsSubmitting(true);

      // Combine date and time
      const dateTime = new Date(data.date);
      const timeToUse = useCustomTime ? customTime : data.time;
      const [hours, minutes] = timeToUse.split(':').map(Number);

      // Vérifier que l'heure est entre 8h et 20h
      if (hours < 8 || hours >= 20) {
        toast.error("Les séances doivent être prises entre 8h et 20h");
        setIsSubmitting(false);
        return;
      }
      dateTime.setHours(hours, minutes);

      // Check if appointment is in the past - uniquement pour les nouvelles séances
      if (!isEditing && isBefore(dateTime, new Date())) {
        toast.error("Vous ne pouvez pas prendre une séance dans le passé");
        setIsSubmitting(false);
        return;
      }

      // Check for conflicts before submitting - skip in editing mode for the current appointment
      if (!isEditing) {
        const hasConflict = await checkAppointmentConflict(data.date, timeToUse);
        if (hasConflict) {
          toast.error("Ce créneau horaire est déjà réservé. Veuillez choisir un autre horaire.");
          setIsSubmitting(false);
          return;
        }
      }

      // If status is COMPLETED and we have notes, update the patient's HDLM
      let shouldUpdatePatient = false;
      if (data.status === "COMPLETED" && data.notes && data.notes.trim() !== "" && selectedPatient) {
        shouldUpdatePatient = true;
      }

      const appointmentData = {
        patientId: data.patientId,
        date: dateTime.toISOString(),
        reason: data.reason,
        notes: data.notes, // Include the session report
        status: data.status as AppointmentStatus,
        notificationSent: false
      };
      
      console.log("Mode:", isEditing ? "Édition" : "Création", "Données:", appointmentData);
      
      let result;
      if (isEditing && appointmentId) {
        // Update existing appointment
        result = await api.updateAppointment(appointmentId, appointmentData);
        toast.success("Séance mise à jour avec succès");
      } else {
        // Create new appointment
        result = await api.createAppointment(appointmentData);
        toast.success("Séance créée avec succès");
      }

      // If we need to update the patient's HDLM field with the session notes
      if (shouldUpdatePatient && selectedPatient) {
        try {
          const currentDate = new Date().toLocaleDateString('fr-FR');
          const formattedNotes = `${currentDate} - ${data.reason}: ${data.notes}`;
          
          // Prepare the updated HDLM - either append to existing or create new
          const updatedHdlm = selectedPatient.hdlm 
            ? `${selectedPatient.hdlm}\n\n${formattedNotes}`
            : formattedNotes;
            
          await api.updatePatient(selectedPatient.id, {
            ...selectedPatient,
            hdlm: updatedHdlm
          });
          console.log("HDLM du patient mis à jour avec succès");
        } catch (error) {
          console.error("Erreur lors de la mise à jour du HDLM du patient:", error);
          // Ne pas bloquer la navigation pour cette action secondaire
        }
      }

      navigate("/appointments");
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire de séance:", error);
      if (error instanceof Error && error.name === "AppointmentConflictError") {
        toast.error("Ce créneau horaire est déjà réservé. Veuillez choisir un autre horaire.");
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update available times when date changes
  form.watch("date");

  // patients filtrés selon la recherche
  const filteredPatients = filterPatients(patientSearch, patients);
  
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Champ de recherche + Select */}
        <FormField control={form.control} name="patientId" render={({
        field
      }) => <FormItem>
              <FormLabel>Patient</FormLabel>
              {/* Champ de recherche */}
              <input
                type="text"
                placeholder="Rechercher un patient"
                value={patientSearch}
                autoComplete="off"
                onChange={e => setPatientSearch(e.target.value)}
                disabled={isSubmitting}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Select disabled={isSubmitting} onValueChange={value => field.onChange(parseInt(value, 10))} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredPatients.length > 0 ? filteredPatients.map(patient => <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>) : <SelectItem value="" disabled>
                      Aucun patient trouvé
                    </SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />

        <div className="flex flex-col md:flex-row gap-4">
          <FormField control={form.control} name="date" render={({
          field
        }) => <FormItem className="flex-1">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isSubmitting}>
                        {field.value ? format(field.value, "EEEE d MMMM yyyy", {
                    locale: fr
                  }) : <span>Sélectionner une date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={date => {
                field.onChange(date);
                // Ne pas réinitialiser l'heure en mode édition
                if (!isEditing && date && isSameDay(date, new Date())) {
                  const now = new Date();
                  const currentTimeSlot = availableTimes[0];
                  if (currentTimeSlot) {
                    form.setValue("time", currentTimeSlot);
                  }
                }
              }} 
              // En mode édition, permettre de sélectionner n'importe quelle date
              disabled={isEditing ? undefined : (date => isBefore(date, new Date()) && !isSameDay(date, new Date()))} 
              initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>} />

          <FormField control={form.control} name="time" render={({
          field
        }) => <FormItem className="flex-1">
                <FormLabel>Heure</FormLabel>
                <div className="space-y-2">
                  <Select disabled={isSubmitting || useCustomTime} onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'heure" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {availableTimes.length > 0 ? availableTimes.map(time => <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>) : <SelectItem value="00:00" disabled>
                          Aucun horaire disponible
                        </SelectItem>}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="useCustomTime" checked={useCustomTime} onChange={e => setUseCustomTime(e.target.checked)} />
                    <label htmlFor="useCustomTime" className="text-sm">
                      Saisir l'heure manuellement
                    </label>
                  </div>
                  
                  {useCustomTime && <Input type="time" value={customTime} onChange={e => {
              const newTime = e.target.value;
              const [hours] = newTime.split(':').map(Number);

              // Vérifier que l'heure est entre 8h et 20h
              if (hours < 8 || hours >= 20) {
                toast.error("Les séances doivent être prises entre 8h et 20h");
                return;
              }
              setCustomTime(newTime);
              field.onChange(newTime);
            }} className="mt-2" min="08:00" max="20:00" disabled={isSubmitting} />}
                </div>
                <FormMessage />
              </FormItem>} />
        </div>

        <FormField control={form.control} name="reason" render={({
        field
      }) => <FormItem>
              <FormLabel>Motif de la séance</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez le motif de la séance" className="resize-none" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        {/* New field for session notes/report */}
        <FormField control={form.control} name="notes" render={({
        field
      }) => <FormItem>
              <FormLabel>Compte rendu de séance</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Entrez vos notes et observations sur cette séance"
                  className="resize-vertical min-h-[120px]"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {selectedPatient && selectedPatient.hdlm && (
                <div className="mt-2 p-3 bg-muted/30 border rounded-md">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">Historique du patient:</p>
                  <div className="max-h-24 overflow-y-auto text-sm whitespace-pre-line">
                    {selectedPatient.hdlm}
                  </div>
                </div>
              )}
            </FormItem>} />

        <FormField control={form.control} name="status" render={({
        field
      }) => <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select disabled={isSubmitting} onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Planifiée</SelectItem>
                  <SelectItem value="COMPLETED">Terminée</SelectItem>
                  <SelectItem value="CANCELED">Annulée</SelectItem>
                  <SelectItem value="RESCHEDULED">Reportée</SelectItem>
                  <SelectItem value="NO_SHOW">Non présenté</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer la séance"}
          </Button>
        </div>
      </form>
    </Form>;
}
