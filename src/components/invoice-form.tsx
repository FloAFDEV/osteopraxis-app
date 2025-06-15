
import { useEffect, useState } from "react";
import { Invoice, Appointment, Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/api";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";
import { Loader2 } from "lucide-react";

const schema = z.object({
  amount: z.number().min(0),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
});

interface InvoiceFormProps {
  patient?: Patient | null;
  appointment?: Appointment | null;
  invoice?: Invoice | null;
  onCreate?: () => void;
  onUpdate?: () => void;
}

export function InvoiceForm({ patient, appointment, invoice, onCreate, onUpdate }: InvoiceFormProps) {
  const isEditing = !!invoice;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [osteopathId, setOsteopathId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: invoice?.amount || 0,
      notes: invoice?.notes || "",
      paymentMethod: invoice?.paymentMethod || "",
      paymentStatus: invoice?.paymentStatus || "PENDING",
    },
  });

  useEffect(() => {
    // On récupère l'ID de l'ostéopathe connecté une seule fois au mount
    getCurrentOsteopathId().then(oId => setOsteopathId(oId));
  }, []);

  const onSubmit = async (data: any) => {
    if (!patient) {
      toast.error("Veuillez spécifier un patient.");
      return;
    }
    if (!osteopathId) {
      toast.error("Impossible d’identifier l’ostéopathe.");
      return;
    }
    setIsSubmitting(true);

    try {
      const invoiceData: Partial<Invoice> = {
        ...data,
        patientId: patient.id,
        appointmentId: appointment?.id,
        osteopathId: osteopathId,
        // Prêt pour usage futur :
        cabinetId: appointment?.cabinetId || patient.cabinetId || null,
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
      {osteopathId && (
        <div>
          <label className="block text-sm mb-1 font-semibold text-muted-foreground">Émetteur (Ostéopathe)</label>
          <Input disabled value={"#" + osteopathId} />
          <p className="text-xs text-gray-500">Renseigné automatiquement, non modifiable.</p>
        </div>
      )}
      <div>
        <label className="block text-sm mb-1 font-semibold text-muted-foreground">Patient</label>
        <Input disabled value={patient ? patient.lastName + " " + patient.firstName : ""} />
      </div>
      <div>
        <label className="block text-sm mb-1">Montant (€)</label>
        <Input step="0.01" type="number" {...form.register("amount", { valueAsNumber: true })} disabled={isSubmitting} />
      </div>
      <div>
        <label className="block text-sm mb-1">Notes (facultatif)</label>
        <Input {...form.register("notes")} disabled={isSubmitting} />
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
