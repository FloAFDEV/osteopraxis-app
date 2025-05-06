
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, CheckCircle, XCircle, AlertCircle, MoreHorizontal, Play, Pause } from "lucide-react";
import { SessionStatus as SessionStatusType } from "@/types/session";

interface SessionStatusProps {
  status: SessionStatusType;
  onStatusChange: (status: SessionStatusType) => void;
  isEditing?: boolean;
  showActions?: boolean;
}

export function SessionStatus({
  status,
  onStatusChange,
  isEditing = false,
  showActions = true
}: SessionStatusProps) {
  const [isChanging, setIsChanging] = useState(false);

  const getStatusConfig = (status: SessionStatusType): {
    label: string;
    color: string;
    icon: React.ReactNode;
  } => {
    switch (status) {
      case "SCHEDULED":
        return {
          label: "Planifiée",
          color: "bg-blue-500 hover:bg-blue-600",
          icon: <Clock className="h-4 w-4" />
        };
      case "IN_PROGRESS":
        return {
          label: "En cours",
          color: "bg-amber-500 hover:bg-amber-600",
          icon: <Play className="h-4 w-4" />
        };
      case "COMPLETED":
        return {
          label: "Terminée",
          color: "bg-green-500 hover:bg-green-600",
          icon: <CheckCircle className="h-4 w-4" />
        };
      case "CANCELED":
        return {
          label: "Annulée",
          color: "bg-red-500 hover:bg-red-600",
          icon: <XCircle className="h-4 w-4" />
        };
      case "RESCHEDULED":
        return {
          label: "Reportée",
          color: "bg-purple-500 hover:bg-purple-600",
          icon: <Clock className="h-4 w-4" />
        };
      case "NO_SHOW":
        return {
          label: "Absence",
          color: "bg-gray-500 hover:bg-gray-600",
          icon: <AlertCircle className="h-4 w-4" />
        };
      default:
        return {
          label: "Inconnu",
          color: "bg-gray-500 hover:bg-gray-600",
          icon: <AlertCircle className="h-4 w-4" />
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const handleStatusChange = (newStatus: SessionStatusType) => {
    setIsChanging(true);
    onStatusChange(newStatus);
    setTimeout(() => setIsChanging(false), 500);
  };

  // Rendu du badge de statut sans actions
  if (!showActions || !isEditing) {
    return (
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        {statusConfig.icon}
        {statusConfig.label}
      </Badge>
    );
  }

  // Rendu avec menu d'actions
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 border-2 ${isChanging ? 'animate-pulse' : ''}`}
          size="sm"
        >
          <Badge className={`${statusConfig.color} flex items-center gap-1`}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-48">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleStatusChange("SCHEDULED")}
            disabled={status === "SCHEDULED"}
          >
            <Clock className="h-4 w-4 mr-2" />
            Planifiée
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={status === "IN_PROGRESS"}
          >
            <Play className="h-4 w-4 mr-2" />
            En cours
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={status === "COMPLETED"}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Terminée
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleStatusChange("CANCELED")}
            disabled={status === "CANCELED"}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Annulée
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleStatusChange("RESCHEDULED")}
            disabled={status === "RESCHEDULED"}
          >
            <Clock className="h-4 w-4 mr-2" />
            Reportée
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleStatusChange("NO_SHOW")}
            disabled={status === "NO_SHOW"}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Absence
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
