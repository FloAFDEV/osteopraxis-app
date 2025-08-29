
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEnumOptions } from "@/utils/patient-form-helpers";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
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
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Récupération des cabinets si nécessaire
  useEffect(() => {
    const fetchCabinets = async () => {
      if (enumType === 'Cabinet') {
        setLoading(true);
        try {
          const cabinetsList = await api.getCabinets();
          setCabinets(cabinetsList);
        } catch (error) {
          console.error("Erreur lors du chargement des cabinets:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCabinets();
  }, [enumType]);

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
