
import { Controller } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const paymentStatusOptions = [
  { value: "PENDING", label: "En attente" },
  { value: "PAID", label: "Payée" },
  { value: "CANCELED", label: "Annulée" },
];

const paymentMethods = [
  { value: "ESPECES", label: "Espèces" },
  { value: "CARTE", label: "Carte bancaire" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "AUTRE", label: "Autre" },
];

interface InvoicePaymentFieldsProps {
  control: any;
  isSubmitting: boolean;
}

export function InvoicePaymentFields({ control, isSubmitting }: InvoicePaymentFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm mb-1">Statut de paiement</label>
        <Controller
          control={control}
          name="paymentStatus"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le statut" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Mode de paiement</label>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </>
  );
}
