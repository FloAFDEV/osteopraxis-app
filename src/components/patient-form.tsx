import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { YearPicker } from "@/components/year-picker";
import { cn } from "@/lib/utils";
import { convertHasChildrenToBoolean } from "@/utils/patient-form-helpers";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types";
import { useState, useEffect } from "react";
import { DateInput } from "@/components/ui/date-input";

// Schéma de validation pour le formulaire patient
const patientSchema = z.object({
  address: z.string().optional(),
  email: z.string().email("Email invalide").optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  birthDate: z.date().optional().nullable(),
  childrenAges: z.array(z.number()).optional().nullable(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  gender: z.string().optional().nullable(),
  hasChildren: z.boolean().optional().nullable(),
  occupation: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  contraception: z.string().optional().nullable(),
  physicalActivity: z.string().optional().nullable(),
  isSmoker: z.boolean().optional().nullable(),
  generalPractitioner: z.string().optional().nullable(),
  ophtalmologistName: z.string().optional().nullable(),
  hasVisionCorrection: z.boolean().optional().nullable(),
  entDoctorName: z.string().optional().nullable(),
  entProblems: z.string().optional().nullable(),
  digestiveDoctorName: z.string().optional().nullable(),
  digestiveProblems: z.string().optional().nullable(),
  surgicalHistory: z.string().optional().nullable(),
  traumaHistory: z.string().optional().nullable(),
  rheumatologicalHistory: z.string().optional().nullable(),
  currentTreatment: z.string().optional().nullable(),
  handedness: z.string().optional().nullable(),
  familyStatus: z.string().optional().nullable()
});
export type PatientFormValues = z.infer<typeof patientSchema>;
interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: PatientFormValues) => Promise<void>;
  isLoading?: boolean;
}
export function PatientForm({
  patient,
  onSave,
  isLoading = false
}: PatientFormProps) {
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
      // Assurer que birthDate est un objet Date s'il existe
      birthDate: patient.birthDate ? typeof patient.birthDate === 'string' ? new Date(patient.birthDate) : patient.birthDate : null,
      // S'assurer que les valeurs null sont correctement gérées
      email: patient.email || "",
      phone: patient.phone || "",
      address: patient.address || "",
      occupation: patient.occupation || "",
      physicalActivity: patient.physicalActivity || "",
      generalPractitioner: patient.generalPractitioner || "",
      ophtalmologistName: patient.ophtalmologistName || "",
      entDoctorName: patient.entDoctorName || "",
      entProblems: patient.entProblems || "",
      digestiveDoctorName: patient.digestiveDoctorName || "",
      digestiveProblems: patient.digestiveProblems || "",
      surgicalHistory: patient.surgicalHistory || "",
      traumaHistory: patient.traumaHistory || "",
      rheumatologicalHistory: patient.rheumatologicalHistory || "",
      currentTreatment: patient.currentTreatment || ""
    } : {
      firstName: "",
      lastName: "",
      hasChildren: false,
      isSmoker: false,
      hasVisionCorrection: false,
      email: "",
      phone: ""
    }
  });

  // Console log des valeurs du formulaire pour debug
  useEffect(() => {
    console.log("Form values:", form.getValues());
  }, [form]);

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
    const ages = value.split(",").map(age => parseInt(age.trim())).filter(age => !isNaN(age) && age > 0);
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
      console.log("Submitting values:", values);
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
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          
          <CardContent className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="medical">Informations médicales</TabsTrigger>
                <TabsTrigger value="contacts">Contacts médicaux</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Prénom <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="lastName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Nom <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="birthDate" render={({
                  field
                }) => <FormItem className="flex flex-col">
                        <FormLabel>Date de naissance</FormLabel>
                        <FormControl>
                          <DateInput value={field.value} onChange={field.onChange} placeholder="JJ/MM/AAAA" format="dd/MM/yyyy" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="gender" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </FormItem>} />
                  <FormField control={form.control} name="email" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="phone" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="Téléphone" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="address" render={({
                  field
                }) => <FormItem className="col-span-2">
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="occupation" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="Profession" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="maritalStatus" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Statut marital</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </FormItem>} />
                  <div className="space-y-2">
                    <FormLabel>Enfants</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}>
                        -
                      </Button>
                      <span className="w-6 text-center">{childrenCount}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => setChildrenCount(childrenCount + 1)}>
                        +
                      </Button>
                    </div>
                  </div>
                  {childrenCount > 0 && <div className="space-y-2">
                      <FormLabel>Âges des enfants (séparés par des virgules)</FormLabel>
                      <Input placeholder="Ex: 3, 5, 7" value={childrenAgesInput} onChange={e => handleChildrenAgesChange(e.target.value)} />
                    </div>}
                </div>
              </TabsContent>
              <TabsContent value="medical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="physicalActivity" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Activité physique</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: natation, course à pied..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="handedness" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Latéralité</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </FormItem>} />
                  <FormField control={form.control} name="isSmoker" render={({
                  field
                }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Fumeur</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>} />
                  <FormField control={form.control} name="contraception" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Contraception</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </FormItem>} />
                  <FormField control={form.control} name="hasVisionCorrection" render={({
                  field
                }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Correction de la vision</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value || false} onCheckedChange={field.onChange} className="bg-blue-500 hover:bg-blue-400 " />
                        </FormControl>
                      </FormItem>} />
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <FormField control={form.control} name="currentTreatment" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Traitement actuel</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Détails du traitement actuel" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="surgicalHistory" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Antécédents chirurgicaux</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Interventions chirurgicales passées" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="traumaHistory" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Antécédents traumatiques</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Traumatismes, accidents..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="rheumatologicalHistory" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Antécédents rhumatologiques</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Problèmes articulaires, musculaires..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </TabsContent>
              <TabsContent value="contacts">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="generalPractitioner" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Médecin traitant</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du médecin traitant" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="ophtalmologistName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Ophtalmologue</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'ophtalmologue" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="entDoctorName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>ORL</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'ORL" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="entProblems" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Problèmes ORL</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: acouphènes, sinusites..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="digestiveDoctorName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Gastro-entérologue</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du gastro-entérologue" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="digestiveProblems" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Problèmes digestifs</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: reflux, colopathie..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Sauvegarde...
                </> : "Sauvegarder"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>;
}