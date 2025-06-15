
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface InvoiceDateInputProps {
  control: any;
  isSubmitting: boolean;
}

export function InvoiceDateInput({ control, isSubmitting }: InvoiceDateInputProps) {
  return (
    <div>
      <label className="block text-sm mb-1">Date de la facture</label>
      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <Input
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
