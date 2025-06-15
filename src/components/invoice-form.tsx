import { useEffect, useState } from "react";
import { Invoice, Appointment, Patient, Osteopath } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// Les méthodes de paiement et statuts proposés
const paymentMethods = [
  { value: "ESPECES", label: "Espèces" },
  { value: "CARTE", label: "Carte bancaire" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "AUTRE", label: "Autre" },
];

// Labels "statut féminin"
const paymentStatusOptions = [
  { value: "PENDING", label: "En attente" },
  { value: "PAID", label: "Payée" },
  { value: "CANCELED", label: "Annulée" },
];

const schema = z.object({
  date: z.string().nonempty("Date requise"),
  amount: z.number({ invalid_type_error: "Champ obligatoire" })
    .min(0, "Le montant ne peut pas être négatif"),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  tvaExoneration: z.boolean().default(true),
  tvaMotif: z.string().optional(),
});

interface InvoiceFormProps {
  patient?: Patient | null;
  appointment?: Appointment | null;
  invoice?: Invoice | null;
  onCreate?: () => void;
  onUpdate?: () => void;
  cabinetId?: number;
  osteopathId?: number;
  osteopath?: Osteopath | null; // Ajout
}

export function InvoiceForm({
  patient,
  appointment,
  invoice,
  onCreate,
  onUpdate,
  cabinetId,
  osteopathId,
  osteopath, // Ajout
}: InvoiceFormProps) {
  const isEditing = !!invoice;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOsteopathId, setCurrentOsteopathId] = useState<number | null>(osteopathId ?? null);

  const defaultDate = invoice?.date
    ? (invoice.date.length > 10 ? invoice.date.slice(0, 10) : invoice.date)
    : format(new Date(), "yyyy-MM-dd");

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
    },
  });

  // Gérer le fetch de l'ostéo courant SI non passé en paramètre
  useEffect(() => {
    if (currentOsteopathId === null && !osteopathId) {
      getCurrentOsteopathId().then(oId => setCurrentOsteopathId(oId));
    }
  }, [osteopathId, currentOsteopathId]);

  const tvaExoneration = form.watch("tvaExoneration");

  const onSubmit = async (data: any) => {
    if (!patient) {
      toast.error("Veuillez spécifier un patient.");
      return;
    }
    const assignedOsteopathId = osteopathId ?? currentOsteopathId;
    if (!assignedOsteopathId) {
      toast.error("Impossible d’identifier l’ostéopathe.");
      return;
    }
    setIsSubmitting(true);

    try {
      const invoiceData: Partial<Invoice> = {
        ...data,
        // Conversion nécessaire : date -> ISO string
        date: data.date ? new Date(data.date).toISOString() : undefined,
        patientId: patient.id,
        appointmentId: appointment?.id,
        osteopathId: assignedOsteopathId,
        cabinetId: cabinetId ?? appointment?.cabinetId ?? patient.cabinetId ?? null,
        tvaExoneration: data.tvaExoneration,
        tvaMotif: data.tvaExoneration
          ? "TVA non applicable - Article 261-4-1° du CGI"
          : data.tvaMotif || "",
      };
      if (isEditing && invoice) {
        await api.updateInvoice(invoice.id, invoiceData);
        toast.success("Facture mise à jour !");
        onUpdate?.();
      } else {
        await api.createInvoice(invoiceData as any);
        toast.success("Facture créée !");
        onCreate?.();
      }
    } catch (e) {
      toast.error("Erreur lors de l’enregistrement de la facture.");
      console.error(e);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Titre contextuel */}
      <h2 className="text-lg font-semibold mb-2">
        {isEditing ? "Modifier la facture/note d’honoraires" : "Nouvelle facture / Note d'honoraires"}
      </h2>
      {/* Émetteur */}
      {(osteopath || osteopathId) && (
        <div>
          <label className="block text-sm mb-1 font-semibold text-muted-foreground">
            Émetteur (Ostéopathe)
          </label>
          <Input
            disabled
            value={osteopath?.name ?? ("#" + (osteopathId ?? ""))}
          />
          <p className="text-xs text-gray-500">
            Renseigné automatiquement, non modifiable.
          </p>
        </div>
      )}
      {/* Patient */}
      <div>
        <label className="block text-sm mb-1 font-semibold text-muted-foreground">Patient</label>
        <Input
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
                checked={!!field.value}
                onCheckedChange={checked => field.onChange(!!checked)}
                disabled={isSubmitting}
              />
            )}
          />
          <label className="text-sm">
            Exonération de TVA
          </label>
        </div>
        {/* Si pas d’exonération → motif obligatoire */}
        {!tvaExoneration && (
          <div className="mt-2">
            <label className="block text-xs mb-1">Motif</label>
            <Input
              {...form.register("tvaMotif")}
              disabled={isSubmitting || tvaExoneration}
              placeholder="Renseigner le motif d’application de la TVA"
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
        <label className="block text-sm mb-1">Notes complémentaires</label>
        <Textarea {...form.register("notes")} disabled={isSubmitting} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? "Mettre à jour" : "Créer la facture"}
        </Button>
      </div>
    </form>
  );
}
