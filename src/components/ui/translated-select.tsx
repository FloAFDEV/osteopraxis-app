
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEnumOptions } from "@/utils/patient-form-helpers";
import { useCabinets } from "@/hooks/useCabinets";
import { Cabinet } from "@/types";

interface TranslatedSelectProps {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  enumType: 'MaritalStatus' | 'Handedness' | 'Contraception' | 'Gender' | 'Cabinet';
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export const TranslatedSelect = ({
  value,
  onValueChange,
  enumType,
  placeholder,
  disabled = false,
  className,
}: TranslatedSelectProps) => {
  const { data: cabinets = [], isLoading: loading } = useCabinets();

  // Obtention des options selon le type d'énumération
  const getOptions = () => {
    if (enumType === 'Cabinet') {
      return cabinets.map(cabinet => ({
        value: cabinet.id.toString(),
        label: cabinet.name
      }));
    } else {
      return getEnumOptions(enumType);
    }
  };

  const options = getOptions();

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled || (enumType === 'Cabinet' && loading)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Chargement..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.filter(option => option.value && option.value.trim() !== '').map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TranslatedSelect;
