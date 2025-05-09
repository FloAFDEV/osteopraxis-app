
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEnumOptions } from "@/utils/patient-form-helpers";

interface TranslatedSelectProps {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  enumType: 'MaritalStatus' | 'Handedness' | 'Contraception' | 'Gender';
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
  const options = getEnumOptions(enumType);

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TranslatedSelect;
