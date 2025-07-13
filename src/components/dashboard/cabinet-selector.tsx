import { useEffect, useState } from "react";
import { Cabinet } from "@/types";
import { api } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Filter } from "lucide-react";

interface CabinetSelectorProps {
  onCabinetChange: (cabinetId: number | null, cabinetName?: string) => void;
  selectedCabinetId?: number | null;
}

export function CabinetSelector({ onCabinetChange, selectedCabinetId }: CabinetSelectorProps) {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCabinets = async () => {
      try {
        setLoading(true);
        const cabinetData = await api.getCabinets();
        setCabinets(cabinetData || []);
      } catch (error) {
        console.error("Erreur lors du chargement des cabinets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCabinets();
  }, []);

  // Si un seul cabinet ou aucun cabinet, ne pas afficher le sélecteur
  if (loading || cabinets.length <= 1) {
    return null;
  }

  const selectedCabinet = cabinets.find(c => c.id === selectedCabinetId);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Filter className="h-4 w-4" />
            Filtrer par cabinet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCabinetId?.toString() || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onCabinetChange(null);
              } else {
                const cabinetId = parseInt(value);
                const cabinet = cabinets.find(c => c.id === cabinetId);
                onCabinetChange(cabinetId, cabinet?.name);
              }
            }}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Sélectionner un cabinet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Tous les cabinets confondus
                </div>
              </SelectItem>
              {cabinets.map((cabinet) => (
                <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {cabinet.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCabinet && (
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 text-center">
              Cabinet sélectionné : <span className="font-medium">{selectedCabinet.name}</span>
            </div>
          )}
          
          {!selectedCabinetId && (
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
              Affichage de tous les cabinets confondus
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}