
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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TranslatedSelect from "@/components/ui/translated-select";

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
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Ajouter le cabinetId sélectionné aux données du patient
      const patientData = {
        ...data,
        cabinetId: selectedCabinetId,
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

              <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="account">Informations générales</TabsTrigger>
                  <TabsTrigger value="habits">Habitudes de vie</TabsTrigger>
                  <TabsTrigger value="history">Antécédents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date de naissance</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Choisir une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <FormControl>
                            <TranslatedSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              enumType="Gender"
                              placeholder="Sélectionner un genre"
                            />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situation maritale</FormLabel>
                          <FormControl>
                            <TranslatedSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              enumType="MaritalStatus"
                              placeholder="Sélectionner..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="Profession" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="habits" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taille (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Taille (cm)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poids (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Poids (kg)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="handedness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latéralité</FormLabel>
                          <FormControl>
                            <TranslatedSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              enumType="Handedness"
                              placeholder="Sélectionner..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasChildren"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>A des enfants</FormLabel>
                          <FormControl>
                            <Input placeholder="Oui/Non ou nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
