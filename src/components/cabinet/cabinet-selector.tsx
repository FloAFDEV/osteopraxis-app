import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Building, ChevronDown } from "lucide-react";
import { Cabinet } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentOsteopathId } from "@/services";

interface CabinetSelectorProps {
  selectedCabinetId?: number;
  onCabinetChange?: (cabinetId: number) => void;
  className?: string;
}

export const CabinetSelector: React.FC<CabinetSelectorProps> = ({
  selectedCabinetId,
  onCabinetChange,
  className = ""
}) => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [osteopathId, setOsteopathId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Effet pour récupérer l'ostéopathId courant pour le debug
  useEffect(() => {
    const getOsteopathId = async () => {
      try {
        const id = await getCurrentOsteopathId();
        setOsteopathId(id);
        console.log("CabinetSelector - OsteopathId connecté:", id);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'osteopathId:", error);
      }
    };
    
    getOsteopathId();
  }, []);

  useEffect(() => {
    const loadCabinets = async () => {
      try {
        setLoading(true);
        const userCabinets = await api.getCabinets();
        console.log(`CabinetSelector - ${userCabinets.length} cabinets chargés pour l'ostéopathe ${osteopathId}`);
        
        // Log pour debug
        if (userCabinets.length > 0) {
          userCabinets.forEach(cab => {
            console.log(`Cabinet ${cab.id}: ${cab.name} (osteopathId: ${cab.osteopathId})`);
          });
        }
        
        setCabinets(userCabinets);
        
        // Si aucun cabinet n'est sélectionné mais qu'il y en a disponibles, sélectionner le premier
        if (!selectedCabinetId && userCabinets.length > 0) {
          setSelectedCabinet(userCabinets[0]);
          if (onCabinetChange) {
            onCabinetChange(userCabinets[0].id);
          }
        } 
        // Si un cabinet est sélectionné, le trouver dans la liste
        else if (selectedCabinetId) {
          const cabinet = userCabinets.find(c => c.id === selectedCabinetId);
          if (cabinet) {
            setSelectedCabinet(cabinet);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des cabinets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCabinets();
  }, [selectedCabinetId, onCabinetChange, osteopathId]);

  const handleCabinetSelect = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet);
    if (onCabinetChange) {
      onCabinetChange(cabinet.id);
    }
  };

  if (loading) {
    return (
      <Skeleton className={`h-9 w-[200px] rounded-md ${className}`} />
    );
  }

  if (cabinets.length === 0) {
    return (
      <Button 
        variant="outline" 
        onClick={() => navigate("/cabinets/new")}
        className={`${className} flex items-center gap-2`}
      >
        <Building className="h-4 w-4" />
        <span>Créer un cabinet</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`${className} flex justify-between items-center gap-2 w-[220px]`}
        >
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4 shrink-0" />
            <span className="truncate">{selectedCabinet?.name || "Sélectionner un cabinet"}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {cabinets.map((cabinet) => (
          <DropdownMenuItem
            key={cabinet.id}
            onClick={() => handleCabinetSelect(cabinet)}
            className={`cursor-pointer ${
              selectedCabinet?.id === cabinet.id ? "bg-accent" : ""
            }`}
          >
            <div className="flex items-center gap-2 w-full truncate">
              <Building className="h-4 w-4 shrink-0" />
              <span className="truncate">{cabinet.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem 
          onClick={() => navigate("/cabinets/new")}
          className="border-t mt-1 pt-1 cursor-pointer"
        >
          <div className="flex items-center gap-2 w-full">
            <Building className="h-4 w-4" />
            <span>Ajouter un cabinet</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
