
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDateForInput, formatTimeForInput } from "@/lib/date-utils";
import { AppointmentFormProps } from "@/types";

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Sélectionnez un patient" }),
  cabinetId: z.string().optional(),
  date: z.string().min(1, { message: "Sélectionnez une date" }),
  startTime: z.string().min(1, { message: "Sélectionnez une heure de début" }),
  endTime: z.string().min(1, { message: "Sélectionnez une heure de fin" }),
  reason: z.string().optional(),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export default function AppointmentForm({
  patients,
  cabinets,
  defaultValues,
  appointmentId,
  isEditing = false,
  initialDate,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: AppointmentFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(
    defaultValues?.patientId || null
  );

  // Format the date to YYYY-MM-DD
  const initialDateFormatted = initialDate
    ? formatDateForInput(initialDate)
    : "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: defaultValues?.patientId?.toString() || "",
      cabinetId: defaultValues?.cabinetId?.toString() || "",
      date: defaultValues?.date || initialDateFormatted || "",
      startTime: defaultValues?.startTime || "09:00",
      endTime: defaultValues?.endTime || "10:00",
      reason: defaultValues?.reason || "",
      status: defaultValues?.status || "PLANNED",
    },
  });

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (onSubmit) {
      await onSubmit({
        ...values,
        patientId: parseInt(values.patientId),
        cabinetId: values.cabinetId ? parseInt(values.cabinetId) : undefined,
        id: appointmentId || undefined,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-w-3xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient selection */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient*</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedPatient(parseInt(value));
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients?.map((patient) => (
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

          {/* Cabinet selection */}
          {cabinets && cabinets.length > 0 && (
            <FormField
              control={form.control}
              name="cabinetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cabinet (optionnel)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cabinet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cabinets.map((cabinet) => (
                        <SelectItem
                          key={cabinet.id}
                          value={cabinet.id.toString()}
                        >
                          {cabinet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start time */}
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de début*</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End time */}
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de fin*</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
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
        </div>

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif du rendez-vous (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Douleur cervicale, suivi, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent"></span>
                {isEditing ? "Mise à jour..." : "Création..."}
              </span>
            ) : (
              <span>{isEditing ? "Mettre à jour" : "Créer le rendez-vous"}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
