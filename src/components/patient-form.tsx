
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { MaritalStatus, Gender, Handedness, Contraception } from "@/types";
import { toast } from "sonner";

// Définition du schéma de validation
const patientSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  email: z.string().email({ message: "L'email est invalide" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.date().optional(),
  address: z.string().optional(),
  gender: z.enum(["Homme", "Femme", "Autre"]).optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "PARTNERED", "ENGAGED", "SEPARATED"]).optional(),
  occupation: z.string().optional(),
  generalPractitioner: z.string().optional(),
  hasVisionCorrection: z.boolean().default(false),
  isSmoker: z.boolean().default(false),
  isDeceased: z.boolean().default(false),
  handedness: z.enum(["RIGHT", "LEFT", "AMBIDEXTROUS"]).optional(),
  contraception: z.enum(["NONE", "PILLS", "PATCH", "RING", "IUD", "IMPLANT", "CONDOM", "DIAPHRAGM", "INJECTION", "NATURAL_METHODS", "STERILIZATION"]).optional(),
  physicalActivity: z.string().optional(),
  hasChildren: z.string().default("false"),
  childrenAges: z.string().optional().transform(val => 
    val ? val.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v)) : []
  ),
  currentTreatment: z.string().optional(),
  digestiveDoctorName: z.string().optional(),
  digestiveProblems: z.string().optional(),
  entDoctorName: z.string().optional(),
  entProblems: z.string().optional(),
  ophtalmologistName: z.string().optional(),
  rheumatologicalHistory: z.string().optional(),
  surgicalHistory: z.string().optional(),
  traumaHistory: z.string().optional(),
  hdlm: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: any;
  onSubmit: (data: PatientFormValues) => void;
}

export const PatientForm = ({ patient, onSubmit }: PatientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialisation du formulaire avec les valeurs existantes si disponibles
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      ...patient,
      birthDate: patient.birthDate ? new Date(patient.birthDate) : undefined,
      childrenAges: patient.childrenAges ? patient.childrenAges.join(", ") : "",
    } : {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      hasVisionCorrection: false,
      isSmoker: false,
      isDeceased: false,
      hasChildren: "false",
      childrenAges: "",
    },
  });

  const handleSubmit = async (values: PatientFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'enregistrement du patient");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Informations personnelles</h3>

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
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "P", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Homme">Homme</SelectItem>
                      <SelectItem value="Femme">Femme</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SINGLE">Célibataire</SelectItem>
                      <SelectItem value="MARRIED">Marié(e)</SelectItem>
                      <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                      <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                      <SelectItem value="PARTNERED">En couple</SelectItem>
                      <SelectItem value="ENGAGED">Fiancé(e)</SelectItem>
                      <SelectItem value="SEPARATED">Séparé(e)</SelectItem>
                    </SelectContent>
                  </Select>
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

            <FormField
              control={form.control}
              name="hasChildren"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enfants</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="A des enfants ?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Oui</SelectItem>
                      <SelectItem value="false">Non</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("hasChildren") === "true" && (
              <FormField
                control={form.control}
                name="childrenAges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âges des enfants</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Âges séparés par des virgules (ex: 5, 7, 10)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Coordonnées</h3>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
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
                    <Input placeholder="Numéro de téléphone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse complète" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-medium mt-8">Informations médicales</h3>

            <FormField
              control={form.control}
              name="generalPractitioner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médecin traitant</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du médecin traitant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="hasVisionCorrection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Correction de la vue</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isSmoker"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Fumeur</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="handedness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main dominante</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la latéralité" />
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
              name="physicalActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activité physique</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Course à pied, natation..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Antécédents médicaux</h3>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="rheumatologicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antécédents rhumatologiques</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Antécédents rhumatologiques" {...field} />
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
                      <Textarea placeholder="Antécédents chirurgicaux" {...field} />
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
                      <Textarea placeholder="Antécédents traumatiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Autres informations</h3>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="currentTreatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traitement actuel</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Traitement actuel" {...field} />
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une contraception" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Aucune</SelectItem>
                        <SelectItem value="PILLS">Pilule</SelectItem>
                        <SelectItem value="PATCH">Patch</SelectItem>
                        <SelectItem value="RING">Anneau</SelectItem>
                        <SelectItem value="IUD">DIU/Stérilet</SelectItem>
                        <SelectItem value="IMPLANT">Implant</SelectItem>
                        <SelectItem value="CONDOM">Préservatif</SelectItem>
                        <SelectItem value="DIAPHRAGM">Diaphragme</SelectItem>
                        <SelectItem value="INJECTION">Injection</SelectItem>
                        <SelectItem value="NATURAL_METHODS">Méthodes naturelles</SelectItem>
                        <SelectItem value="STERILIZATION">Stérilisation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                Enregistrement...
              </>
            ) : (
              patient ? "Mettre à jour" : "Créer le patient"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
