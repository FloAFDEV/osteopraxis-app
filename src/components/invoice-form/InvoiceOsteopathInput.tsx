
import React from "react";
import { Controller } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthorizedOsteopaths } from "@/hooks/useAuthorizedOsteopaths";
import { Badge } from "@/components/ui/badge";
import { User, Users, UserCheck } from "lucide-react";

interface InvoiceOsteopathInputProps {
  control: any;
  isSubmitting: boolean;
  value?: number;
}

export function InvoiceOsteopathInput({ control, isSubmitting }: InvoiceOsteopathInputProps) {
  const { osteopaths, loading } = useAuthorizedOsteopaths();
  const selfOnly = (osteopaths || []).filter(o => o.access_type === 'self');

  if (loading) {
    return (
      <div>
        <Label htmlFor="osteopath-select-loading" className="block text-sm mb-1">Émetteur</Label>
        <Input id="osteopath-select-loading" disabled value="Chargement..." />
      </div>
    );
  }

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
    <div>
      <Label htmlFor="osteopath-select" className="block text-sm mb-1 font-semibold text-muted-foreground">Émetteur (Ostéopathe)</Label>
      <Controller
        control={control}
        name="osteopathId"
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : ""}
            onValueChange={v => field.onChange(Number(v))}
            disabled={isSubmitting}
          >
            <SelectTrigger id="osteopath-select">
              <SelectValue placeholder="Choisir l'ostéopathe émetteur" />
            </SelectTrigger>
            <SelectContent>
              {selfOnly.map(osteopath => (
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
        )}
      />
      {osteopaths.length === 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          Aucun ostéopathe autorisé trouvé
        </p>
      )}
    </div>
  );
}
