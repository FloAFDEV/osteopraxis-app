/**
 * Formulaire de Compte-Rendu Ostéopathique
 * Stockage 100% local sécurisé (HDS)
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, FileText, Save, CheckCircle2 } from 'lucide-react';
import { hdsSecureConsultationReportService } from '@/services/hds-secure-storage/hds-secure-consultation-report-service';
import {
  ConsultationReport,
  CreateConsultationReportPayload,
  OSTEOPATHY_TECHNIQUES,
  TREATMENT_AREAS,
} from '@/types';

// ===========================================================================
// Schéma de validation Zod
// ===========================================================================

const consultationReportSchema = z.object({
  chiefComplaint: z.string().min(5, 'Le motif doit contenir au moins 5 caractères'),
  historyOfPresentIllness: z.string().optional(),
  painScale: z.number().min(0).max(10).optional(),
  observation: z.string().optional(),
  palpation: z.string().optional(),
  mobility: z.string().optional(),
  testsPerformed: z.array(z.string()).optional(),
  diagnosis: z.string().optional(),
  techniquesUsed: z.array(z.string()).optional(),
  treatmentNotes: z.string().optional(),
  treatmentAreas: z.array(z.string()).optional(),
  outcome: z.string().optional(),
  recommendations: z.string().optional(),
  nextAppointmentSuggested: z.string().optional(),
});

type ConsultationReportFormValues = z.infer<typeof consultationReportSchema>;

// ===========================================================================
// Props du composant
// ===========================================================================

interface ConsultationReportFormProps {
  patientId: number;
  appointmentId?: number;
  osteopathId: number;
  existingReport?: ConsultationReport;
  onSuccess?: (report: ConsultationReport) => void;
  onCancel?: () => void;
}

// ===========================================================================
// Composant principal
// ===========================================================================

export function ConsultationReportForm({
  patientId,
  appointmentId,
  osteopathId,
  existingReport,
  onSuccess,
  onCancel,
}: ConsultationReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(
    existingReport?.techniquesUsed || []
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    existingReport?.treatmentAreas || []
  );

  const form = useForm<ConsultationReportFormValues>({
    resolver: zodResolver(consultationReportSchema),
    defaultValues: {
      chiefComplaint: existingReport?.chiefComplaint || '',
      historyOfPresentIllness: existingReport?.historyOfPresentIllness || '',
      painScale: existingReport?.painScale || undefined,
      observation: existingReport?.observation || '',
      palpation: existingReport?.palpation || '',
      mobility: existingReport?.mobility || '',
      testsPerformed: existingReport?.testsPerformed || [],
      diagnosis: existingReport?.diagnosis || '',
      techniquesUsed: existingReport?.techniquesUsed || [],
      treatmentNotes: existingReport?.treatmentNotes || '',
      treatmentAreas: existingReport?.treatmentAreas || [],
      outcome: existingReport?.outcome || '',
      recommendations: existingReport?.recommendations || '',
      nextAppointmentSuggested: existingReport?.nextAppointmentSuggested || '',
    },
  });

  // Synchroniser les techniques sélectionnées avec le formulaire
  useEffect(() => {
    form.setValue('techniquesUsed', selectedTechniques);
  }, [selectedTechniques, form]);

  // Synchroniser les zones traitées avec le formulaire
  useEffect(() => {
    form.setValue('treatmentAreas', selectedAreas);
  }, [selectedAreas, form]);

  const onSubmit = async (data: ConsultationReportFormValues) => {
    setLoading(true);
    try {
      const reportData: CreateConsultationReportPayload = {
        patientId,
        appointmentId: appointmentId || null,
        osteopathId,
        date: new Date().toISOString(),
        chiefComplaint: data.chiefComplaint,
        historyOfPresentIllness: data.historyOfPresentIllness || null,
        painScale: data.painScale || null,
        observation: data.observation || null,
        palpation: data.palpation || null,
        mobility: data.mobility || null,
        testsPerformed: data.testsPerformed && data.testsPerformed.length > 0 ? data.testsPerformed : null,
        diagnosis: data.diagnosis || null,
        techniquesUsed: selectedTechniques.length > 0 ? selectedTechniques : null,
        treatmentNotes: data.treatmentNotes || null,
        treatmentAreas: selectedAreas.length > 0 ? selectedAreas : null,
        outcome: data.outcome || null,
        recommendations: data.recommendations || null,
        nextAppointmentSuggested: data.nextAppointmentSuggested || null,
      };

      let savedReport: ConsultationReport;

      if (existingReport) {
        // Mise à jour
        savedReport = await hdsSecureConsultationReportService.updateConsultationReport(
          existingReport.id,
          reportData
        );
        toast.success('✅ Compte-rendu mis à jour avec succès');
      } else {
        // Création
        savedReport = await hdsSecureConsultationReportService.createConsultationReport(reportData);
        toast.success('✅ Compte-rendu créé et sécurisé localement');
      }

      if (onSuccess) {
        onSuccess(savedReport);
      }
    } catch (error) {
      console.error('Erreur sauvegarde CR:', error);
      toast.error('❌ Erreur lors de la sauvegarde du compte-rendu');
    } finally {
      setLoading(false);
    }
  };

  const toggleTechnique = (technique: string) => {
    if (selectedTechniques.includes(technique)) {
      setSelectedTechniques(selectedTechniques.filter((t) => t !== technique));
    } else {
      setSelectedTechniques([...selectedTechniques, technique]);
    }
  };

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingReport ? 'Modifier le compte-rendu' : 'Nouveau compte-rendu ostéopathique'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            🔐 Les données sont stockées localement et chiffrées (AES-256-GCM)
          </p>
        </CardHeader>
      </Card>

      {/* Section 1 - Anamnèse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Anamnèse de la séance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">
              Motif principal de consultation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="chiefComplaint"
              placeholder="Ex: Lombalgie aiguë depuis 3 jours"
              {...form.register('chiefComplaint')}
            />
            {form.formState.errors.chiefComplaint && (
              <p className="text-sm text-red-500">{form.formState.errors.chiefComplaint.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyOfPresentIllness">Histoire de la maladie actuelle</Label>
            <Textarea
              id="historyOfPresentIllness"
              placeholder="Contexte, évolution, traitements antérieurs..."
              rows={4}
              {...form.register('historyOfPresentIllness')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="painScale">Échelle de douleur (0-10)</Label>
            <Input
              id="painScale"
              type="number"
              min="0"
              max="10"
              placeholder="5"
              {...form.register('painScale', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">0 = aucune douleur, 10 = douleur maximale</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 - Examen clinique */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Examen clinique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observation">Observation (statique/dynamique)</Label>
            <Textarea
              id="observation"
              placeholder="Posture, démarche, mobilité générale..."
              rows={3}
              {...form.register('observation')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="palpation">Palpation</Label>
            <Textarea
              id="palpation"
              placeholder="Zones de tension, points douloureux, textures tissulaires..."
              rows={3}
              {...form.register('palpation')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobility">Tests de mobilité</Label>
            <Textarea
              id="mobility"
              placeholder="Amplitudes articulaires, tests spécifiques..."
              rows={3}
              {...form.register('mobility')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3 - Tests et diagnostic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Tests et diagnostic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic ostéopathique</Label>
            <Textarea
              id="diagnosis"
              placeholder="Dysfonction somatique, restrictions de mobilité..."
              rows={3}
              {...form.register('diagnosis')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4 - Traitement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Traitement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Techniques utilisées */}
          <div className="space-y-2">
            <Label>Techniques utilisées</Label>
            <div className="flex flex-wrap gap-2">
              {OSTEOPATHY_TECHNIQUES.map((technique) => (
                <Badge
                  key={technique}
                  variant={selectedTechniques.includes(technique) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleTechnique(technique)}
                >
                  {selectedTechniques.includes(technique) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {technique}
                </Badge>
              ))}
            </div>
          </div>

          {/* Zones traitées */}
          <div className="space-y-2">
            <Label>Zones traitées</Label>
            <div className="flex flex-wrap gap-2">
              {TREATMENT_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleArea(area)}
                >
                  {selectedAreas.includes(area) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes détaillées */}
          <div className="space-y-2">
            <Label htmlFor="treatmentNotes">Notes détaillées du traitement</Label>
            <Textarea
              id="treatmentNotes"
              placeholder="Déroulement de la séance, réactions du patient..."
              rows={5}
              {...form.register('treatmentNotes')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 5 - Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. Conclusion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outcome">Résultat immédiat post-séance</Label>
            <Textarea
              id="outcome"
              placeholder="Amélioration de la mobilité, diminution de la douleur..."
              rows={3}
              {...form.register('outcome')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Conseils au patient</Label>
            <Textarea
              id="recommendations"
              placeholder="Repos, exercices, postures à adopter, hydratation..."
              rows={4}
              {...form.register('recommendations')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextAppointmentSuggested">Date suggérée du prochain rendez-vous</Label>
            <Input
              id="nextAppointmentSuggested"
              type="date"
              {...form.register('nextAppointmentSuggested')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingReport ? 'Mettre à jour' : 'Créer le compte-rendu'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
