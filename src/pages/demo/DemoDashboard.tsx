import { useDemo } from "@/contexts/DemoContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, Euro, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

export default function DemoDashboard() {
  const { demoData } = useDemo();

  // Calculs des statistiques
  const stats = {
    totalPatients: demoData.patients.length,
    appointmentsToday: demoData.appointments.filter(
      a => isToday(new Date(a.date)) && a.status !== 'CANCELED'
    ).length,
    appointmentsTomorrow: demoData.appointments.filter(
      a => isTomorrow(new Date(a.date)) && a.status !== 'CANCELED'
    ).length,
    appointmentsThisWeek: demoData.appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return isWithinInterval(appointmentDate, {
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date())
      }) && a.status !== 'CANCELED';
    }).length,
    pendingInvoices: demoData.invoices.filter(i => i.paymentStatus === 'PENDING').length,
    pendingAmount: demoData.invoices
      .filter(i => i.paymentStatus === 'PENDING')
      .reduce((sum, i) => sum + i.amount, 0),
    monthlyRevenue: demoData.invoices
      .filter(i => i.paymentStatus === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0),
    completedAppointments: demoData.appointments.filter(a => a.status === 'COMPLETED').length
  };

  // Prochains rendez-vous
  const upcomingAppointments = demoData.appointments
    .filter(a => new Date(a.date) >= new Date() && a.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Patients récents
  const recentPatients = demoData.patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Bonjour Dr. {demoData.osteopath.name.split(' ')[1]} ! 👋
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité dans cette démo interactive
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +2 ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.appointmentsTomorrow} demain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingAmount}€ à encaisser
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA du mois</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue}€</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prochains rendez-vous */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prochains rendez-vous
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/demo/calendar">Voir le calendrier</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun rendez-vous prévu
                  </p>
                ) : (
                  upcomingAppointments.map((appointment) => {
                    const patient = demoData.patients.find(p => p.id === appointment.patientId);
                    const appointmentDate = new Date(appointment.date);
                    
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
                            {isToday(appointmentDate) && (
                              <Badge variant="default" className="text-xs">Aujourd'hui</Badge>
                            )}
                            {isTomorrow(appointmentDate) && (
                              <Badge variant="secondary" className="text-xs">Demain</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium">
                            {format(appointmentDate, "EEEE d MMMM", { locale: fr })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(appointmentDate, "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients récents */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patients récents
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/demo/patients">Voir tous</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-foreground">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{patient.occupation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(patient.createdAt), "d MMM", { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/demo/patients">
                <Users className="h-6 w-6" />
                <span>Ajouter un patient</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/demo/calendar">
                <Calendar className="h-6 w-6" />
                <span>Nouveau RDV</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/demo/invoices">
                <FileText className="h-6 w-6" />
                <span>Créer une facture</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/demo/stats">
                <TrendingUp className="h-6 w-6" />
                <span>Voir les stats</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message de démonstration */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary mb-2">
                🎯 Vous êtes en mode démonstration
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explorez toutes les fonctionnalités avec des données fictives. 
                Aucune modification ne sera sauvegardée, mais vous pouvez naviguer et tester librement !
              </p>
              <Button asChild>
                <Link to="/register">Créer mon vrai compte maintenant</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}