
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient } from "@/types";
import { PatientFormProps, PatientFormValues } from "./patient-form/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CabinetSelector } from "@/components/cabinet/cabinet-selector";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TranslatedSelect from "@/components/ui/translated-select";
import { GeneralTab } from "./patient-form/GeneralTab";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'Homme', 'Femme']).optional(),
  address: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  height: z.number().optional(),
  weight: z.number().optional(),
  handedness: z.string().optional().or(z.literal('')),
  hasChildren: z.string().optional().or(z.literal('')),
  isSmoker: z.boolean().optional(),
  physicalActivity: z.string().optional().or(z.literal('')),
  surgicalHistory: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  contraception: z.string().optional().or(z.literal('')),
  cabinetId: z.number().optional(),
  childrenAges: z.array(z.number()).optional(),
});

// Fonction pour convertir les genres legacy
const convertGender = (gender: string | null): "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme" | null => {
  if (!gender) return null;
  return gender as "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme";
};

export const PatientForm = ({ patient, onSubmit, onSave }: PatientFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | undefined>(
    patient?.cabinetId || undefined
  );
  const [childrenAgesInput, setChildrenAgesInput] = useState<string>(
    patient?.childrenAges?.join(", ") || ""
  );
  const [currentCabinetId, setCurrentCabinetId] = useState<string | null>(
    patient?.cabinetId?.toString() || null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      birthDate: patient?.birthDate || "",
      gender: convertGender(patient?.gender as string),
      address: patient?.address || "",
      maritalStatus: patient?.maritalStatus || "",
      occupation: patient?.occupation || "",
      height: patient?.height || undefined,
      weight: patient?.weight || undefined,
      handedness: patient?.handedness || "",
      hasChildren: patient?.hasChildren || "",
      isSmoker: patient?.isSmoker || false,
      physicalActivity: patient?.physicalActivity || "",
      surgicalHistory: patient?.surgicalHistory || "",
      allergies: patient?.allergies || "",
      contraception: patient?.contraception || "",
      cabinetId: patient?.cabinetId || undefined,
      childrenAges: patient?.childrenAges || [],
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Traiter les âges des enfants
      let childrenAgesArray: number[] = [];
      if (childrenAgesInput.trim()) {
        childrenAgesArray = childrenAgesInput
          .split(",")
          .map((age) => parseInt(age.trim()))
          .filter((age) => !isNaN(age));
      }

      // Ajouter le cabinetId sélectionné aux données du patient
      const patientData = {
        ...data,
        cabinetId: selectedCabinetId,
        childrenAges: childrenAgesArray.length > 0 ? childrenAgesArray : null,
      };

      if (patient) {
        // Mode édition
        if (onSubmit || onSave) {
          await (onSubmit || onSave)?.(patientData);
        } else {
          await api.updatePatient({ ...patient, ...patientData });
          toast.success("Patient mis à jour avec succès");
          navigate("/patients");
        }
      } else {
        // Mode création
        await api.createPatient(patientData);
        toast.success("Patient créé avec succès");
        navigate("/patients");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du patient:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{patient ? "Modifier" : "Créer"} un patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Sélecteur de cabinet */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Cabinet <span className="text-red-500">*</span>
                </label>
                <CabinetSelector
                  selectedCabinetId={selectedCabinetId}
                  onCabinetChange={setSelectedCabinetId}
                  className="w-full"
                />
                {!selectedCabinetId && (
                  <p className="text-sm text-red-500 mt-1">
                    Veuillez sélectionner un cabinet
                  </p>
                )}
              </div>

              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">Informations générales</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="habits">Habitudes de vie</TabsTrigger>
                  <TabsTrigger value="history">Antécédents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <GeneralTab 
                    form={form}
                    childrenAgesInput={childrenAgesInput}
                    setChildrenAgesInput={setChildrenAgesInput}
                    currentCabinetId={currentCabinetId}
                    setCurrentCabinetId={setCurrentCabinetId}
                  />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="Téléphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="habits" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="physicalActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activité physique</FormLabel>
                        <FormControl>
                          <Input placeholder="Activité physique" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contraception"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraception</FormLabel>
                        <FormControl>
                          <TranslatedSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            enumType="Contraception"
                            placeholder="Sélectionner..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="surgicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antécédents chirurgicaux</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Antécédents chirurgicaux"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Input placeholder="Allergies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/patients")}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedCabinetId}
                >
                  {isSubmitting ? "Enregistrement..." : patient ? "Mettre à jour" : "Créer le patient"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
