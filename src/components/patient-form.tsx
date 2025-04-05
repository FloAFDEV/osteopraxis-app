import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

const patientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").or(z.string().length(0)),
  phone: z.string().min(10, "Numéro de téléphone invalide").max(15),
  birthDate: z.date({
    required_error: "La date de naissance est requise",
  }),
  gender: z.string().min(1, "Le genre est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  occupation: z.string().optional(),
  referral: z.string().optional(),
  notes: z.string().optional(),
  medicalHistory: z.object({
    allergies: z.string().optional(),
    medications: z.string().optional(),
    surgeries: z.string().optional(),
    conditions: z.string().optional(),
  }),
  lifestyle: z.object({
    physicalActivity: z.string().optional(),
    smokingStatus: z.string().optional(),
    alcoholConsumption: z.string().optional(),
    sleepQuality: z.string().optional(),
    stressLevel: z.string().optional(),
  }),
  familyStatus: z.string().optional(),
  hasChildren: z.boolean().optional(),
  childrenAges: z.array(z.number()).optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormValues) => void;
  isSubmitting?: boolean;
}

export function PatientForm({ patient, onSubmit, isSubmitting = false }: PatientFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  
  const defaultValues: Partial<PatientFormValues> = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: undefined,
    gender: "",
    address: "",
    city: "",
    postalCode: "",
    occupation: "",
    referral: "",
    notes: "",
    medicalHistory: {
      allergies: "",
      medications: "",
      surgeries: "",
      conditions: "",
    },
    lifestyle: {
      physicalActivity: "",
      smokingStatus: "",
      alcoholConsumption: "",
      sleepQuality: "",
      stressLevel: "",
    },
    familyStatus: "",
    hasChildren: false,
    childrenAges: [],
  };

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          ...defaultValues,
          ...patient,
          birthDate: patient.birthDate ? new Date(patient.birthDate) : undefined,
        }
      : defaultValues,
  });

  const { register, handleSubmit, formState, control, watch, setValue } = form;
  const { errors } = formState;
  
  const hasChildren = watch("hasChildren");
  
  // Convert array of numbers to string for the input value
  const convertChildrenAgesToString = (ages: number[] | undefined) => {
    return ages ? ages.join(", ") : "";
  };
  
  // When reading from input, parse the string back to an array of numbers
  const parseChildrenAgesFromString = (agesString: string): number[] => {
    if (!agesString) return [];
    return agesString.split(",").map(age => parseInt(age.trim())).filter(age => !isNaN(age));
  };
  
  const childrenAgesValue = convertChildrenAgesToString(watch("childrenAges"));

  const handleFormSubmit = (data: PatientFormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="medical">Antécédents médicaux</TabsTrigger>
          <TabsTrigger value="lifestyle">Mode de vie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom <span className="text-destructive">*</span></Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Prénom"
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom <span className="text-destructive">*</span></Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Nom"
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date de naissance <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("birthDate") && "text-muted-foreground",
                          errors.birthDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("birthDate") ? (
                          format(watch("birthDate"), "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("birthDate")}
                        onSelect={(date) => setValue("birthDate", date as Date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.birthDate && (
                    <p className="text-sm text-destructive">{errors.birthDate.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Genre <span className="text-destructive">*</span></Label>
                  <Select
                    value={watch("gender")}
                    onValueChange={(value) => setValue("gender", value)}
                  >
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Sélectionner un genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homme">Homme</SelectItem>
                      <SelectItem value="Femme">Femme</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="email@exemple.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="06 12 34 56 78"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="123 rue de Paris"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      placeholder="75001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Paris"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Profession</Label>
                  <Input
                    id="occupation"
                    {...register("occupation")}
                    placeholder="Profession"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referral">Recommandé par</Label>
                  <Input
                    id="referral"
                    {...register("referral")}
                    placeholder="Comment avez-vous connu le cabinet ?"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label>Situation familiale</Label>
                  <RadioGroup
                    value={watch("familyStatus") || ""}
                    onValueChange={(value) => setValue("familyStatus", value)}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Célibataire" id="single" />
                      <Label htmlFor="single" className="cursor-pointer">Célibataire</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Marié(e)" id="married" />
                      <Label htmlFor="married" className="cursor-pointer">Marié(e)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Divorcé(e)" id="divorced" />
                      <Label htmlFor="divorced" className="cursor-pointer">Divorcé(e)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Veuf/Veuve" id="widowed" />
                      <Label htmlFor="widowed" className="cursor-pointer">Veuf/Veuve</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasChildren"
                    checked={watch("hasChildren")}
                    onCheckedChange={(checked) => {
                      setValue("hasChildren", checked === true);
                      if (!checked) setValue("childrenAges", []);
                    }}
                  />
                  <Label htmlFor="hasChildren" className="cursor-pointer">A des enfants</Label>
                </div>
                
                {hasChildren && (
                  <div className="space-y-2">
                    <Label htmlFor="childrenAges">Âges des enfants</Label>
                    <Input
                      id="childrenAges"
                      placeholder="Âges séparés par des virgules (ex: 3, 5, 7)"
                      value={childrenAgesValue}
                      onChange={(e) => {
                        setValue("childrenAges", parseChildrenAgesFromString(e.target.value));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Séparez les âges par des virgules</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    {...register("medicalHistory.allergies")}
                    placeholder="Allergies connues"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medications">Médicaments</Label>
                  <Textarea
                    id="medications"
                    {...register("medicalHistory.medications")}
                    placeholder="Médicaments actuels"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="surgeries">Chirurgies</Label>
                  <Textarea
                    id="surgeries"
                    {...register("medicalHistory.surgeries")}
                    placeholder="Interventions chirurgicales passées"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conditions">Conditions médicales</Label>
                  <Textarea
                    id="conditions"
                    {...register("medicalHistory.conditions")}
                    placeholder="Conditions médicales existantes"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lifestyle" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="physicalActivity">Activité physique</Label>
                  <Select
                    value={watch("lifestyle.physicalActivity") || ""}
                    onValueChange={(value) => setValue("lifestyle.physicalActivity", value)}
                  >
                    <SelectTrigger id="physicalActivity">
                      <SelectValue placeholder="Niveau d'activité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sédentaire">Sédentaire</SelectItem>
                      <SelectItem value="Légère">Légère (1-2 fois/semaine)</SelectItem>
                      <SelectItem value="Modérée">Modérée (3-4 fois/semaine)</SelectItem>
                      <SelectItem value="Intense">Intense (5+ fois/semaine)</SelectItem>
                      <SelectItem value="Athlète">Athlète professionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smokingStatus">Tabac</Label>
                  <Select
                    value={watch("lifestyle.smokingStatus") || ""}
                    onValueChange={(value) => setValue("lifestyle.smokingStatus", value)}
                  >
                    <SelectTrigger id="smokingStatus">
                      <SelectValue placeholder="Statut tabagique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Non-fumeur">Non-fumeur</SelectItem>
                      <SelectItem value="Ancien fumeur">Ancien fumeur</SelectItem>
                      <SelectItem value="Fumeur occasionnel">Fumeur occasionnel</SelectItem>
                      <SelectItem value="Fumeur régulier">Fumeur régulier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alcoholConsumption">Consommation d'alcool</Label>
                  <Select
                    value={watch("lifestyle.alcoholConsumption") || ""}
                    onValueChange={(value) => setValue("lifestyle.alcoholConsumption", value)}
                  >
                    <SelectTrigger id="alcoholConsumption">
                      <SelectValue placeholder="Consommation d'alcool" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aucune">Aucune</SelectItem>
                      <SelectItem value="Occasionnelle">Occasionnelle</SelectItem>
                      <SelectItem value="Modérée">Modérée</SelectItem>
                      <SelectItem value="Régulière">Régulière</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sleepQuality">Qualité du sommeil</Label>
                  <Select
                    value={watch("lifestyle.sleepQuality") || ""}
                    onValueChange={(value) => setValue("lifestyle.sleepQuality", value)}
                  >
                    <SelectTrigger id="sleepQuality">
                      <SelectValue placeholder="Qualité du sommeil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellente">Excellente</SelectItem>
                      <SelectItem value="Bonne">Bonne</SelectItem>
                      <SelectItem value="Moyenne">Moyenne</SelectItem>
                      <SelectItem value="Mauvaise">Mauvaise</SelectItem>
                      <SelectItem value="Très mauvaise">Très mauvaise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stressLevel">Niveau de stress</Label>
                  <Select
                    value={watch("lifestyle.stressLevel") || ""}
                    onValueChange={(value) => setValue("lifestyle.stressLevel", value)}
                  >
                    <SelectTrigger id="stressLevel">
                      <SelectValue placeholder="Niveau de stress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Très bas">Très bas</SelectItem>
                      <SelectItem value="Bas">Bas</SelectItem>
                      <SelectItem value="Modéré">Modéré</SelectItem>
                      <SelectItem value="Élevé">Élevé</SelectItem>
                      <SelectItem value="Très élevé">Très élevé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes générales</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Notes supplémentaires sur le patient"
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Navigation entre les onglets
            if (activeTab === "personal") {
              setActiveTab("medical");
            } else if (activeTab === "medical") {
              setActiveTab("lifestyle");
            } else {
              setActiveTab("personal");
            }
          }}
        >
          {activeTab === "lifestyle" ? "Retour aux informations personnelles" : "Onglet suivant"}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer le patient"}
        </Button>
      </div>
    </form>
  );
}
