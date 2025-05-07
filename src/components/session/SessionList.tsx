
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Clock, Edit, Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export interface SessionItem {
  id: number;
  date: Date | string;
  motif: string;
  status: "DRAFT" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  patientId: number;
}

interface SessionListProps {
  sessions: SessionItem[];
}

export function SessionList({ sessions }: SessionListProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMMM yyyy à HH:mm", { locale: fr });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Edit className="h-4 w-4 text-amber-500" />;
      case "PLANNED":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "IN_PROGRESS":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Brouillon";
      case "PLANNED":
        return "Planifiée";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminée";
      default:
        return status;
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Descending order
  });

  return (
    <div className="rounded-md border">
      {sortedSessions.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Aucune séance trouvée pour ce patient.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">
                  {formatDate(session.date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(session.status)}
                    <span>{getStatusLabel(session.status)}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {session.motif}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/sessions/${session.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
