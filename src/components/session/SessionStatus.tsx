
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Edit, FileText, Save } from "lucide-react";

export type SessionStatus = "DRAFT" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";

interface SessionStatusProps {
  status: SessionStatus;
  onStatusChange: (status: SessionStatus) => void;
  onSave: () => void;
  onComplete: () => void;
  lastSaved?: Date;
  isAutoSaving?: boolean;
}

export function SessionStatus({
  status,
  onStatusChange,
  onSave,
  onComplete,
  lastSaved,
  isAutoSaving,
}: SessionStatusProps) {
  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case "DRAFT":
        return <Edit className="h-4 w-4 text-amber-500" />;
      case "PLANNED":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "IN_PROGRESS":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: SessionStatus) => {
    switch (status) {
      case "DRAFT":
        return "Brouillon";
      case "PLANNED":
        return "Planifiée";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminée";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
      <div className="flex items-center space-x-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Statut
          </label>
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as SessionStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span>{getStatusLabel(status)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-amber-500" />
                  <span>Brouillon</span>
                </div>
              </SelectItem>
              <SelectItem value="PLANNED">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Planifiée</span>
                </div>
              </SelectItem>
              <SelectItem value="IN_PROGRESS">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>En cours</span>
                </div>
              </SelectItem>
              <SelectItem value="COMPLETED">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Terminée</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {lastSaved && (
          <div className="text-xs text-muted-foreground">
            {isAutoSaving ? (
              <span className="flex items-center">
                <span className="animate-pulse mr-1">⬤</span> Sauvegarde auto...
              </span>
            ) : (
              <>Dernière sauvegarde: {lastSaved.toLocaleTimeString()}</>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
        {status !== "COMPLETED" && (
          <Button size="sm" onClick={onComplete}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}
