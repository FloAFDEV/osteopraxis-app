
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cabinet } from "@/types";
import { useAuthorizedOsteopaths } from "@/hooks/useAuthorizedOsteopaths";
import { Badge } from "@/components/ui/badge";
import { User, Users, UserCheck } from "lucide-react";

interface CabinetOsteopathSelectorProps {
  selectedCabinetId: number | "ALL" | null;
  selectedOsteopathId: number | "ALL" | null;
  onCabinetChange: (cabinetId: number | "ALL" | null) => void;
  onOsteopathChange: (osteopathId: number | "ALL" | null) => void;
  cabinets: Cabinet[];
}

export function CabinetOsteopathSelector({
  selectedCabinetId,
  selectedOsteopathId,
  onCabinetChange,
  onOsteopathChange,
  cabinets,
}: CabinetOsteopathSelectorProps) {
  const { osteopaths } = useAuthorizedOsteopaths();

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'self':
        return <User className="w-3 h-3" />;
      case 'replacement':
        return <UserCheck className="w-3 h-3" />;
      case 'cabinet_colleague':
        return <Users className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case 'self':
        return 'Moi';
      case 'replacement':
        return 'Remplacement';
      case 'cabinet_colleague':
        return 'Collègue';
      default:
        return 'Inconnu';
    }
  };

  const getAccessTypeBadgeColor = (accessType: string) => {
    switch (accessType) {
      case 'self':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'replacement':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cabinet_colleague':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1">
        <label className="text-sm font-medium">Cabinet</label>
        <Select
          value={selectedCabinetId === null ? "ALL" : String(selectedCabinetId)}
          onValueChange={(value) => {
            if (value === "ALL") {
              onCabinetChange("ALL");
            } else {
              onCabinetChange(Number(value));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les cabinets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les cabinets</SelectItem>
            {cabinets.map((cabinet) => (
              <SelectItem key={cabinet.id} value={String(cabinet.id)}>
                {cabinet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium">Ostéopathe</label>
        <Select
          value={selectedOsteopathId === null ? "ALL" : String(selectedOsteopathId)}
          onValueChange={(value) => {
            if (value === "ALL") {
              onOsteopathChange("ALL");
            } else {
              onOsteopathChange(Number(value));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les ostéopathes autorisés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les ostéopathes autorisés</SelectItem>
            {osteopaths.map((osteopath) => (
              <SelectItem key={osteopath.id} value={String(osteopath.id)}>
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1">
                    {osteopath.name ?? `Ostéopathe #${osteopath.id}`}
                  </span>
                  <Badge 
                    className={`ml-2 text-xs ${getAccessTypeBadgeColor(osteopath.access_type)}`}
                    variant="outline"
                  >
                    {getAccessTypeIcon(osteopath.access_type)}
                    <span className="ml-1">{getAccessTypeLabel(osteopath.access_type)}</span>
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
