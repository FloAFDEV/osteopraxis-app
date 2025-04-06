
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft, EuroIcon } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { toast } from "sonner";

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("60.00");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [description, setDescription] = useState<string>("Consultation d'ostéopathie");

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => await api.getPatients(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId) {
      toast.error("Veuillez sélectionner un patient");
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    
    try {
      const invoiceData = {
        patientId: parseInt(selectedPatientId),
        consultationId: null, // Option pour lier à une consultation future
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        paymentStatus: 'PENDING',
        description: description
      };
      
      const result = await api.createInvoice(invoiceData);
      toast.success("Facture créée avec succès");
      navigate(`/invoices/${result.id}`);
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      toast.error("Erreur lors de la création de la facture");
    }
  };

  return (
    <Layout>
      <Card className="max-w-3xl mx-auto border-none shadow-sm">
        <CardHeader className="pb-4">
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
              <CardTitle className="text-2xl">Nouvelle facture</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select
                  value={selectedPatientId}
                  onValueChange={(value) => setSelectedPatientId(value)}
                >
                  <SelectTrigger id="patient" className="w-full">
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Chargement des patients...
                      </SelectItem>
                    ) : patients && patients.length > 0 ? (
                      patients.map((patient: Patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Aucun patient disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (€)</Label>
                  <div className="relative">
                    <EuroIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/invoices')}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Créer la facture
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default NewInvoicePage;
