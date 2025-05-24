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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  job: z.string().optional().or(z.literal('')),
  height: z.number().optional(),
  weight: z.number().optional(),
  handedness: z.string().optional().or(z.literal('')),
  hasChildren: z.boolean().optional(),
  smoker: z.boolean().optional(),
  smokerSince: z.number().optional(),
  alcoholConsumption: z.string().optional().or(z.literal('')),
  sportActivity: z.string().optional().or(z.literal('')),
  medicalHistory: z.string().optional().or(z.literal('')),
  surgicalHistory: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  currentMedication: z.string().optional().or(z.literal('')),
  contraception: z.string().optional().or(z.literal('')),
  otherContraception: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const PatientForm = ({ patient, onSubmit, onSave }: PatientFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | undefined>(
    patient?.cabinetId || undefined
  );

  // Convertir gender pour correspondre aux types attendus
  const convertGender = (gender: string | null): "MALE" | "FEMALE" | "OTHER" | undefined => {
    if (!gender) return undefined;
    switch (gender) {
      case "Homme":
        return "MALE";
      case "Femme": 
        return "FEMALE";
      case "MALE":
      case "FEMALE":
      case "OTHER":
        return gender;
      default:
        return undefined;
    }
  };

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
      city: patient?.city || "",
      postalCode: patient?.postalCode || "",
      country: patient?.country || "",
      maritalStatus: patient?.maritalStatus || "",
      job: patient?.job || "",
      height: patient?.height || undefined,
      weight: patient?.weight || undefined,
      handedness: patient?.handedness || "",
      hasChildren: patient?.hasChildren === "true" || false,
      smoker: patient?.smoker || false,
      smokerSince: patient?.smokerSince || undefined,
      alcoholConsumption: patient?.alcoholConsumption || "",
      sportActivity: patient?.sportActivity || "",
      medicalHistory: patient?.medicalHistory || "",
      surgicalHistory: patient?.surgicalHistory || "",
      allergies: patient?.allergies || "",
      currentMedication: patient?.currentMedication || "",
      contraception: patient?.contraception || "",
      otherContraception: patient?.otherContraception || "",
      notes: patient?.notes || "",
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code Postal</FormLabel>
                        <FormControl>
                          <Input placeholder="Code Postal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input placeholder="Pays" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                    name="job"
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
                      <FormItem className="flex flex-row items-center p-3 rounded-md border">
                        <FormControl>
                          <Input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormLabel className="pl-2">A des enfants</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smoker"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center p-3 rounded-md border">
                        <FormControl>
                          <Input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormLabel className="pl-2">Fumeur</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smokerSince"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fumeur depuis (années)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Fumeur depuis (années)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="alcoholConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consommation d'alcool</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Consommation d'alcool"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sportActivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activité sportive</FormLabel>
                      <FormControl>
                        <Input placeholder="Activité sportive" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antécédents médicaux</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Antécédents médicaux"
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
                  name="currentMedication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médicaments actuels</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Médicaments actuels"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="otherContraception"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autre contraception</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Autre contraception"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </CardContent>
      </Card>
    </div>
  );
};
