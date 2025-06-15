
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";

interface InvoiceAmountInputProps {
  register: UseFormRegister<any>;
  isSubmitting: boolean;
}

export function InvoiceAmountInput({ register, isSubmitting }: InvoiceAmountInputProps) {
  return (
    <div>
      <label className="block text-sm mb-1">Montant (€)</label>
      <Input
        step="0.01"
        min={0}
        type="number"
        {...register("amount", { valueAsNumber: true, min: 0 })}
        disabled={isSubmitting}
        inputMode="decimal"
      />
    </div>
  );
}
