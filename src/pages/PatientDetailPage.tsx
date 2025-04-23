import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Calendar, FileText, MapPin, Mail, Phone, Activity, List, Heart, AlertCircle, Loader2, Edit, Plus, UserCheck, UserCircle, Users, ClipboardList, Stethoscope, History } from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { Patient, Appointment } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentCard } from "@/components/appointment-card";
import { Badge } from "@/components/ui/badge";
import { PatientStat } from "@/components/ui/patient-stat";
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { toast } from "sonner";
interface PatientDetailPageProps {}
const PatientDetailPage: React.FC<PatientDetailPageProps> = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setError("Patient ID is missing.");
          return;
        }
        const patientId = parseInt(id, 10);
        const patientData = await api.getPatientById(patientId);
        setPatient(patientData);
        const appointmentsData = await api.getAppointmentsByPatientId(patientId);
        setAppointments(appointmentsData);
      } catch (e: any) {
        setError(e.message || "Failed to load patient data.");
        toast.error("Impossible de charger les informations du patient. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id]);
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  const genderColors = {
    lightBg: patient?.gender === "Homme" ? "bg-blue-50" : patient?.gender === "Femme" ? "bg-red-50" : "bg-gray-50",
    darkBg: patient?.gender === "Homme" ? "dark:bg-blue-900" : patient?.gender === "Femme" ? "dark:bg-red-900" : "dark:bg-gray-800",
    textColor: patient?.gender === "Homme" ? "text-blue-500" : patient?.gender === "Femme" ? "text-red-500" : "text-gray-500"
  };
  const upcomingAppointments = appointments.filter(appointment => new Date(appointment.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastAppointments = appointments.filter(appointment => new Date(appointment.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (loading) {
    return <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>;
  }
  if (error || !patient) {
    return <Layout>
        <div className="flex flex-col justify-center items-center h-full">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-xl font-semibold text-center">
            {error || "Patient non trouvé"}
          </p>
          <Button variant="outline" asChild>
            <Link to="/patients">Retour à la liste des patients</Link>
          </Button>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="flex flex-col space-y-6">
        {/* Header section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/patients">Retour</Link>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/patients/${patient.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/appointments/new?patientId=${patient.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau rendez-vous
              </Link>
            </Button>
          </div>
        </div>

        {/* Patient overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PatientStat title="Total rendez-vous" value={appointments.length} icon={<Calendar className="h-5 w-5" />} colorClass="text-blue-500" />
          <PatientStat title="Rendez-vous à venir" value={upcomingAppointments.length} icon={<ClipboardList className="h-5 w-5" />} colorClass="text-purple-500" />
          <PatientStat title="En cours de traitement" value={patient.currentTreatment ? "Oui" : "Non"} icon={<Stethoscope className="h-5 w-5" />} colorClass="text-emerald-500" />
          <PatientStat title="Dernier rendez-vous" value={pastAppointments[0] ? format(new Date(pastAppointments[0].date), "dd/MM/yyyy") : "Aucun"} icon={<History className="h-5 w-5" />} colorClass="text-amber-500" />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Patient info */}
          <div className="space-y-6">
            <Card>
              <CardContent className={`p-6 ${genderColors.lightBg}`}>
                <div className="flex items-center space-x-4">
                  <Avatar className={`h-16 w-16 ${genderColors.darkBg} ${genderColors.textColor}`}>
                    <AvatarFallback className="bg-blue-200">{getInitials(patient.firstName, patient.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className={`text-2xl font-bold ${genderColors.textColor}`}>
                      {patient.firstName} {patient.lastName}
                    </CardTitle>
                    <CardDescription>
                      {patient.gender === "Homme" ? "Homme" : patient.gender === "Femme" ? "Femme" : "Non spécifié"}, {differenceInYears(new Date(), parseISO(patient.birthDate))} ans
                    </CardDescription>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${patient.email}`} className="hover:underline">
                      {patient.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MedicalInfoCard title="Informations personnelles" items={[{
            label: "Statut marital",
            value: patient.maritalStatus === "SINGLE" ? "Célibataire" : patient.maritalStatus === "MARRIED" ? "Marié(e)" : patient.maritalStatus === "DIVORCED" ? "Divorcé(e)" : patient.maritalStatus === "WIDOWED" ? "Veuf/Veuve" : patient.maritalStatus === "PARTNERED" ? "En couple" : patient.maritalStatus === "ENGAGED" ? "Fiancé(e)" : "Non spécifié"
          }, {
            label: "Enfants",
            value: patient.childrenAges && patient.childrenAges.length > 0 ? `${patient.childrenAges.length} enfant(s) (${patient.childrenAges.sort((a, b) => a - b).join(", ")} ans)` : "Pas d'enfants"
          }, {
            label: "Latéralité",
            value: patient.handedness === "RIGHT" ? "Droitier(ère)" : patient.handedness === "LEFT" ? "Gaucher(ère)" : patient.handedness === "AMBIDEXTROUS" ? "Ambidextre" : "Non spécifié"
          }, {
            label: "Fumeur",
            value: patient.isSmoker ? "Oui" : "Non"
          }, {
            label: "Contraception",
            value: patient.contraception === "NONE" ? "Aucune" : patient.contraception === "PILLS" ? "Pilule" : patient.contraception === "PATCH" ? "Patch" : patient.contraception === "RING" ? "Anneau vaginal" : patient.contraception === "IUD" ? "Stérilet" : patient.contraception === "IMPLANTS" ? "Implant" : patient.contraception === "CONDOM" ? "Préservatif" : patient.contraception === "DIAPHRAGM" ? "Diaphragme" : "Non spécifié"
          }]} />
          </div>

          {/* Right column - Tabs content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="medical-info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="medical-info">
                  <FileText className="h-4 w-4 mr-2" />
                  Dossier médical
                </TabsTrigger>
                <TabsTrigger value="upcoming-appointments">
                  <Calendar className="h-4 w-4 mr-2" />
                  Rendez-vous à venir
                </TabsTrigger>
                <TabsTrigger value="history">
                  <List className="h-4 w-4 mr-2" />
                  Historique
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="medical-info" className="space-y-6 mt-6">
                <MedicalInfoCard title="Médecins et spécialistes" items={[{
                label: "Médecin traitant",
                value: patient.generalPractitioner
              }, {
                label: "Ophtalmologiste",
                value: patient.ophtalmologistName
              }, {
                label: "ORL",
                value: patient.entDoctorName
              }, {
                label: "Gastro-entérologue",
                value: patient.digestiveDoctorName
              }]} />
                
                <MedicalInfoCard title="Antécédents médicaux" items={[{
                label: "Traitement actuel",
                value: patient.currentTreatment,
                showSeparatorAfter: true
              }, {
                label: "Antécédents chirurgicaux",
                value: patient.surgicalHistory
              }, {
                label: "Antécédents traumatiques",
                value: patient.traumaHistory
              }, {
                label: "Antécédents rhumatologiques",
                value: patient.rheumatologicalHistory,
                showSeparatorAfter: true
              }, {
                label: "Problèmes digestifs",
                value: patient.digestiveProblems
              }, {
                label: "Problèmes ORL",
                value: patient.entProblems
              }, {
                label: "Correction visuelle",
                value: patient.hasVisionCorrection ? "Oui" : "Non"
              }]} />
              </TabsContent>
              
              <TabsContent value="upcoming-appointments" className="space-y-4 mt-6">
                {upcomingAppointments.length === 0 ? <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-xl font-medium">Aucun rendez-vous à venir</h3>
                    <p className="text-muted-foreground mt-2">
                      Ce patient n'a pas de rendez-vous planifié.
                    </p>
                    <Button asChild variant="outline">
                      <Link to={`/appointments/new?patientId=${patient.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Planifier un rendez-vous
                      </Link>
                    </Button>
                  </div> : <div className="grid gap-4">
                    {upcomingAppointments.map(appointment => <AppointmentCard key={appointment.id} appointment={appointment} patient={patient} />)}
                  </div>}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-6">
                {pastAppointments.length === 0 ? <div className="text-center py-8">
                    <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-xl font-medium">Aucun historique</h3>
                    <p className="text-muted-foreground mt-2">
                      Ce patient n'a pas d'historique de rendez-vous.
                    </p>
                  </div> : <div className="grid gap-4">
                    {pastAppointments.map(appointment => <AppointmentCard key={appointment.id} appointment={appointment} patient={patient} />)}
                  </div>}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>;
};
export default PatientDetailPage;