
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Users } from "lucide-react";
import { Cabinet } from "@/types";

interface CabinetFilterProps {
  cabinets: Cabinet[];
  selectedCabinetId: number | null;
  onCabinetChange: (cabinetId: number | null) => void;
  loading?: boolean;
}

const CabinetFilter: React.FC<CabinetFilterProps> = ({
  cabinets,
  selectedCabinetId,
  onCabinetChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (cabinets.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedCabinetId?.toString() || "all"}
        onValueChange={(value) => onCabinetChange(value === "all" ? null : parseInt(value))}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tous les cabinets
            </div>
          </SelectItem>
          {cabinets.map((cabinet) => (
            <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {cabinet.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CabinetFilter;
