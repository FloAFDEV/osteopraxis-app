
import React from "react";
import { Calendar, FileText, List, Activity, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Patient, Appointment, Invoice } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointment-card";
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { PatientInvoices } from "@/components/patients/patient-invoices";

interface PatientTabsProps {
  patient: Patient;
  appointments: Appointment[];
  invoices: Invoice[];
}

export function PatientTabs({ patient, appointments, invoices }: PatientTabsProps) {
  const upcomingAppointments = appointments
    .filter(appointment => new Date(appointment.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(appointment => new Date(appointment.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Tabs defaultValue="medical-info">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="medical-info">
          <FileText className="h-4 w-4 mr-2" />
          Dossier médical
        </TabsTrigger>
        <TabsTrigger value="upcoming-appointments">
          <Calendar className="h-4 w-4 mr-2" />
          RDV à venir
        </TabsTrigger>
        <TabsTrigger value="history">
          <List className="h-4 w-4 mr-2" />
          Historique
        </TabsTrigger>
        <TabsTrigger value="invoices">
          <FileText className="h-4 w-4 mr-2" />
          Factures
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="medical-info" className="space-y-6 mt-6">
        <MedicalInfoCard
          title="Médecins et spécialistes"
          items={[
            { label: "Médecin traitant", value: patient.generalPractitioner },
            { label: "Ophtalmologiste", value: patient.ophtalmologistName },
            { label: "ORL", value: patient.entDoctorName },
            { label: "Gastro-entérologue", value: patient.digestiveDoctorName }
          ]}
        />
        
        <MedicalInfoCard
          title="Antécédents médicaux"
          items={[
            { label: "Traitement actuel", value: patient.currentTreatment, showSeparatorAfter: true },
            { label: "Antécédents chirurgicaux", value: patient.surgicalHistory },
            { label: "Antécédents traumatiques", value: patient.traumaHistory },
            { label: "Antécédents rhumatologiques", value: patient.rheumatologicalHistory, showSeparatorAfter: true },
            { label: "Problèmes digestifs", value: patient.digestiveProblems },
            { label: "Problèmes ORL", value: patient.entProblems },
            { label: "Correction visuelle", value: patient.hasVisionCorrection ? "Oui" : "Non" }
          ]}
        />
      </TabsContent>
      
      <TabsContent value="upcoming-appointments" className="space-y-4 mt-6">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl font-medium">Aucun rendez-vous à venir</h3>
            <p className="text-muted-foreground mt-2">
              Ce patient n'a pas de rendez-vous planifié.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to={`/appointments/new?patientId=${patient.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Planifier un rendez-vous
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                patient={patient}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-4 mt-6">
        {pastAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl font-medium">Aucun historique</h3>
            <p className="text-muted-foreground mt-2">
              Ce patient n'a pas d'historique de rendez-vous.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pastAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                patient={patient}
              />
            ))}
          </div>
        )}
      </TabsContent>
    
      <TabsContent value="invoices" className="space-y-6 mt-6">
        <PatientInvoices invoices={invoices} />
      </TabsContent>
    </Tabs>
  );
}
