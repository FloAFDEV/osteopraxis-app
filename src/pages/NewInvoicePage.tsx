
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "sonner";
import { FileText, ArrowLeft, Activity, Plus, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [amount, setAmount] = useState("50");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId) {
      toast.error("Veuillez sélectionner un patient");
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.createInvoice({
        patientId: selectedPatientId,
        consultationId: 0, // Placeholder ID, adjust as needed
        date: new Date(date).toISOString(),
        amount: parseFloat(amount),
        paymentStatus: "PENDING"
      });
      
      toast.success("Facture créée avec succès");
      navigate("/invoices");
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      toast.error("Une erreur est survenue lors de la création de la facture");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full" 
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold">Nouvelle Facture</h1>
          </div>
        </div>
      </div>
      
      <Card className="max-w-2xl mx-auto border-t-4 border-t-amber-500 dark:border-t-amber-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            Créer une nouvelle facture
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                      disabled={isLoadingPatients}
                    >
                      {selectedPatientId && patients
                        ? patients.find((patient) => patient.id === selectedPatientId)?.firstName + " " +
                          patients.find((patient) => patient.id === selectedPatientId)?.lastName
                        : "Sélectionner un patient"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher un patient..." />
                      <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                      <CommandGroup>
                        {patients?.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={`${patient.firstName} ${patient.lastName}`}
                            onSelect={() => {
                              setSelectedPatientId(patient.id);
                              setOpen(false);
                            }}
                          >
                            {patient.firstName} {patient.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 text-xs text-amber-600 dark:text-amber-500"
                    onClick={() => navigate("/patients/new")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Nouveau patient
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date de facturation</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Statut de paiement</Label>
                <Select defaultValue="PENDING">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Payée</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CANCELED">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                  disabled={isSubmitting || isLoadingPatients}
                >
                  {isSubmitting ? "Création en cours..." : "Créer la facture"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default NewInvoicePage;
