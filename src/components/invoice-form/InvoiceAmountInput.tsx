
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";

interface InvoiceAmountInputProps {
  register: UseFormRegister<any>;
  isSubmitting: boolean;
}

export function InvoiceAmountInput({ register, isSubmitting }: InvoiceAmountInputProps) {
  return (
    <div>
      <Label htmlFor="amount-input" className="block text-sm mb-1">Montant (€)</Label>
      <Input
        id="amount-input"
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
