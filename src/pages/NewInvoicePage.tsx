
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

const NewInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // Fetch patients when the component mounts
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        // const patientsData = await api.getPatients();
        // setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Erreur lors du chargement des patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        // Since getConsultations doesn't exist, let's use a workaround
        // Either implement the missing function or use a default empty array:
        setConsultations([]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching consultations:", error);
        toast.error("Erreur lors du chargement des consultations");
        setIsLoading(false);
      }
    };

    if (selectedPatient) {
      fetchConsultations();
    }
  }, [selectedPatient]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // Handle invoice submission logic here
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => navigate("/invoices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux factures
          </Button>

          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Nouvelle Facture
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez une nouvelle facture pour un patient
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient</Label>
              <Input
                type="text"
                id="patient"
                placeholder="Sélectionner un patient"
                value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : ""}
                readOnly
                onClick={() => navigate("/patients")}
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit">Créer la facture</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
