import { useEffect, useState } from "react";
import { Invoice, Appointment, Patient, Osteopath } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/api";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { InvoiceDateInput } from "./invoice-form/InvoiceDateInput";
import { InvoiceAmountInput } from "./invoice-form/InvoiceAmountInput";
import { InvoicePaymentFields } from "./invoice-form/InvoicePaymentFields";
import { InvoiceOsteopathInput } from "./invoice-form/InvoiceOsteopathInput";
import { InvoiceCabinetInput } from "./invoice-form/InvoiceCabinetInput";

const schema = z.object({
  date: z.string().nonempty("Date de la note d'honoraires requise"),
  amount: z
    .number({ required_error: "Le montant est requis" })
    .min(0.01, "Le montant doit être supérieur à 0"),
  notes: z.string().optional(),
  paymentMethod: z.string().nonempty("Le mode de paiement est requis"),
  paymentStatus: z.string().nonempty("Le statut de paiement est requis"),
  tvaExoneration: z.boolean().default(true),
  tvaMotif: z.string().optional(),
  osteopathId: z.number({ required_error: "Émetteur requis" }),
});

interface InvoiceFormProps {
  patient?: Patient | null;
  appointment?: Appointment | null;
  invoice?: Invoice | null;
  onCreate?: () => void;
  onUpdate?: () => void;
  cabinetId?: number;
  osteopathId?: number;
  osteopath?: Osteopath | null;
}

export function InvoiceForm({
  patient,
  appointment,
  invoice,
  onCreate,
  onUpdate,
  cabinetId,
  osteopathId,
  osteopath,
}: InvoiceFormProps) {
  const isEditing = !!invoice;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDate = invoice?.date
    ? (invoice.date.length > 10 ? invoice.date.slice(0, 10) : invoice.date)
    : format(new Date(), "yyyy-MM-dd");

  // Si invoice, garder son ostéopathe, sinon celui passé en props
  const defaultOsteoId = invoice?.osteopathId ?? osteopathId ?? undefined;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate,
      amount: invoice?.amount ?? 0,
      notes: invoice?.notes ?? "",
      paymentMethod: invoice?.paymentMethod ?? "",
      paymentStatus: invoice?.paymentStatus ?? "PENDING",
      tvaExoneration: invoice?.tvaExoneration ?? true,
      tvaMotif: invoice?.tvaMotif ?? "TVA non applicable - Article 261-4-1° du CGI",
      osteopathId: defaultOsteoId,
    },
  });

  const tvaExoneration = form.watch("tvaExoneration");

  // SUBMIT
  const onSubmit = async (data: any) => {
    // Validation avec alertes
    const validationErrors = [];
    
    if (!patient) {
      validationErrors.push("• Patient requis");
    }
    if (!data.osteopathId) {
      validationErrors.push("• Émetteur (ostéopathe) requis");
    }
    if (!data.date) {
      validationErrors.push("• Date de la note d'honoraires requise");
    }
    if (!data.amount || data.amount <= 0) {
      validationErrors.push("• Montant valide requis");
    }
    if (!data.paymentMethod) {
      validationErrors.push("• Mode de paiement requis");
    }
    if (!data.paymentStatus) {
      validationErrors.push("• Statut de paiement requis");
    }

    if (validationErrors.length > 0) {
      toast.error(
        "Veuillez corriger les erreurs suivantes :\n" + validationErrors.join("\n"),
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const invoiceData: Partial<Invoice> = {
        ...data,
        date: data.date ? new Date(data.date).toISOString() : undefined,
        patientId: patient.id,
        appointmentId: appointment?.id,
        osteopathId: data.osteopathId,
        cabinetId: cabinetId ?? appointment?.cabinetId ?? patient.cabinetId ?? null,
        tvaExoneration: data.tvaExoneration,
        tvaMotif: data.tvaExoneration
          ? "TVA non applicable - Article 261-4-1° du CGI"
          : data.tvaMotif || "",
      };
      if (isEditing && invoice) {
        await api.updateInvoice(invoice.id, invoiceData);
        toast.success("Note d'honoraires mise à jour !");
        onUpdate?.();
      } else {
        await api.createInvoice(invoiceData as any);
        toast.success("Note d'honoraires créée !");
        onCreate?.();
      }
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement de la note d'honoraires.");
      console.error(e);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-lg font-semibold mb-2">
        Note d'honoraires
      </h2>
      {/* Émetteur (ostéopathe) */}
      <InvoiceOsteopathInput control={form.control} isSubmitting={isSubmitting} />
      {/* Patient */}
      <div>
        <Label htmlFor="patient-input" className="block text-sm mb-1 font-semibold text-muted-foreground">Patient</Label>
        <Input
          id="patient-input"
          disabled
          value={
            patient
              ? (patient.lastName + " " + patient.firstName)
              : ""
          }
        />
      </div>
      {/* Date */}
      <InvoiceDateInput control={form.control} isSubmitting={isSubmitting} />
      {/* Montant */}
      <InvoiceAmountInput register={form.register} isSubmitting={isSubmitting} />
      {/* Statut & Paiement */}
      <InvoicePaymentFields control={form.control} isSubmitting={isSubmitting} />
      {/* Exonération TVA */}
      <div className="mt-2">
        <div className="flex items-center gap-2">
            <Controller
            control={form.control}
            name="tvaExoneration"
            render={({ field }) => (
              <Checkbox
                id="tva-exoneration"
                checked={!!field.value}
                onCheckedChange={checked => field.onChange(!!checked)}
                disabled={isSubmitting}
              />
            )}
          />
          <Label htmlFor="tva-exoneration" className="text-sm">
            Exonération de TVA
          </Label>
        </div>
        {/* Si pas d'exonération → motif obligatoire */}
        {!tvaExoneration && (
          <div className="mt-2">
            <Label htmlFor="tva-motif" className="block text-xs mb-1">Motif</Label>
            <Input
              id="tva-motif"
              {...form.register("tvaMotif")}
              disabled={isSubmitting || tvaExoneration}
              placeholder="Renseigner le motif d'application de la TVA"
            />
          </div>
        )}
        {tvaExoneration && (
          <div className="mt-1 text-xs text-gray-500">
            TVA non applicable - Article 261-4-1° du CGI
          </div>
        )}
      </div>
      {/* Notes complémentaires */}
      <div>
        <Label htmlFor="notes-input" className="block text-sm mb-1">Notes complémentaires</Label>
        <Textarea id="notes-input" {...form.register("notes")} disabled={isSubmitting} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? "Mettre à jour" : "Créer la note d'honoraires"}
        </Button>
      </div>
    </form>
  );
}