import { supabase } from "@/integrations/supabase/client";
import { PatientRelationship, CreatePatientRelationshipPayload } from "@/types/patient-relationship";

export const patientRelationshipService = {
  // Récupérer toutes les relations d'un patient
  async getPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    const { data, error } = await supabase
      .from('patient_relationships')
      .select(`
        id,
        patient_id,
        related_patient_id,
        relationship_type,
        relationship_notes,
        created_at,
        updated_at
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des relations:', error);
      throw new Error('Impossible de récupérer les relations familiales');
    }

    // Récupérer les informations des patients liés séparément
    const result: PatientRelationship[] = [];
    if (data) {
      for (const relation of data) {
        const { data: patientData, error: patientError } = await supabase
          .from('Patient')
          .select('id, firstName, lastName, birthDate, gender')
          .eq('id', relation.related_patient_id)
          .single();

        if (!patientError && patientData) {
          result.push({
            ...relation,
            related_patient: patientData
          });
        }
      }
    }

    return result;
  },

  // Créer une nouvelle relation
  async createPatientRelationship(payload: CreatePatientRelationshipPayload): Promise<PatientRelationship> {
    const { data, error } = await supabase
      .from('patient_relationships')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la relation:', error);
      throw new Error('Impossible de créer la relation familiale');
    }

    // Récupérer les informations du patient lié
    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select('id, firstName, lastName, birthDate, gender')
      .eq('id', data.related_patient_id)
      .single();

    if (patientError) {
      console.error('Erreur lors de la récupération du patient lié:', patientError);
      throw new Error('Impossible de récupérer les informations du patient lié');
    }

    return {
      ...data,
      related_patient: patientData
    };
  },

  // Mettre à jour une relation
  async updatePatientRelationship(
    relationshipId: number, 
    updates: Partial<Omit<CreatePatientRelationshipPayload, 'patient_id' | 'related_patient_id'>>
  ): Promise<PatientRelationship> {
    const { data, error } = await supabase
      .from('patient_relationships')
      .update(updates)
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la relation:', error);
      throw new Error('Impossible de mettre à jour la relation familiale');
    }

    // Récupérer les informations du patient lié
    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select('id, firstName, lastName, birthDate, gender')
      .eq('id', data.related_patient_id)
      .single();

    if (patientError) {
      console.error('Erreur lors de la récupération du patient lié:', patientError);
      throw new Error('Impossible de récupérer les informations du patient lié');
    }

    return {
      ...data,
      related_patient: patientData
    };
  },

  // Supprimer une relation
  async deletePatientRelationship(relationshipId: number): Promise<void> {
    const { error } = await supabase
      .from('patient_relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      console.error('Erreur lors de la suppression de la relation:', error);
      throw new Error('Impossible de supprimer la relation familiale');
    }
  },

  // Récupérer toutes les relations bidirectionnelles d'un patient (en tant que patient_id OU related_patient_id)
  async getAllPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    // Relations directes
    const directRelations = await this.getPatientRelationships(patientId);
    
    // Relations inverses (où ce patient est le patient lié)
    const { data: inverseData, error: inverseError } = await supabase
      .from('patient_relationships')
      .select(`
        id,
        patient_id,
        related_patient_id,
        relationship_type,
        relationship_notes,
        created_at,
        updated_at
      `)
      .eq('related_patient_id', patientId);

    if (inverseError) {
      console.error('Erreur lors de la récupération des relations inverses:', inverseError);
      throw new Error('Impossible de récupérer les relations familiales');
    }

    // Traiter les relations inverses
    const inverseRelations: PatientRelationship[] = [];
    if (inverseData) {
      for (const relation of inverseData) {
        const { data: patientData, error: patientError } = await supabase
          .from('Patient')
          .select('id, firstName, lastName, birthDate, gender')
          .eq('id', relation.patient_id)
          .single();

        if (!patientError && patientData) {
          inverseRelations.push({
            ...relation,
            // Pour les relations inverses, le patient lié devient le patient principal
            patient_id: relation.related_patient_id,
            related_patient_id: relation.patient_id,
            related_patient: patientData
          });
        }
      }
    }

    return [...directRelations, ...inverseRelations];
  }
};

export default patientRelationshipService;