
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceDateInputProps {
  control: any;
  isSubmitting: boolean;
}

export function InvoiceDateInput({ control, isSubmitting }: InvoiceDateInputProps) {
  return (
    <div>
      <Label htmlFor="date-input" className="block text-sm mb-1">Date de la facture</Label>
      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <Input
            id="date-input"
            type="date"
            {...field}
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            disabled={isSubmitting}
          />
        )}
      />
    </div>
  );
}
