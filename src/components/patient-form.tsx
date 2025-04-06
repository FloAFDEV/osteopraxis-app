
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatChildrenAges, convertHasChildrenToBoolean } from "@/utils/patient-form-helpers";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types";
import { useState, useEffect } from "react";

// Schéma de validation pour le formulaire patient
const patientSchema = z.object({
  address: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  birthDate: z.date().optional(),
  childrenAges: z.array(z.number()).optional(),
  firstName: z.string().min(1, "Prénom requis"),
  gender: z.string().optional(),
  hasChildren: z.boolean().optional(),
  lastName: z.string().min(1, "Nom requis"),
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  contraception: z.string().optional(),
  physicalActivity: z.string().optional(),
  isSmoker: z.boolean().optional(),
  generalPractitioner: z.string().optional(),
  ophtalmologistName: z.string().optional(),
  hasVisionCorrection: z.boolean().optional(),
  entDoctorName: z.string().optional(),
  entProblems: z.string().optional(),
  digestiveDoctorName: z.string().optional(),
  digestiveProblems: z.string().optional(),
  surgicalHistory: z.string().optional(),
  traumaHistory: z.string().optional(),
  rheumatologicalHistory: z.string().optional(),
  currentTreatment: z.string().optional(),
  handedness: z.string().optional(),
  familyStatus: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: PatientFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function PatientForm({ patient, onSave, isLoading = false }: PatientFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [childrenAgesInput, setChildrenAgesInput] = useState<string>("");

  // Initialiser le form avec les valeurs existantes ou valeurs par défaut
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      ...patient,
      // Convertir hasChildren de string à boolean si nécessaire
      hasChildren: convertHasChildrenToBoolean(patient.hasChildren),
      // Assurer que birthDate est un objet Date
      birthDate: patient.birthDate 
        ? (typeof patient.birthDate === 'string' 
            ? new Date(patient.birthDate) 
            : patient.birthDate)
        : undefined,
    } : {
      firstName: "",
      lastName: "",
      hasChildren: false,
      isSmoker: false,
      hasVisionCorrection: false
    },
  });

  // Mettre à jour le compteur d'enfants et le champ d'âges
  useEffect(() => {
    if (patient?.childrenAges && Array.isArray(patient.childrenAges)) {
      setChildrenCount(patient.childrenAges.length);
      setChildrenAgesInput(patient.childrenAges.join(", "));
    }
  }, [patient]);

  // Gérer les âges des enfants
  const handleChildrenAgesChange = (value: string) => {
    setChildrenAgesInput(value);
    
    // Convertir la chaîne en tableau d'âges (nombres)
    const ages = value
      .split(",")
      .map(age => parseInt(age.trim()))
      .filter(age => !isNaN(age) && age > 0);
    
    form.setValue("childrenAges", ages);
  };

  // Mettre à jour hasChildren quand childrenCount change
  useEffect(() => {
    if (childrenCount > 0) {
      form.setValue("hasChildren", true);
    } else {
      form.setValue("hasChildren", false);
      form.setValue("childrenAges", []);
      setChildrenAgesInput("");
    }
  }, [childrenCount, form]);

  // Gérer la soumission du formulaire
  const onSubmit = async (values: PatientFormValues) => {
    try {
      await onSave(values);
      toast.success(patient ? "Patient mis à jour avec succès" : "Patient créé avec succès");
      
      // Redirection après sauvegarde
      if (!patient) {
        navigate("/patients");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du patient:", error);
      toast.error("Erreur lors de la sauvegarde du patient");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{patient ? "Modifier le patient" : "Nouveau patient"}</CardTitle>
            <CardDescription>
              {patient ? "Mettez à jour les informations du patient" : "Entrez les informations du nouveau patient"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="medical">Informations médicales</TabsTrigger>
                <TabsTrigger value="contacts">Contacts médicaux</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
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
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "P", { locale: fr })
                                ) : (
                                  <span>Sélectionnez une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Homme">Homme</SelectItem>
                            <SelectItem value="Femme">Femme</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} value={field.value || ""} />
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
                          <Input placeholder="Téléphone" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse" {...field} value={field.value || ""} />
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
                          <Input placeholder="Profession" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut marital</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SINGLE">Célibataire</SelectItem>
                            <SelectItem value="MARRIED">Marié(e)</SelectItem>
                            <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                            <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                            <SelectItem value="SEPARATED">Séparé(e)</SelectItem>
                            <SelectItem value="ENGAGED">Fiancé(e)</SelectItem>
                            <SelectItem value="PARTNERED">Pacsé(e)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Enfants</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{childrenCount}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  {childrenCount > 0 && (
                    <div className="space-y-2">
                      <FormLabel>Âges des enfants (séparés par des virgules)</FormLabel>
                      <Input
                        placeholder="Ex: 3, 5, 7"
                        value={childrenAgesInput}
                        onChange={(e) => handleChildrenAgesChange(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="medical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="physicalActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activité physique</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: natation, course à pied..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="handedness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latéralité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="RIGHT">Droitier</SelectItem>
                            <SelectItem value="LEFT">Gaucher</SelectItem>
                            <SelectItem value="AMBIDEXTROUS">Ambidextre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSmoker"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Fumeur</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contraception"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraception</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Aucune</SelectItem>
                            <SelectItem value="PILLS">Pilule</SelectItem>
                            <SelectItem value="CONDOM">Préservatif</SelectItem>
                            <SelectItem value="IMPLANT">Implant</SelectItem>
                            <SelectItem value="DIAPHRAGM">Diaphragme</SelectItem>
                            <SelectItem value="IUD">Stérilet</SelectItem>
                            <SelectItem value="INJECTION">Injection</SelectItem>
                            <SelectItem value="PATCH">Patch</SelectItem>
                            <SelectItem value="RING">Anneau</SelectItem>
                            <SelectItem value="NATURAL_METHODS">Méthodes naturelles</SelectItem>
                            <SelectItem value="STERILIZATION">Stérilisation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasVisionCorrection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Correction de la vision</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="currentTreatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Traitement actuel</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Détails du traitement actuel" {...field} value={field.value || ""} />
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
                          <Textarea placeholder="Interventions chirurgicales passées" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="traumaHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antécédents traumatiques</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Traumatismes, accidents..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rheumatologicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antécédents rhumatologiques</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Problèmes articulaires, musculaires..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="contacts">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="generalPractitioner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médecin traitant</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du médecin traitant" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ophtalmologistName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ophtalmologue</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'ophtalmologue" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entDoctorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ORL</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'ORL" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entProblems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problèmes ORL</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: acouphènes, sinusites..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="digestiveDoctorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gastro-entérologue</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du gastro-entérologue" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="digestiveProblems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problèmes digestifs</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: reflux, colopathie..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
