
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, Patient, Cabinet, Osteopath } from "@/types";
import { Layout } from "@/components/ui/layout";
import { InvoiceForm } from "@/components/invoice-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const NewInvoicePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cabinet & ostéopathe sélectionnés
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);

  const [osteopaths, setOsteopaths] = useState<Osteopath[]>([]);
  const [selectedOsteopathId, setSelectedOsteopathId] = useState<number | null>(null);

  useEffect(() => {
    // Charger cabinets et ostéos dispo
    api.getCabinets().then(cabs => {
      setCabinets(cabs);
      if (cabs.length === 1) setSelectedCabinetId(cabs[0].id);
    });
    api.getOsteopaths().then(osts => {
      setOsteopaths(osts);
      if (osts.length === 1) setSelectedOsteopathId(osts[0].id);
    });
  }, []);

  useEffect(() => {
    const appointmentId = searchParams.get("appointmentId");
    if (appointmentId) {
      const fetchAppointmentAndPatient = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const appointment = await api.getAppointmentById(parseInt(appointmentId));
          if (appointment) {
            setAppointment(appointment);
            if (appointment.patientId) {
              const patient = await api.getPatientById(appointment.patientId);
              if (patient) setPatientData(patient);
            }
          } else {
            setError("Rendez-vous non trouvé");
            toast.error("Rendez-vous non trouvé");
          }
        } catch (error) {
          setError("Impossible de charger les données du rendez-vous");
          toast.error("Impossible de charger les données du rendez-vous");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAppointmentAndPatient();
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Empêcher l’édition tant que l’utilisateur n’a pas choisi un cabinet/ostéo (s’il y a au moins 2 choix)
  const needCabinetSelect = cabinets.length > 1;
  const needOsteopathSelect = osteopaths.length > 1;
  const isReady =
    (!needCabinetSelect || !!selectedCabinetId) &&
    (!needOsteopathSelect || !!selectedOsteopathId);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
            <Button onClick={() => navigate("/invoices")}>
              Retour aux factures
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold mb-4">Nouvelle Facture</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {needCabinetSelect && (
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium mb-1">Sélectionner un cabinet</label>
              <Select value={selectedCabinetId?.toString() || ""} onValueChange={val => setSelectedCabinetId(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le cabinet" />
                </SelectTrigger>
                <SelectContent>
                  {cabinets.map(cab => (
                    <SelectItem key={cab.id} value={cab.id.toString()}>
                      {cab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {needOsteopathSelect && (
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium mb-1">Sélectionner l’ostéopathe</label>
              <Select value={selectedOsteopathId?.toString() || ""} onValueChange={val => setSelectedOsteopathId(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir l’ostéopathe" />
                </SelectTrigger>
                <SelectContent>
                  {osteopaths.map(ost => (
                    <SelectItem key={ost.id} value={ost.id.toString()}>
                      {ost.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {!isReady ? (
          <div className="text-muted-foreground text-center py-10">Veuillez sélectionner un cabinet et un ostéopathe.</div>
        ) : (
          <InvoiceForm
            patient={patientData}
            appointment={appointment}
            onCreate={() => navigate("/invoices")}
            cabinetId={selectedCabinetId || undefined}
            osteopathId={selectedOsteopathId || undefined}
          />
        )}
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
