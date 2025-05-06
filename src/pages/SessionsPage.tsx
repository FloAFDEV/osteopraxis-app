
import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { sessionService } from "@/services/api/session-service";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { SessionStatus as SessionStatusType } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, ListFilter, Grid, List, Plus, Search } from "lucide-react";
import { format, parseISO, isToday, addDays, isBefore, isAfter, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionStatus } from "@/components/session/SessionStatus";

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, patientsData] = await Promise.all([
          sessionService.getSessions(),
          api.getPatients(),
        ]);

        setSessions(sessionsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));

        // Créer un dictionnaire des patients pour un accès rapide
        const patientsDict: Record<number, Patient> = {};
        patientsData.forEach((patient: Patient) => {
          patientsDict[patient.id] = patient;
        });
        setPatients(patientsDict);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        toast.error("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les séances selon le filtre actif
  const getFilteredSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = addDays(today, 1);

    let filtered = [...sessions];
    
    // Filtre par date
    if (activeFilter === "today") {
      filtered = filtered.filter(session => isToday(parseISO(session.date)));
    } else if (activeFilter === "upcoming") {
      filtered = filtered.filter(session => isAfter(parseISO(session.date), today));
    } else if (activeFilter === "past") {
      filtered = filtered.filter(session => isBefore(parseISO(session.date), today));
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(session => {
        const patient = patients[session.patientId];
        if (!patient) return false;
        
        const patientFullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const reasonMatch = session.reason.toLowerCase().includes(query);
        
        return patientFullName.includes(query) || reasonMatch;
      });
    }
    
    return filtered;
  };

  const filteredSessions = getFilteredSessions();
  
  // Grouper les séances par date
  const groupSessionsByDate = () => {
    const grouped: Record<string, Appointment[]> = {};
    
    filteredSessions.forEach(session => {
      const date = format(parseISO(session.date), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    
    // Trier les séances dans chaque groupe par heure
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        parseISO(a.date).getTime() - parseISO(b.date).getTime()
      );
    });
    
    return grouped;
  };

  const groupedSessions = groupSessionsByDate();

  // Fonction pour obtenir le statut en français
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "SCHEDULED": return "Planifiée";
      case "IN_PROGRESS": return "En cours";
      case "COMPLETED": return "Terminée";
      case "CANCELED": return "Annulée";
      case "RESCHEDULED": return "Reportée";
      case "NO_SHOW": return "Absence";
      default: return status;
    }
  };

  // Fonction pour créer une séance immédiate (exemple)
  const createImmediateSession = async (patientId: number) => {
    try {
      await sessionService.createImmediateSession(patientId);
      toast.success("Séance immédiate créée avec succès");
      // Recharger les données
      const updatedSessions = await sessionService.getSessions();
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Erreur lors de la création de la séance immédiate:", error);
      toast.error("Impossible de créer la séance immédiate");
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-6xl">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-500" />
            Séances
          </h1>
          
          <Button asChild>
            <Link to="/sessions/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle séance
            </Link>
          </Button>
        </header>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par patient ou motif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                Toutes
              </Button>
              <Button
                variant={activeFilter === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("today")}
              >
                Aujourd'hui
              </Button>
              <Button
                variant={activeFilter === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("upcoming")}
              >
                À venir
              </Button>
              <Button
                variant={activeFilter === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("past")}
              >
                Passées
              </Button>
            </div>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-500">Chargement des séances...</p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Aucune séance trouvée</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? "Aucune séance ne correspond à votre recherche." : "Vous n'avez pas encore de séances."}
            </p>
            <Button asChild>
              <Link to="/sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle séance
              </Link>
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => {
              const patient = patients[session.patientId];
              const sessionDate = parseISO(session.date);
              
              return (
                <Link to={`/sessions/${session.id}/edit`} key={session.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm text-gray-500">
                          {format(sessionDate, "EEEE d MMMM yyyy", { locale: fr })}
                          <br />
                          {format(sessionDate, "HH:mm")}
                        </p>
                        <SessionStatus 
                          status={session.status as SessionStatusType} 
                          onStatusChange={() => {}}
                          showActions={false}
                        />
                      </div>
                      
                      <h3 className="font-medium text-lg mb-1 truncate">
                        {patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu"}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {session.reason}
                      </p>
                      
                      {session.notes && (
                        <div className="pt-3 border-t text-gray-500 text-sm line-clamp-2">
                          {session.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedSessions).sort((a, b) => {
              const dateA = new Date(a);
              const dateB = new Date(b);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Aujourd'hui en premier
              if (isSameDay(dateA, today) && !isSameDay(dateB, today)) return -1;
              if (!isSameDay(dateA, today) && isSameDay(dateB, today)) return 1;
              
              // Ensuite dates futures
              if (isAfter(dateA, today) && !isAfter(dateB, today)) return -1;
              if (!isAfter(dateA, today) && isAfter(dateB, today)) return 1;
              
              // Entre dates futures ou entre dates passées, tri chronologique
              return dateA.getTime() - dateB.getTime();
            }).map(date => {
              const displayDate = new Date(date);
              const isDateToday = isToday(displayDate);
              
              return (
                <div key={date} className="rounded-lg border overflow-hidden">
                  <div className={`px-4 py-3 ${isDateToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <h2 className={`text-lg font-semibold ${isDateToday ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                      {isDateToday ? 'Aujourd\'hui' : format(displayDate, "EEEE d MMMM yyyy", { locale: fr })}
                    </h2>
                  </div>
                  
                  <div className="divide-y">
                    {groupedSessions[date].map(session => {
                      const patient = patients[session.patientId];
                      const sessionTime = format(parseISO(session.date), "HH:mm");
                      
                      return (
                        <Link 
                          to={`/sessions/${session.id}/edit`} 
                          key={session.id}
                          className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="p-4 flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              <span className="text-lg font-medium">{sessionTime}</span>
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">
                                  {patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu"}
                                </h3>
                                <SessionStatus 
                                  status={session.status as SessionStatusType} 
                                  onStatusChange={() => {}}
                                  showActions={false}
                                />
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                {session.reason}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SessionsPage;
