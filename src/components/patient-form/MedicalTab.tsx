
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PatientFormValues } from "./types";

interface MedicalTabProps {
  form: UseFormReturn<PatientFormValues>;
  isChild: boolean;
}

export function MedicalTab({ form, isChild }: MedicalTabProps) {
  return (
    <div className="space-y-8">
      {/* Bloc général en grille 2 colonnes sur desktop, 1 sur mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <Label htmlFor="generalPractitioner">Médecin traitant</Label>
          <Input id="generalPractitioner" {...form.register("generalPractitioner")} placeholder="Nom du médecin traitant" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="currentTreatment">Traitement en cours</Label>
          <Textarea id="currentTreatment" {...form.register("currentTreatment")} placeholder="Traitements médicaux en cours" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="allergies">Allergies</Label>
          <Input id="allergies" {...form.register("allergies")} placeholder="Allergies connues" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="familyStatus">Antécédents médicaux familiaux</Label>
          <Textarea id="familyStatus" {...form.register("familyStatus")} placeholder="Antécédents familiaux" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="surgicalHistory">Chirurgie</Label>
          <Textarea id="surgicalHistory" {...form.register("surgicalHistory")} placeholder="Historique des chirurgies" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="traumaHistory">Traumatismes</Label>
          <Textarea id="traumaHistory" {...form.register("traumaHistory")} placeholder="Traumatismes subis" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="fracture_history">Fractures</Label>
          <Input id="fracture_history" {...form.register("fracture_history")} placeholder="Historique des fractures" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="rheumatologicalHistory">Rhumatologie</Label>
          <Textarea id="rheumatologicalHistory" {...form.register("rheumatologicalHistory")} placeholder="Antécédents rhumatologiques" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="physicalActivity">Activité physique</Label>
          <Input id="physicalActivity" {...form.register("physicalActivity")} placeholder="Type d'activité physique" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="sport_frequency">Fréquence sportive</Label>
          <Input id="sport_frequency" {...form.register("sport_frequency")} placeholder="Fréquence de pratique sportive" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="sleep_quality">Qualité du sommeil</Label>
          <Input id="sleep_quality" {...form.register("sleep_quality")} placeholder="Ex : bonne, mauvaise, trouble..." />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="hasVisionCorrection">Correction de la vue</Label>
          <div className="flex items-center gap-3">
            <Switch checked={form.watch("hasVisionCorrection")} onCheckedChange={val => form.setValue("hasVisionCorrection", val)} />
            <span>{form.watch("hasVisionCorrection") ? "Oui" : "Non"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="ophtalmologistName">Ophtalmologue</Label>
          <Input id="ophtalmologistName" {...form.register("ophtalmologistName")} placeholder="Nom de l'ophtalmologue" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="dental_health">Santé dentaire</Label>
          <Input id="dental_health" {...form.register("dental_health")} placeholder="Ex : problème, douleur, suivi..." />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="entProblems">Problèmes ORL</Label>
          <Textarea id="entProblems" {...form.register("entProblems")} placeholder=" Problèmes ORL (ex : otites...)" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="entDoctorName">Médecin ORL</Label>
          <Input id="entDoctorName" {...form.register("entDoctorName")} placeholder="Nom du médecin ORL" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="ent_followup">Suivi ORL</Label>
          <Input id="ent_followup" {...form.register("ent_followup")} placeholder="Type de suivi" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="digestiveProblems">Problèmes digestifs</Label>
          <Textarea id="digestiveProblems" {...form.register("digestiveProblems")} placeholder="Problèmes digestifs" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="intestinal_transit">Transit intestinal</Label>
          <Input id="intestinal_transit" {...form.register("intestinal_transit")} placeholder="Ex : normal, problème, trouble..." />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="digestiveDoctorName">Médecin digestif</Label>
          <Input id="digestiveDoctorName" {...form.register("digestiveDoctorName")} placeholder="Nom du médecin digestif" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="complementaryExams">Examens complémentaires</Label>
          <Textarea id="complementaryExams" {...form.register("complementaryExams")} placeholder="Examens complémentaires effectués" />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="generalSymptoms">Symptômes généraux</Label>
          <Textarea id="generalSymptoms" {...form.register("generalSymptoms")} placeholder="Symptômes généraux" />
        </div>
        {/* Gynécologique/adulte */}
        {!isChild && (
          <>
            <div className="flex flex-col gap-4">
              <Label htmlFor="contraception">Contraception</Label>
              <Input id="contraception" {...form.register("contraception")} placeholder="Type de contraception" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="contraception_notes">Précisions contraception</Label>
              <Textarea id="contraception_notes" {...form.register("contraception_notes")} placeholder="Précisions, effets secondaires, etc." />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="gynecological_history">Antécédents gynécologiques</Label>
              <Textarea id="gynecological_history" {...form.register("gynecological_history")} placeholder="Antécédents gynécologiques" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="other_comments_adult">Autres commentaires</Label>
              <Textarea id="other_comments_adult" {...form.register("other_comments_adult")} placeholder="Autres commentaires adultes" />
            </div>
          </>
        )}
        {/* Pédiatrie/enfant */}
        {isChild && (
          <>
            <div className="flex flex-col gap-4">
              <Label htmlFor="pregnancyHistory">Grossesse</Label>
              <Textarea id="pregnancyHistory" {...form.register("pregnancyHistory")} placeholder="Description grossesse / complications" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="birthDetails">Naissance</Label>
              <Textarea id="birthDetails" {...form.register("birthDetails")} placeholder="Modalités de naissance" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="apgar_score">Score APGAR</Label>
              <Input id="apgar_score" {...form.register("apgar_score")} placeholder="Score APGAR" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="weight_at_birth">Poids à la naissance (g)</Label>
              <Input id="weight_at_birth" type="number" {...form.register("weight_at_birth")} placeholder="Poids à la naissance en grammes" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="height_at_birth">Taille à la naissance (cm)</Label>
              <Input id="height_at_birth" type="number" {...form.register("height_at_birth")} placeholder="Taille à la naissance en cm" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="head_circumference">Périmètre crânien (cm)</Label>
              <Input id="head_circumference" type="number" {...form.register("head_circumference")} placeholder="Périmètre crânien en cm" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="developmentMilestones">Développement moteur</Label>
              <Textarea id="developmentMilestones" {...form.register("developmentMilestones")} placeholder="Développement moteur (retard, particularités...)" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="fine_motor_skills">Motricité fine</Label>
              <Input id="fine_motor_skills" {...form.register("fine_motor_skills")} placeholder="Appréciation motricité fine" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="gross_motor_skills">Motricité globale</Label>
              <Input id="gross_motor_skills" {...form.register("gross_motor_skills")} placeholder="Appréciation motricité globale" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="sleepingPattern">Sommeil</Label>
              <Input id="sleepingPattern" {...form.register("sleepingPattern")} placeholder="Habitudes et troubles du sommeil" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="feeding">Alimentation</Label>
              <Input id="feeding" {...form.register("feeding")} placeholder="Habitudes alimentaires" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="behavior">Comportement</Label>
              <Input id="behavior" {...form.register("behavior")} placeholder="Problèmes de comportement" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="childcare_type">Mode de garde</Label>
              <Input id="childcare_type" {...form.register("childcare_type")} placeholder="Type de garde (crèche, nounou, etc.)" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="childCareContext">Contexte de garde</Label>
              <Input id="childCareContext" {...form.register("childCareContext")} placeholder="Précisions sur la garde" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="school_grade">Niveau scolaire</Label>
              <Input id="school_grade" {...form.register("school_grade")} placeholder="Niveau scolaire actuel" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="pediatrician_name">Pédiatre</Label>
              <Input id="pediatrician_name" {...form.register("pediatrician_name")} placeholder="Nom du pédiatre" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="paramedical_followup">Suivis paramédicaux</Label>
              <Input id="paramedical_followup" {...form.register("paramedical_followup")} placeholder="Type de suivis paramédicaux" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="other_comments_child">Autres commentaires</Label>
              <Textarea id="other_comments_child" {...form.register("other_comments_child")} placeholder="Commentaires complémentaires" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
