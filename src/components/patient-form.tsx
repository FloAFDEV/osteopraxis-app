
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Patient } from "@/types";
import { GeneralTab } from "./patient-form/GeneralTab";
import { ContactTab } from "./patient-form/ContactTab";
import { MedicalTab } from "./patient-form/MedicalTab";
import { PediatricTab } from "./patient-form/PediatricTab";
import { ExaminationsTab } from "./patient-form/ExaminationsTab";
import { AdditionalFieldsTab } from "./patient-form/AdditionalFieldsTab";
import { SpecializedFieldsTab } from "./patient-form/SpecializedFieldsTab";

interface PatientFormProps {
  patient?: Partial<Patient>;
  onSubmit: (patient: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>(patient || {});
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      toast.error("Veuillez remplir le prénom et le nom du patient");
      return;
    }

    try {
      await onSubmit(formData);
      toast.success("Patient enregistré avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement du patient");
    }
  };

  const updateFormData = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{patient?.id ? "Modifier le patient" : "Nouveau patient"}</CardTitle>
          <CardDescription>
            Remplissez les informations du patient dans les différents onglets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Responsive tabs list */}
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 mb-6 h-auto p-1 gap-1">
              <TabsTrigger 
                value="general" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Général</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Contact</span>
                <span className="sm:hidden">Tel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="medical" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Médical</span>
                <span className="sm:hidden">Méd</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pediatric" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Pédiatrie</span>
                <span className="sm:hidden">Péd</span>
              </TabsTrigger>
              <TabsTrigger 
                value="examinations" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Examens</span>
                <span className="sm:hidden">Ex</span>
              </TabsTrigger>
              <TabsTrigger 
                value="additional" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Additionnel</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger 
                value="specialized" 
                className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Spécialisé</span>
                <span className="sm:hidden">Sp</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="contact">
              <ContactTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="medical">
              <MedicalTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="pediatric">
              <PediatricTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="examinations">
              <ExaminationsTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="additional">
              <AdditionalFieldsTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="specialized">
              <SpecializedFieldsTab patient={formData} updateFormData={updateFormData} />
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default PatientForm;
